import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, MapPin, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-stadium.jpg";
import EventCard from "@/components/EventCard";
import { events, sportCategories } from "@/lib/data";

const stats = [
  { label: "Sports", value: "6+", icon: "🏅" },
  { label: "Age Groups", value: "U10–U18", icon: "👦" },
  { label: "Cities", value: "3", icon: "🏙️" },
  { label: "Events", value: "50+", icon: "🎯" },
];

const Index = () => {
  const featured = events.filter((e) => e.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Stadium" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-1 w-10 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-widest">
                September 2026 · Kerala
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              <span className="text-foreground">Gateway to</span>
              <br />
              <span className="text-gradient">Greatness</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              India's pioneering school sports movement. From the classroom to the podium —
              discover, compete, and shine at KHELIUM.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2">
                  Explore Events <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-khelium-navy">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="text-3xl mb-2 block">{s.icon}</span>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sport Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Sport Categories
            </h2>
            <p className="text-muted-foreground">Choose your discipline. Begin your journey.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sportCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/events?category=${cat.id}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-glow transition-all"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-sm font-semibold text-foreground text-center">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.eventCount} events</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-khelium-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Events</h2>
              <p className="text-muted-foreground">Don't miss out on the biggest events this season</p>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              One Event. One Dream. <span className="text-gradient">One Vision.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Every Sport, Every Spark 🔥 Register your child and ignite their path to Olympic excellence.
            </p>
            <Link to="/events">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2">
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
