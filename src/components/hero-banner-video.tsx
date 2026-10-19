import { useState, useRef, useEffect, useCallback } from "react";

const DEFAULT_VIDEO_URL =
  "https://bhanuswaroop.sirv.com/WhatsApp%20Video%202026-10-19%20at%2011.39.24%20AM%20(2).mp4";

interface HeroBannerVideoProps {
  posterImage: string;
  mobilePosterImage?: string;
  videoSrc?: string;
  className?: string;
}

export function HeroBannerVideo({
  posterImage,
  mobilePosterImage,
  videoSrc = DEFAULT_VIDEO_URL,
  className = "",
}: HeroBannerVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleVideoReady = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setHasError(true);
    setIsVideoLoaded(false);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Strict iOS Safari & mobile autoplay compliance
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsVideoLoaded(true);
        })
        .catch(() => {
          // Autoplay policy restriction fallback
        });
    }
  }, [videoSrc]);

  return (
    <div className={`absolute inset-0 -z-20 overflow-hidden bg-black ${className}`}>
      {/* High-Performance Fallback Image (shown immediately while video is loading late) */}
      <picture className="absolute inset-0 h-full w-full">
        {mobilePosterImage && (
          <source media="(max-width: 639px)" srcSet={mobilePosterImage} />
        )}
        <img
          src={posterImage}
          alt="Safety engineering video banner"
          className="h-full w-full object-cover object-[68%_center] sm:object-center"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      {/* Main Video: 100% Crystal Clear, NO dark layer or filter on top */}
      {!hasError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={posterImage}
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onPlaying={handleVideoReady}
          onError={handleVideoError}
          className={`absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center transition-opacity duration-1000 ease-in-out ${
            isVideoLoaded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
