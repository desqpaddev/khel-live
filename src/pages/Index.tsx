import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-stadium.jpg";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const stats = [
  { label: "Sports", value: "6+", icon: "🏅" },
  { label: "Age Groups", value: "U10–U18", icon: "👦" },
  { label: "Cities", value: "3", icon: "🏙️" },
  { label: "Events", value: "50+", icon: "🎯" },
];

const sportCategories = [
  { id: "track", name: "Track Events", icon: "🏃", desc: "Sprint, relay, hurdles" },
  { id: "field-jump", name: "Jumping", icon: "🦘", desc: "High jump, long jump" },
  { id: "field-throw", name: "Throwing", icon: "🥏", desc: "Shot put, javelin" },
  { id: "swimming", name: "Swimming", icon: "🏊", desc: "Freestyle, backstroke" },
  { id: "cycling", name: "Cycling", icon: "🚴", desc: "Road, time trial" },
  { id: "race-walking", name: "Race Walking", icon: "🚶", desc: "3K, 5K walks" },
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
    price: e.price, spotsLeft: e.total_spots, totalSpots: e.total_spots, image: "",
    description: e.description || "", featured: e.featured || false,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Dark overlay like Kester */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Stadium" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-khelium-navy/95 via-khelium-navy/80 to-khelium-navy/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy via-transparent to-transparent opacity-60" />
          {/* Red overlay accent like Kester */}
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        </div>
        <div className="relative container mx-auto px-4 pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-1 w-10 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">September 2026 · Kerala</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.05] mb-6 uppercase text-white">
              Gateway to<br />
              <span className="text-primary">Greatness</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg mb-8 leading-relaxed font-sans">
              India's pioneering school sports movement. From the classroom to the podium — discover, compete, and shine at KHELIUM.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2 uppercase tracking-wider font-bold">
                  Explore Events <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 uppercase tracking-wider font-bold">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats - Light section with bold numbers */}
      <section className="py-16 bg-secondary border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <span className="text-3xl mb-2 block">{s.icon}</span>
                <p className="text-3xl md:text-4xl font-bold font-display text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sport Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Disciplines</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mt-2 uppercase">Sport Categories</h2>
            <p className="text-muted-foreground mt-2">Choose your discipline. Begin your journey.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sportCategories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/events?category=${cat.id}`} className="group flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-glow transition-all">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-sm font-bold font-display text-foreground text-center uppercase">{cat.name}</span>
                  <span className="text-xs text-muted-foreground text-center">{cat.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Don't Miss Out</span>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mt-2 uppercase">Featured Events</h2>
              </div>
              <Link to="/events">
                <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1 uppercase tracking-wider text-sm font-semibold">
                  View All <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((event) => <EventCard key={event.id} event={toCardEvent(event)} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Dark section */}
      <section className="py-24 section-dark">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mb-4">
              One Event. One Dream. <span className="text-primary">One Vision.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
              Every Sport, Every Spark 🔥 Register your child and ignite their path to Olympic excellence.
            </p>
            <Link to="/events">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2 uppercase tracking-wider font-bold">
                Register Now <Trophy size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
