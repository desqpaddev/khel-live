import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight, Star, Medal, Flame } from "lucide-react";
import EventCard from "@/components/EventCard";
import HeroVideoSlider from "@/components/HeroVideoSlider";
import SportCategoryCarousel from "@/components/SportCategoryCarousel";
import TestimonialSection from "@/components/TestimonialSection";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const stats = [
  { label: "Sports", value: "6+", icon: <Flame className="w-6 h-6 text-primary" /> },
  { label: "Age Groups", value: "U10–U18", icon: <Star className="w-6 h-6 text-accent" /> },
  { label: "Cities", value: "3", icon: <Medal className="w-6 h-6 text-primary" /> },
  { label: "Events", value: "50+", icon: <Trophy className="w-6 h-6 text-accent" /> },
];

const Index = () => {
  const [featured, setFeatured] = useState<Event[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from("events").select("*").eq("featured", true).limit(4);
      if (data) setFeatured(data);
    };
    fetchFeatured();
  }, []);

  const toCardEvent = (e: Event) => ({
    id: e.id, title: e.title, sport: e.sport, category: e.category, city: e.city,
    venue: e.venue, date: e.event_date, time: e.event_time, ageGroups: e.age_groups,
    price: e.price, spotsLeft: e.total_spots, totalSpots: e.total_spots, image: (e as any).image_url || "",
    description: e.description || "", featured: e.featured || false,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Video Slider */}
      <HeroVideoSlider />

      {/* Stats - Floating cards over a gradient */}
      <section className="relative -mt-8 z-30 pb-12 pt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card border border-border rounded-xl p-6 shadow-card text-center group hover:shadow-glow hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold font-display text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sport Categories Carousel */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-8 bg-primary/40" />
              <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">Disciplines</span>
              <span className="h-px w-8 bg-primary/40" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground uppercase">Sport Categories</h2>
            <p className="text-muted-foreground mt-3 text-lg">Choose your discipline. Begin your journey.</p>
          </motion.div>
          <SportCategoryCarousel />
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="py-20 bg-secondary relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
          <div className="container mx-auto px-4 relative">
            <div className="flex items-end justify-between mb-12">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-8 bg-primary/40" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">Don't Miss Out</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground uppercase">Featured Events</h2>
              </motion.div>
              <Link to="/events">
                <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1 uppercase tracking-wider text-sm font-semibold">
                  View All <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <EventCard event={toCardEvent(event)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <TestimonialSection />

      {/* CTA Section */}
      <section className="relative py-28 overflow-hidden section-dark">
        {/* Animated background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Registrations Open</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display uppercase mb-6 leading-[1.05]">
              One Event. One Dream.{" "}
              <span className="text-primary">One Vision.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Every Sport, Every Spark 🔥 Register your child and ignite their path to Olympic excellence.
            </p>
            <Link to="/events">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-3 uppercase tracking-wider font-bold text-base px-10 py-7">
                Register Now <Trophy size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
