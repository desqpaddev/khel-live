import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const sportCategories = [
  { id: "track", name: "Track Events", icon: "🏃", desc: "Sprint, relay, hurdles", color: "from-red-500/20 to-orange-500/20" },
  { id: "field-jump", name: "Jumping", icon: "🦘", desc: "High jump, long jump", color: "from-blue-500/20 to-cyan-500/20" },
  { id: "field-throw", name: "Throwing", icon: "🥏", desc: "Shot put, javelin", color: "from-green-500/20 to-emerald-500/20" },
  { id: "swimming", name: "Swimming", icon: "🏊", desc: "Freestyle, backstroke", color: "from-sky-500/20 to-blue-500/20" },
  { id: "cycling", name: "Cycling", icon: "🚴", desc: "Road, time trial", color: "from-amber-500/20 to-yellow-500/20" },
  { id: "race-walking", name: "Race Walking", icon: "🚶", desc: "3K, 5K walks", color: "from-purple-500/20 to-pink-500/20" },
];

const SportCategoryCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1, dragFree: true },
    [Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })]
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

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {sportCategories.map((cat, i) => (
            <div key={cat.id} className="flex-none w-[280px] md:w-[320px] pl-4 first:pl-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/events?category=${cat.id}`}
                  className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Icon with animated ring */}
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">{cat.icon}</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/30 group-hover:scale-125 transition-all duration-500" />
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <h3 className="text-sm font-bold font-display text-foreground uppercase tracking-wider">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {sportCategories.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              selectedIndex === i ? "bg-primary w-6" : "bg-border hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SportCategoryCarousel;
