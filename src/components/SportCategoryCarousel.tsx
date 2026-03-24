import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import sportTrack from "@/assets/sport-track.jpg";
import sportJumping from "@/assets/sport-jumping.jpg";
import sportThrowing from "@/assets/sport-throwing.jpg";
import sportSwimming from "@/assets/sport-swimming.jpg";
import sportCycling from "@/assets/sport-cycling.jpg";
import sportWalking from "@/assets/sport-walking.jpg";

const sportCategories = [
  { id: "track", name: "Track Events", desc: "Sprint, relay, hurdles", image: sportTrack, events: "12 Events" },
  { id: "field-jump", name: "Jumping", desc: "High jump, long jump", image: sportJumping, events: "8 Events" },
  { id: "field-throw", name: "Throwing", desc: "Shot put, javelin", image: sportThrowing, events: "6 Events" },
  { id: "swimming", name: "Swimming", desc: "Freestyle, backstroke", image: sportSwimming, events: "10 Events" },
  { id: "cycling", name: "Cycling", desc: "Road, time trial", image: sportCycling, events: "5 Events" },
  { id: "race-walking", name: "Race Walking", desc: "3K, 5K walks", image: sportWalking, events: "3 Events" },
];

const SportCategoryCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
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
        <div className="flex -ml-5">
          {sportCategories.map((cat, i) => (
            <div key={cat.id} className="flex-none w-[85%] sm:w-[45%] md:w-[32%] lg:w-[24%] pl-5">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/events?category=${cat.id}`}
                  className="group relative block rounded-2xl overflow-hidden aspect-[3/4]"
                >
                  {/* Image */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    width={640}
                    height={800}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy via-khelium-navy/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Red accent line at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-1">{cat.events}</span>
                    <h3 className="text-xl font-bold font-display text-white uppercase tracking-wide mb-1">{cat.name}</h3>
                    <p className="text-sm text-gray-300">{cat.desc}</p>

                    {/* Explore arrow */}
                    <div className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ArrowRight size={14} />
                    </div>
                  </div>
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
            className={`h-2 rounded-full transition-all duration-300 ${
              selectedIndex === i ? "bg-primary w-8" : "bg-border w-2 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SportCategoryCarousel;
