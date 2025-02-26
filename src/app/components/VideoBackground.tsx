"use client";
import { useEffect, useRef } from 'react';

const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-1">
      <div className="absolute inset-0 bg-black/50" />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src={process.env.NODE_ENV === "production" ? "/jastron/videos/background.mp4" : "/videos/background.mp4"} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoBackground; 