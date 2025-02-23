"use client";
import Image from "next/image";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { useEffect, useRef, useState } from "react";

const getVideoPath = (path: string) => {
  const basePath = process.env.NODE_ENV === "production" ? "/jastron" : "";
  return `${basePath}${path}`;
};

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(
      vertexShader,
      `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }`
    );
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(
      fragmentShader,
      `#version 300 es
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      out vec4 fragColor;

      #define BC vec3(.26,.4,.6)
      #define h21(p) (fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453))

      float noise(vec2 f) {
        vec2 i = floor(f);
        f -= i;
        vec2 u = f*f*(3.0-2.0*f);
        return mix(
          mix(h21(i + vec2(0,0)), h21(i + vec2(1,0)), u.x),
          mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), u.x),
          u.y
        );
      }

      vec4 getHex(vec2 p) {
        vec2 s = vec2(1.0, 1.7320508);
        vec4 hC = floor(vec4(p, p - vec2(.5, 1))/s.xyxy) + .5;
        vec4 h = vec4(p - hC.xy*s, p - (hC.zw + .5)*s);
        return dot(h.xy, h.xy)<dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw + .5);
      }

      vec3 HexToSqr(vec2 st, out vec2 uf) {
        vec3 r;
        uf = vec2((st.x+st.y*1.73),(st.x-st.y*1.73))-.5;
        if (st.y > 0.-abs(st.x)*0.57777)
          if (st.x > 0.) 
            r = vec3(fract(vec2(-st.x,(st.y+st.x/1.73)*0.86)*2.),2.);
          else
            r = vec3(fract(vec2(st.x,(st.y-st.x/1.73)*0.86)*2.),3.);
        else 
          r = vec3(fract(uf+.5),1.);
        return r;
      }

      void sphere(vec4 hx, vec2 st, float sm, out vec4 R) {
        R = vec4(0.0);
        float T = mod(time + h21(hx.zw*20.)*20., 20.);
        float d = .4* ((T < 3.) ? sin(T*.52) : 
                      (T < 6.) ? 1. :   
                      (T < 9.) ? sin((9.-T)*.52) : 0.);
        float y = .4* ((T < 4.) ? sin((T-1.)*.52) :  
                      (T < 5.5) ? 1. :   
                      (T < 8.5) ? sin((8.5-T)*.52) : 0.) - .06;
        
        float f = (.9 + noise(vec2(hx.x*50.+time*4.))*0.3) 
                  * smoothstep(-.57,1.7,st.y-st.x);

        R = mix(vec4(0), vec4(BC*f,1.), smoothstep(d+sm, d-sm, length(st)));
        R = mix(R, vec4(BC*.5,1.), 
                smoothstep(sm, -sm, abs(length(st)-d)-.02)*smoothstep(0.,.02,d));

        f = noise(hx.xy*vec2(12,7)+vec2(0,time*-4.))*0.25+0.5;

        R = mix(R, 
            vec4(mix(vec3(BC*8.)*f, vec3(.15,.1,.1),
                sin(T*.48-1.8))*(smoothstep(.1,.2,length(hx.xy+vec2(.0,y)))*.5 + .5)
                *(smoothstep(-.02,-.52,hx.y)),1.),
            smoothstep(.2+sm,.2-sm,length(hx.xy+vec2(.0,y)))
            *((st.y-st.x >0.) ? 1. : smoothstep(d-.02+sm, d-.02-sm, abs(length(st))))
        );
      }

      void pixel(float hh, float sm, vec2 st, vec2 s, float n, vec4 R, inout vec4 C) {
        st = vec2(st.x,1.-st.y);
        vec2 lc = 1.-fract(st*10.);
        vec2 id = floor(st*10.) + s;

        float b = ((4.-n)*2.2+.8)*.05;
        float th = .05;
        float T = mod(time+hh*20.,20.);
        float d = ((T < 3.) ? sin((T)*.52) :  
                  (T < 6.5) ? 1. :   
                  (T < 9.5) ? sin((9.5-T)*.52) : 0.);
        float f = min(
          (pow(noise(id*hh*n+time*(.75+h21(id)*.15)*1.),8.)*2. 
          + (noise(id*.2 + time*(.5+hh*n)*.5)-.1))
          * smoothstep(6.,2.,length(id-4.5))
          * ((n == 1.) ? (smoothstep(d*5., d*5.+2. ,length(id-4.5)+.5)) : 1.)
          , 0.95);

        vec4 P = vec4(BC*(1.+hh*.75)*b,1.);
        if (s == vec2(0)) C = mix(P*.7, P*.9, step(0.,lc.x-lc.y));

        vec2 m = s*2.-1.;
        
        if (s.x!=s.y) C = mix(C
                              , mix(P*.7, P*.9, step(lc.x-lc.y,0.))
                              , step(lc.x+lc.y,f+f)
                      *((m.y==-1.)?step(lc.x-lc.y+1.,1.):step(1.,lc.x-lc.y+1.)));
        C = mix(C, P,smoothstep(f+sm*m.x,f-sm*m.x,lc.x)*smoothstep(f+sm*m.y,f-sm*m.y,lc.y));
        C = mix(C, mix(P*(.4+(f+pow(f,2.))*4.),R,.25)
        ,smoothstep(f-(th-sm)*m.x,f-(th+sm)*m.x,lc.x)*smoothstep(f-(th-sm)*m.y,f-(th+sm)*m.y,lc.y));
      }

      void tile(vec2 uv, out vec4 C) {
        vec4 hx = getHex(uv);
        vec2 s;
        vec3 sqr = HexToSqr(hx.xy, s);
        float n = sqr.z;
        float sm = 3./resolution.y;
        float hh = h21(hx.zw*20.);
        vec2 st = sqr.xy;

        vec4 R;
        
        if (n == 1.) sphere(hx, st-vec2(.5), sm, R);
        else if (n == 2.) sphere(hx + vec4(0,-.6,.5,.5), s + vec2(0,1), .01, R);
        else sphere(hx + vec4(0,-.6,-.5,.5), s + vec2(0,1), .01, R);

        C = vec4(0);
        pixel(hh, sm, st, vec2(0,0), n, R, C);
        pixel(hh, sm, st, vec2(1,0), n, R, C);
        pixel(hh, sm, st, vec2(0,1), n, R, C);
        pixel(hh, sm, st, vec2(1,1), n, R, C);

        if (n==1.) C = mix(C,R,R.a);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        uv *= 0.8 + sin(time*0.3)*0.25;
        uv -= uv * pow(length(uv),2.5-sin(time*0.3)*0.5)*0.025 + 
              vec2(time*0.2,cos(time*0.2));
        
        vec4 C;
        tile(uv, C);
        fragColor = C;
      }
      `
    );
    gl.compileShader(fragmentShader);

    // 检查着色器编译状态
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader compilation failed:",
        gl.getShaderInfoLog(fragmentShader)
      );
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const timeLocation = gl.getUniformLocation(program, "time");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    const startTime = Date.now();
    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      gl.uniform1f(timeLocation, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

const VideoSection = ({
  videoSrc,
  isVisible,
}: {
  videoSrc: string;
  isVisible: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.load(); // 强制重新加载视频

    const handleLoadedData = () => {
      setIsLoaded(true);
      if (isVisible) {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Play failed:", error);
          });
        }
      }
    };

    videoElement.addEventListener("loadeddata", handleLoadedData);

    return () => {
      videoElement.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [videoSrc, isVisible]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isLoaded) return;

    if (isVisible) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Play failed:", error);
        });
      }
    } else {
      videoElement.pause();
      videoElement.currentTime = 0; // 重置视频到开始位置
    }
  }, [isVisible, isLoaded]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div
        className={`transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSrc} type="video/webm" />
        </video>
      </div>
    </div>
  );
};

const ServiceBlock = ({
  title,
  description,
  isActive,
  isReversed = false,
}: {
  title: string;
  description: string;
  isActive: boolean;
  isReversed?: boolean;
}) => {
  const videoSection = (
    <div className="h-[300px] md:h-[400px] lg:h-[500px] flex items-center">
      <div className="w-full h-full rounded-2xl overflow-hidden">
        <VideoSection
          videoSrc={getVideoPath("/animations/crypto2.webm")}
          isVisible={isActive}
        />
      </div>
    </div>
  );

  const contentSection = (
    <div className="h-[200px] md:h-[250px] lg:h-[500px] bg-[#0755CE]/5 rounded-2xl backdrop-blur-sm flex flex-col justify-center px-4 md:px-8 lg:px-12">
      <h2 className="text-2xl md:text-3xl font-bold text-[#2598C6] mb-4 text-center lg:text-left">
        {title}
      </h2>
      <p className="text-[#A3BDD0] text-base md:text-lg lg:text-xl leading-relaxed text-center lg:text-left max-w-3xl lg:max-w-none mx-auto lg:mx-0">
        {description}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      <div className={`${isReversed ? "lg:order-2" : "lg:order-1"} order-1`}>
        {videoSection}
      </div>
      <div className={`${isReversed ? "lg:order-1" : "lg:order-2"} order-2`}>
        {contentSection}
      </div>
    </div>
  );
};

const Home = () => {
  const [activeSection, setActiveSection] = useState(1);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.findIndex(
              (ref) => ref === entry.target
            );
            if (index !== -1) {
              setActiveSection(index + 1);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      title: "專業網站與APP開發",
      description: "為企業量身打造，高效、美觀且易於管理的網站與行動應用程式。",
    },
    {
      title: "客製化系統開發",
      description: "依據企業需求，打造專屬系統，提升營運效率與競爭力。",
    },
    {
      title: "企業數位轉型夥伴",
      description: "提供全方位數位解決方案，助力企業迎向智慧未來。",
    },
    {
      title: "打造極致用戶體驗",
      description: "以設計與技術並重，創造流暢、直覺的數位產品體驗。",
    },
    {
      title: "從概念到實現，全程支援",
      description: "由專業團隊提供策略、設計、開發到維護的一站式服務。",
    },
    {
      title: "專屬解決方案，滿足企業需求",
      description: "針對不同產業需求，量身打造最適合的數位產品。",
    },
  ];

  return (
    <ParallaxProvider>
      <ShaderBackground />
      <div className="relative h-screen overflow-y-auto snap-y snap-mandatory">
        {/* Hero Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current[0] = el;
          }}
          className="h-screen snap-start"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
            <nav className="flex justify-between items-center pt-4 md:pt-6 lg:pt-8">
              <Image
                src={`${
                  process.env.NODE_ENV === "production" ? "/jastron" : ""
                }/logo.webp`}
                alt="Logo"
                width={120}
                height={45}
                className="w-[120px] md:w-[150px] lg:w-[180px] h-auto"
                priority
              />
            </nav>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center">
              <Parallax translateY={[-20, 20]} className="order-2 lg:order-1">
                <div className="text-center lg:text-left lg:max-w-xl pt-12 sm:pt-16 md:pt-20 lg:pt-0">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 lg:mb-6 bg-gradient-to-r from-[#2598C6] to-[#0755CE] bg-clip-text text-transparent leading-tight">
                    數位轉型，從 JASTRON 開始
                  </h1>
                  <p className="text-[#A3BDD0] text-base md:text-lg lg:text-xl leading-relaxed">
                    專業網站、APP 開發，助企業站穩市場，邁向未來。
                  </p>
                </div>
              </Parallax>

              <Parallax translateY={[20, -20]} className="order-1 lg:order-2">
                <div className="relative mx-auto max-w-2xl lg:max-w-none">
                  <div className="w-full h-[200px] sm:h-[250px] md:h-[350px] lg:h-[500px] rounded-2xl overflow-hidden">
                    <VideoSection
                      videoSrc={getVideoPath("/animations/crypto1.webm")}
                      isVisible={activeSection === 1}
                    />
                  </div>
                </div>
              </Parallax>
            </div>
          </div>
        </div>

        {/* Service Blocks */}
        {services.map((service, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) sectionRefs.current[index + 1] = el;
            }}
            className="min-h-screen snap-start flex items-center py-8 md:py-12"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <ServiceBlock
                title={service.title}
                description={service.description}
                isActive={activeSection === index + 2}
                isReversed={index % 2 === 1}
              />
            </div>
          </div>
        ))}
      </div>
    </ParallaxProvider>
  );
};

export default Home;
