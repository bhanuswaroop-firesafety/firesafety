import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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

interface HeroBannerVideoProps {
  posterImage: string;
}

export function HeroBannerVideo({ posterImage }: HeroBannerVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay prevented (e.g. low power mode)
            setIsPlaying(false);
          });
      }
    }
  }, []);

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
      {/* Background Video Layer */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-ink">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          poster={posterImage}
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`h-full w-full object-cover object-[68%_center] transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-90"
          }`}
          aria-hidden="true"
        >
          <source src="/videos/fire-safety-hero.webm" type="video/webm" />
          <source src="/videos/fire-safety-hero.mp4" type="video/mp4" />
          <source src="/videos/fire-safety-hero-mobile.webm" type="video/webm" />
          {/* Fallback image if video is not supported */}
          <img
            src={posterImage}
            alt="Safety engineer inspecting an industrial fire pump installation"
            className="h-full w-full object-cover object-[68%_center]"
          />
        </video>

        {/* Ambient Dark Gradient Overlays for High Contrast Readability */}
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/40 pointer-events-none" />
      </div>

      {/* Floating Interactive Video Badge & Micro-Controls (Bottom Right) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-5 right-4 z-20 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6 lg:right-10"
      >
        {/* Interactive Control Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-ink/80 p-2 shadow-2xl backdrop-blur-md transition-all hover:border-white/30 hover:bg-ink/90">
          {/* Click to open modal */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group flex cursor-pointer items-center gap-3 pr-2 text-left transition"
            aria-label="Watch safety solutions video showcase"
          >
            <div className="relative grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
              <Play className="size-4.5 fill-current transition-transform group-hover:scale-110" />
              {/* Pulsing ring */}
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-warm">
                <span>Field Operations</span>
                <span className="size-1 rounded-full bg-brand-warm"></span>
                <span className="text-emerald-400">HD Video</span>
              </div>
              <div className="text-xs font-bold text-white transition-colors group-hover:text-brand-bright">
                Safety Solutions in Action
              </div>
            </div>
          </button>

          {/* Quick Micro Controls */}
          <div className="flex items-center gap-1 border-l border-white/15 pl-2">
            <button
              type="button"
              onClick={togglePlay}
              className="grid size-8 place-items-center rounded-md text-white/80 transition hover:bg-white/15 hover:text-white"
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
              className="grid size-8 place-items-center rounded-md text-white/80 transition hover:bg-white/15 hover:text-white"
              title={isMuted ? "Unmute video audio" : "Mute video audio"}
              aria-label={isMuted ? "Unmute video audio" : "Mute video audio"}
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="grid size-8 place-items-center rounded-md text-white/80 transition hover:bg-white/15 hover:text-white"
              title="Watch full screen video"
              aria-label="Watch full screen video"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full HD Cinematic Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl border border-white/15 bg-ink p-0 text-white shadow-2xl sm:rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-bright">
              <Flame className="size-4 text-primary" />
              Sri Udharchi Enterprises
              <span className="text-white/40">•</span>
              <span className="text-white/80">Operations Showcase</span>
            </div>
            <DialogTitle className="text-xl font-black text-white sm:text-2xl">
              Fire & Industrial Safety Systems in Action
            </DialogTitle>
            <DialogDescription className="text-xs text-white/70">
              High-standard fire suppression, hydrant flow verification, industrial PPE and
              workplace safety protocols.
            </DialogDescription>
          </DialogHeader>

          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black">
            <video
              controls
              autoPlay
              playsInline
              className="h-full w-full object-cover"
              poster={posterImage}
            >
              <source src="/videos/fire-safety-hero.webm" type="video/webm" />
              <source src="/videos/fire-safety-hero.mp4" type="video/mp4" />
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
