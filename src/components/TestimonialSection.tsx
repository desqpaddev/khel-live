import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Menon",
    role: "Parent of U14 Track Athlete",
    city: "Kochi",
    quote: "KHELIUM transformed my daughter's confidence. The professional setup, RFID timing, and coaching feedback after the 100m sprint was something we never expected at a school-level event. She's now training for nationals!",
    rating: 5,
    initials: "PM",
  },
  {
    name: "Rajesh Kumar",
    role: "School Sports Coach",
    city: "Trivandrum",
    quote: "I've been coaching for 15 years and KHELIUM is the most professionally organized school sports platform I've seen. The digital results, certificates, and the way they handle age-group categorization — it's truly world-class.",
    rating: 5,
    initials: "RK",
  },
  {
    name: "Ananya Nair",
    role: "U16 Swimming Champion",
    city: "Kozhikode",
    quote: "Competing at KHELIUM felt like being at a real championship. The electronic touch-pad timing in swimming gave me accurate splits for the first time. I improved my personal best by 2 seconds!",
    rating: 5,
    initials: "AN",
  },
  {
    name: "Dr. Suresh Pillai",
    role: "Parent & Sports Enthusiast",
    city: "Kochi",
    quote: "What impressed me most was the safety measures and medical support at every venue. As a doctor and a parent, I felt completely at ease letting my son compete in the cycling event. Brilliant organization.",
    rating: 5,
    initials: "SP",
  },
  {
    name: "Meera Thomas",
    role: "Parent of U12 Athlete",
    city: "Trivandrum",
    quote: "My son was nervous about his first competition, but the KHELIUM team made him feel like a champion even before the race started. The QR-code check-in and digital ticket system was so smooth!",
    rating: 5,
    initials: "MT",
  },
];

const TestimonialSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Decorative accent blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary/40" />
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">Voices of Champions</span>
            <span className="h-px w-8 bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground uppercase">What People Say</h2>
          <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
            Hear from parents, coaches, and young athletes who've experienced the KHELIUM difference.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-6">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-none w-full md:w-[50%] lg:w-[50%] pl-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative bg-card border rounded-2xl p-8 h-full transition-all duration-500 ${
                      selectedIndex === i
                        ? "border-primary/30 shadow-glow"
                        : "border-border shadow-card"
                    }`}
                  >
                    {/* Quote icon */}
                    <div className="absolute -top-4 left-8">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Quote className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4 mt-2">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>

                    {/* Quote text */}
                    <p className="text-foreground/80 leading-relaxed mb-6 text-[0.95rem]">
                      "{t.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold font-display text-primary">{t.initials}</span>
                      </div>
                      <div>
                        <p className="font-bold font-display text-foreground uppercase text-sm tracking-wide">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role} · {t.city}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={scrollPrev}
              className="w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    selectedIndex === i ? "bg-primary w-8" : "bg-border w-2 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={scrollNext}
              className="w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
