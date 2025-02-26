"use client";
import Image from "next/image";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

const getResPath = (path: string) => {
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
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-24 h-24 mb-4">
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
      <p className="text-white text-sm md:text-base">{description}</p>
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
  const [activeSection, setActiveSection] = useState(1);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div className="min-h-screen">
      {isMounted && (
        <ParallaxProvider>
          <VideoBackground />
          <div className="min-h-screen">
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
                    <a
                      href="#about"
                      className="text-white hover:text-[#2598C6]"
                    >
                      關於我們
                    </a>
                    <a
                      href="#services"
                      className="text-white hover:text-[#2598C6]"
                    >
                      服務項目
                    </a>
                    <a
                      href="#works"
                      className="text-white hover:text-[#2598C6]"
                    >
                      作品集
                    </a>
                    <a
                      href="#contact"
                      className="text-white hover:text-[#2598C6]"
                    >
                      聯絡我們
                    </a>
                  </div>
                  <button className="text-white bg-[#2598C6]/20 px-4 py-2 rounded-full hover:bg-[#2598C6]/30">
                    繁體中文
                  </button>
                </div>
              </div>
            </nav>

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
                      {/* 移除了 Lottie 動畫，改為漸層背景 */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 服務區塊 */}
            <section className="py-20 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                  我們的服務
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="text-center mt-12">
                  <button className="bg-[#2598C6] text-white px-8 py-3 rounded-full hover:bg-[#1b7aa1] transition-colors">
                    More
                  </button>
                </div>
              </div>
            </section>

            {/* 合作夥伴 */}
            <section className="py-20 bg-black/30">
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

            {/* 案例展示 */}
            <section className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                  案例展示
                </h2>
                <div className="relative">
                  <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-12">
                    <CaseStudyCard
                      image="case1.png"
                      title="Title 001"
                      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                    />
                    <CaseStudyCard
                      image="case2.png"
                      title="Title 002"
                      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                    />
                  </div>
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full">
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
                <div className="text-center mt-12">
                  <button className="bg-[#2598C6] text-white px-8 py-3 rounded-full hover:bg-[#1b7aa1] transition-colors">
                    More
                  </button>
                </div>
              </div>
            </section>

            {/* 頁尾 */}
            <footer className="bg-black/30 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Image
                      src={getResPath("/logo.webp")}
                      alt="Logo"
                      width={120}
                      height={45}
                      className="mb-6"
                    />
                    <div className="flex space-x-6">
                      <a href="#" className="text-white/60 hover:text-white">
                        關於我們
                      </a>
                      <a href="#" className="text-white/60 hover:text-white">
                        服務項目
                      </a>
                      <a href="#" className="text-white/60 hover:text-white">
                        作品集
                      </a>
                      <a href="#" className="text-white/60 hover:text-white">
                        聯絡我們
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-white mb-4">
                      訂閱電子報，隨時掌握最新資訊！
                    </p>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="輸入您的 email"
                        className="bg-white/10 text-white px-4 py-2 rounded-l-full focus:outline-none"
                      />
                      <button className="bg-[#2598C6] text-white px-6 py-2 rounded-r-full hover:bg-[#1b7aa1]">
                        送出
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-8 flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    © 2024 佳仕宸有限公司 All rights reserved
                  </div>
                  <div className="flex space-x-6 text-sm">
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
            </footer>
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
