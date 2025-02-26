"use client";
import Image from "next/image";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

const getResPath = (path: string) => {
  const basePath = process.env.NODE_ENV === "production" ? "/jastron" : "";
  return `${basePath}${path}`;
};

// 定義每個區塊的高度
const SECTION_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 0;

// 處理滾動邏輯的自定義 Hook
const useSmoothScroll = (sections: number) => {
  const [currentSection, setCurrentSection] = useState(0);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(Date.now());

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastScrollTime.current < 1000 || isScrolling.current) return;
      
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = Math.max(0, Math.min(sections - 1, currentSection + direction));
      
      if (nextSection !== currentSection) {
        isScrolling.current = true;
        lastScrollTime.current = now;
        
        window.scrollTo({
          top: nextSection * SECTION_HEIGHT,
          behavior: 'smooth'
        });
        
        setCurrentSection(nextSection);
        
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSection, sections]);

  return currentSection;
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
          src={getResPath("/animations/background.webm")}
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

const ServiceCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(getResPath(`/animations/${icon}.json`))
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) =>
        console.error(`Failed to load animation ${icon}:`, error)
      );
  }, [icon]);

  return (
    <div className="flex flex-col items-center text-center p-4 md:p-6">
      <div className="w-16 h-16 md:w-24 md:h-24 mb-2 md:mb-4">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="w-full h-full"
          />
        )}
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-[#2598C6] mb-2">
        {title}
      </h3>
      <p className="text-white text-sm md:text-base hidden md:block">{description}</p>
    </div>
  );
};

const PartnerLogo = ({ src, alt }: { src: string; alt: string }) => (
  <div className="flex items-center justify-center p-4">
    <Image
      src={getResPath(`/partners/${src}`)}
      alt={alt}
      width={120}
      height={60}
      className="opacity-70 hover:opacity-100 transition-opacity"
    />
  </div>
);

const CaseStudyCard = ({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col">
    <div className="relative h-[200px] md:h-[300px] rounded-lg overflow-hidden mb-4">
      <Image
        src={getResPath(`/cases/${image}`)}
        alt={title}
        fill
        className="object-cover"
      />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-white/80 text-sm">{description}</p>
  </div>
);

const Home = () => {
  const [isMounted, setIsMounted] = useState(false);
  const sections = 4; // 總區塊數改為 4
  const currentSection = useSmoothScroll(sections);
  const [currentCase, setCurrentCase] = useState(0);
  const cases = [
    {
      image: "case1.png",
      title: "Title 001",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      image: "case2.png",
      title: "Title 002",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);

  return (
    <div className="min-h-screen overflow-hidden">
      {isMounted && (
        <ParallaxProvider>
          <VideoBackground />
          <div className="min-h-screen relative">
            {/* 導航欄 */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                  <Image
                    src={getResPath("/logo.webp")}
                    alt="Logo"
                    width={120}
                    height={45}
                    className="w-[120px] md:w-[150px] h-auto"
                  />
                  <div className="hidden md:flex space-x-8">
                    <a href="#" className="text-white hover:text-[#2598C6]">關於我們</a>
                    <a href="#" className="text-white hover:text-[#2598C6]">服務項目</a>
                    <a href="#" className="text-white hover:text-[#2598C6]">作品集</a>
                    <a href="#" className="text-white hover:text-[#2598C6]">聯絡我們</a>
                  </div>
                  <button className="text-white bg-[#2598C6]/20 px-4 py-2 rounded-full hover:bg-[#2598C6]/30">
                    繁體中文
                  </button>
                </div>
              </div>
            </nav>

            {/* 各個區塊使用絕對定位 */}
            <div 
              ref={(el) => {
                if (sectionRefs.current) {
                  sectionRefs.current[0] = el;
                }
              }}
              className="section absolute w-full h-screen"
              style={{
                transform: `translateY(${-currentSection * 100}vh)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              {/* Hero Section */}
              <div className="min-h-screen pt-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#2598C6] to-[#0755CE] bg-clip-text text-transparent">
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
                    <div className="relative">
                      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#2598C6]/20 to-[#0755CE]/20">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              ref={(el) => {
                if (sectionRefs.current) {
                  sectionRefs.current[1] = el;
                }
              }}
              className="section absolute w-full h-screen"
              style={{
                transform: `translateY(${(1-currentSection) * 100}vh)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              {/* 服務區塊 */}
              <section className="min-h-screen py-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                    我們的服務
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    <ServiceCard
                      icon="cybersecurity"
                      title="專業網站與APP開發"
                      description="為企業量身打造，高效、美觀且易於管理的網站與行動應用程式。"
                    />
                    <ServiceCard
                      icon="vip"
                      title="客製化系統開發"
                      description="依據企業需求，打造專屬系統，提升營運效率與競爭力。"
                    />
                    <ServiceCard
                      icon="light-bulb"
                      title="企業數位轉型夥伴"
                      description="提供全方位數位解決方案，助力企業迎向智慧未來。"
                    />
                    <ServiceCard
                      icon="happy"
                      title="打造極致用戶體驗"
                      description="以設計與技術並重，創造流暢、直覺的數位產品體驗。"
                    />
                    <ServiceCard
                      icon="declaration"
                      title="從概念到實現，全程支援"
                      description="由專業團隊提供策略、設計、開發到維護的一站式服務。"
                    />
                    <ServiceCard
                      icon="launch"
                      title="專屬解決方案，滿足企業需求"
                      description="針對不同產業需求，量身打造最適合的數位產品。"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div 
              ref={(el) => {
                if (sectionRefs.current) {
                  sectionRefs.current[2] = el;
                }
              }}
              className="section absolute w-full h-screen"
              style={{
                transform: `translateY(${(2-currentSection) * 100}vh)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              {/* 合作夥伴 */}
              <section className="min-h-screen py-20 flex items-center bg-black/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                    合作夥伴
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    <PartnerLogo src="partner1.svg" alt="Partner 1" />
                    <PartnerLogo src="partner2.svg" alt="Partner 2" />
                    <PartnerLogo src="partner3.svg" alt="Partner 3" />
                    <PartnerLogo src="partner4.svg" alt="Partner 4" />
                    <PartnerLogo src="partner5.svg" alt="Partner 5" />
                  </div>
                </div>
              </section>
            </div>

            <div 
              ref={(el) => {
                if (sectionRefs.current) {
                  sectionRefs.current[3] = el;
                }
              }}
              className="section absolute w-full h-screen"
              style={{
                transform: `translateY(${(3-currentSection) * 100}vh)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              {/* 案例展示和頁尾 */}
              <div className="h-screen flex flex-col">
                {/* 案例展示 */}
                <section className="flex-1 flex flex-col justify-center py-10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
                      案例展示
                    </h2>
                    <div className="relative px-12">
                      <button 
                        className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full z-10 hover:bg-white/20 transition-colors"
                        onClick={() => setCurrentCase((prev) => (prev > 0 ? prev - 1 : cases.length - 1))}
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:block">
                          <CaseStudyCard {...cases[currentCase]} />
                        </div>
                        <div className="hidden md:block">
                          <CaseStudyCard {...cases[(currentCase + 1) % cases.length]} />
                        </div>
                      </div>
                      <button 
                        className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full z-10 hover:bg-white/20 transition-colors"
                        onClick={() => setCurrentCase((prev) => (prev < cases.length - 1 ? prev + 1 : 0))}
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </section>

                {/* 頁尾 */}
                <footer className="bg-black/30 py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
                      <div>
                        <Image
                          src={getResPath("/logo.webp")}
                          alt="Logo"
                          width={120}
                          height={45}
                          className="mb-6"
                        />
                        <div className="flex flex-wrap gap-6">
                          <a href="#" className="text-white/60 hover:text-white">關於我們</a>
                          <a href="#" className="text-white/60 hover:text-white">服務項目</a>
                          <a href="#" className="text-white/60 hover:text-white">作品集</a>
                          <a href="#" className="text-white/60 hover:text-white">聯絡我們</a>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end">
                        <p className="text-white mb-4">訂閱電子報，隨時掌握最新資訊！</p>
                        <div className="flex w-full md:w-auto">
                          <input
                            type="email"
                            placeholder="輸入您的 email"
                            className="w-full md:w-64 bg-white/10 text-white px-4 py-2 rounded-l-full focus:outline-none focus:bg-white/20 transition-colors"
                          />
                          <button className="bg-[#2598C6] text-white px-6 py-2 rounded-r-full hover:bg-[#1b7aa1] transition-colors whitespace-nowrap">
                            送出
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-8">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-white/60 text-sm text-center md:text-left">
                          © 2024 佳仕宸有限公司 All rights reserved
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
                          <a href="#" className="text-white/60 hover:text-white">
                            Privacy Policy
                          </a>
                          <a href="#" className="text-white/60 hover:text-white">
                            Terms of Service
                          </a>
                          <a href="#" className="text-white/60 hover:text-white">
                            Cookies Settings
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </ParallaxProvider>
      )}
      {!isMounted && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default Home;
