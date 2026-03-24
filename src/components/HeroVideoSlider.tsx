import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import heroAthletes from "@/assets/hero-athletes.jpg";
import heroStadium from "@/assets/hero-stadium.jpg";
import heroStadium2 from "@/assets/hero-stadium-2.jpg";

const slides = [
  {
    image: heroAthletes,
    video: "https://videos.pexels.com/video-files/3209118/3209118-uhd_2560_1440_25fps.mp4",
    tagline: "September 2026 · Kerala",
    title: ["Gateway to", "Greatness"],
    description: "India's pioneering school sports movement. From the classroom to the podium — discover, compete, and shine at KHELIUM.",
  },
  {
    image: heroStadium,
    video: "https://videos.pexels.com/video-files/3191572/3191572-uhd_2560_1440_25fps.mp4",
    tagline: "6+ Sports · 3 Cities",
    title: ["Where Champions", "Are Born"],
    description: "Professional-grade events across Kerala. RFID timing, certified tracks, and a path to national glory.",
  },
  {
    image: heroStadium2,
    video: "https://videos.pexels.com/video-files/3059452/3059452-uhd_2560_1440_25fps.mp4",
    tagline: "Ages U10 to U18",
    title: ["Every Sport,", "Every Spark"],
    description: "From track & field to swimming and cycling — find the event that ignites your child's athletic journey.",
  },
];

const HeroVideoSlider = () => {
  const [current, setCurrent] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  const handleVideoLoaded = (index: number) => {
    setVideoLoaded(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            current === i ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Fallback image */}
          <img
            src={slide.image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover ${videoLoaded[i] ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
            width={1920}
            height={1080}
          />
          {/* Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${videoLoaded[i] ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
            onLoadedData={() => handleVideoLoaded(i)}
          >
            <source src={slide.video} type="video/mp4" />
          </video>
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-khelium-navy/95 via-khelium-navy/70 to-khelium-navy/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy via-transparent to-khelium-navy/30 opacity-70 z-10" />
      <div className="absolute inset-0 bg-primary/5 mix-blend-multiply z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block h-1 w-12 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">
                {slides[current].tagline}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.02] mb-6 uppercase">
              <span className="text-white block">{slides[current].title[0]}</span>
              <span className="text-primary block">{slides[current].title[1]}</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-lg mb-10 leading-relaxed font-sans">
              {slides[current].description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/events">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2 uppercase tracking-wider font-bold text-base px-8 py-6">
                  Explore Events <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 uppercase tracking-wider font-bold text-base px-8 py-6 gap-2">
                  <Play size={16} /> Watch Highlights
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-12 left-4 md:left-auto md:right-12 flex items-center gap-3">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  current === i ? "w-10 bg-primary" : "w-4 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
        <div className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroVideoSlider;
