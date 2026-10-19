import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  Flame,
  Phone,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Strict iOS Safari / mobile autoplay compliance
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    // Check if the video is already ready from browser cache
    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay policy prevented automatic playback (e.g., iOS Low Power Mode)
          setIsPlaying(false);
        });
    }
  }, [videoSrc]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <>
      {/* Background Media Container */}
      <div className={`absolute inset-0 -z-20 overflow-hidden bg-ink ${className}`}>
        {/* Layer 1: High-Performance Fallback Image (Visible immediately while video is loading late) */}
        <picture className="absolute inset-0 h-full w-full">
          {mobilePosterImage && (
            <source media="(max-width: 639px)" srcSet={mobilePosterImage} />
          )}
          <img
            src={posterImage}
            alt="Safety engineer inspecting industrial fire pump equipment"
            className="h-full w-full object-cover object-[68%_center] sm:object-center transition-transform duration-1000 scale-100"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Layer 2: Main Video (Smoothly fades in once loaded, keeping the image beneath while loading) */}
        {!hasError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
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

        {/* Layer 3: Deep Cinematic Gradient Overlays (Guarantees crisp typography & contrast in light/dark conditions) */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40 sm:bg-gradient-to-r sm:from-ink/95 sm:via-ink/85 sm:to-ink/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/90 sm:hidden pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating Interactive Video Badge & Micro-Controls (Bottom Right) */}
      {!hasError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 lg:right-10 z-20 flex flex-col items-end gap-2"
        >
          {/* Interactive Control Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-ink/85 p-1.5 sm:p-2 shadow-2xl backdrop-blur-md transition-all hover:border-white/35 hover:bg-ink/95">
            {/* Click to open modal */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group flex cursor-pointer items-center gap-2.5 sm:gap-3 pr-1 sm:pr-2 text-left transition"
              aria-label="Watch safety operations video showcase"
            >
              <div className="relative grid size-8 sm:size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
                <Play className="size-4 fill-current transition-transform group-hover:scale-110" />
                {/* Live pulsing ring */}
                <span className="absolute -top-1 -right-1 flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div className="block">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-brand-warm">
                  <span>Field Ops</span>
                  <span className="size-1 rounded-full bg-brand-warm" />
                  <span className="text-emerald-400">HD Video</span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-white transition-colors group-hover:text-brand-bright whitespace-nowrap">
                  Safety in Action
                </div>
              </div>
            </button>

            {/* Quick Micro Controls */}
            <div className="flex items-center gap-1 border-l border-white/15 pl-1.5 sm:pl-2">
              <button
                type="button"
                onClick={togglePlay}
                className="grid size-7 sm:size-8 place-items-center rounded-md text-white/80 transition hover:bg-white/15 hover:text-white"
                title={isPlaying ? "Pause background video" : "Play background video"}
                aria-label={isPlaying ? "Pause background video" : "Play background video"}
              >
                {isPlaying ? (
                  <Pause className="size-3.5" />
                ) : (
                  <Play className="size-3.5 fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="grid size-7 sm:size-8 place-items-center rounded-md text-white/80 transition hover:bg-white/15 hover:text-white"
                title={isMuted ? "Unmute video sound" : "Mute video sound"}
                aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
              >
                {isMuted ? (
                  <VolumeX className="size-3.5" />
                ) : (
                  <Volume2 className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="grid size-7 sm:size-8 place-items-center rounded-md text-white/80 transition hover:bg-white/15 hover:text-white"
                title="Watch full screen video"
                aria-label="Watch full screen video"
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full HD Cinematic Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl border border-white/15 bg-ink p-0 text-white shadow-2xl sm:rounded-2xl overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-bright">
              <Flame className="size-4 text-primary" />
              Sri Udharchi Enterprises
              <span className="text-white/40">•</span>
              <span className="text-white/80">Operations Showcase</span>
            </div>
            <DialogTitle className="text-lg font-black text-white sm:text-2xl mt-1">
              Fire & Industrial Safety Systems in Action
            </DialogTitle>
            <DialogDescription className="text-xs text-white/70">
              High-standard fire suppression, hydrant flow verification, industrial PPE and workplace safety protocols.
            </DialogDescription>
          </DialogHeader>

          {/* Video Player */}
          <div className="relative aspect-video w-full bg-black">
            <video
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
              poster={posterImage}
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>

          {/* Modal Footer with Fast Inquiries */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <ShieldCheck className="size-3.5" /> IS / NFPA Standard Compliant
              </span>
              <span className="hidden md:inline text-white/50">•</span>
              <span className="text-white/70">Certified Fire Engineering & Supply</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a href="tel:+918639858221" className="flex-1 sm:flex-none">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 text-xs"
                >
                  <Phone className="size-3.5 mr-1" /> Call Support
                </Button>
              </a>
              <a
                href="#contact"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 sm:flex-none"
              >
                <Button size="sm" className="w-full text-xs">
                  Request Quote <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
