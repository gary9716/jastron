"use client";
import Image from "next/image";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { useEffect, useRef, useState } from "react";

const getVideoPath = (path: string) => {
  const basePath = process.env.NODE_ENV === "production" ? "/jastron" : "";
  return `${basePath}${path}`;
};

const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.play().catch((error) => {
      console.log("Background video play failed:", error);
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-black/30" />
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        preload="auto"
      >
        <source
          src={getVideoPath("/animations/background.webm")}
          type="video/webm"
        />
      </video>
    </div>
  );
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
    <div className="h-[200px] md:h-[250px] lg:h-[500px] flex flex-col justify-center px-4 md:px-8 lg:px-12">
      <h2 className="text-2xl md:text-3xl font-bold text-[#2598C6] mb-4 text-center lg:text-left">
        {title}
      </h2>
      <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed text-center lg:text-left max-w-3xl lg:max-w-none mx-auto lg:mx-0">
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
      <VideoBackground />
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
                    JASTRON
                    <br />
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                      打造專屬您的數位產品
                    </span>
                  </h1>
                  <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed">
                    從網站、APP 到客製化系統，助您掌握市場先機。
                    <br />
                    量身訂製數位解決方案，讓企業運營更智慧、更高效！
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
