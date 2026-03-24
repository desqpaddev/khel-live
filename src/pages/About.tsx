import { motion } from "framer-motion";
import { Trophy, Target, Globe, Users, Shield, Cpu, ArrowRight, MapPin, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import aboutHero from "@/assets/about-hero.jpg";
import aboutMission from "@/assets/about-mission.jpg";
import aboutVision from "@/assets/about-vision.jpg";

const values = [
  { icon: <Trophy size={24} />, title: "Olympic Pathway", desc: "Connected to ISF Gymnasiade and Youth Olympics for talented athletes." },
  { icon: <Target size={24} />, title: "Fair Competition", desc: "Age-appropriate events with professional timing and judging standards." },
  { icon: <Shield size={24} />, title: "Safety First", desc: "On-site medical teams, insurance coverage, and escort systems for every child." },
  { icon: <Users size={24} />, title: "Inclusive", desc: "CBSE, ICSE, and State board schools united under one movement." },
  { icon: <Cpu size={24} />, title: "Tech-Driven", desc: "RFID timing, photo finish cameras, live results, and digital certificates." },
  { icon: <Globe size={24} />, title: "National Vision", desc: "Starting Kerala 2026, expanding to 13+ cities nationwide by 2028." },
];

const timeline = [
  { year: "2026", cities: "Kochi, Trivandrum, Kozhikode", goal: "Establish credibility, refine the KHELIUM experience", icon: "🚀" },
  { year: "2027", cities: "Kerala + Chennai, Bangalore", goal: "Multi-state participation, regional prestige", icon: "📈" },
  { year: "2028", cities: "13 cities across India", goal: "All-India recognition, ISF integration", icon: "🏆" },
];

const numbers = [
  { value: "6+", label: "Sports Disciplines" },
  { value: "50+", label: "Events Planned" },
  { value: "3", label: "Cities in Phase 1" },
  { value: "5000+", label: "Expected Athletes" },
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    {/* Hero Banner */}
    <section className="relative pt-20 overflow-hidden">
      <div className="absolute inset-0">
        <img src={aboutHero} alt="About KHELIUM" className="w-full h-full object-cover" width={1920} height={720} />
        <div className="absolute inset-0 bg-gradient-to-r from-khelium-navy/95 via-khelium-navy/80 to-khelium-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy via-transparent to-transparent opacity-70" />
      </div>
      <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-block h-1 w-10 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">Who We Are</span>
            <span className="inline-block h-1 w-10 rounded-full bg-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white uppercase mb-6">
            About <span className="text-primary">KHELIUM</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            India's pioneering school sports movement, created to spark every child's journey toward Olympic dreams.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission & Vision - Split layout with images */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img src={aboutMission} alt="Our Mission" loading="lazy" width={800} height={800} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold font-display uppercase tracking-wider">Our Mission</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary/40" />
              <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground uppercase mb-6">
              Igniting the Athlete in <span className="text-primary">Every Child</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              KHELIUM was born from a simple belief: every child deserves a professional-grade sports platform. We bridge the gap between school-level sports and international competition by creating structured, tech-enabled, and inspiring sporting experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our events feature RFID timing, photo-finish cameras, certified tracks, and age-appropriate equipment — giving young athletes the tools and environment they need to discover their true potential.
            </p>
          </motion.div>
        </div>

        {/* Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent/40" />
              <span className="text-sm font-semibold text-accent uppercase tracking-[0.25em]">Vision</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground uppercase mb-6">
              From Classroom to <span className="text-accent">Podium</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We envision a future where India's school sports ecosystem rivals the best in the world. Where a child in Kozhikode has the same opportunities as one in London or Tokyo. Where talent is discovered, nurtured, and celebrated.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              By 2028, KHELIUM aims to be present in 13+ cities across India, connected to ISF Gymnasiade and Youth Olympics pathways, creating a seamless pipeline from school sports to Olympic glory.
            </p>
            <Link to="/events">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 uppercase tracking-wider font-bold shadow-glow">
                Explore Events <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img src={aboutVision} alt="Our Vision" loading="lazy" width={800} height={800} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy/60 to-transparent" />
              <div className="absolute bottom-6 right-6">
                <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold font-display uppercase tracking-wider">Our Vision</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Numbers Strip */}
    <section className="py-16 section-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {numbers.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold font-display text-white">{n.value}</p>
              <p className="text-sm text-gray-400 mt-2 uppercase tracking-wider">{n.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Values Grid */}
    <section className="py-20 bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary/40" />
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">What Drives Us</span>
            <span className="h-px w-8 bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground uppercase">Our Values</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-glow transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {v.icon}
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-2 uppercase tracking-wide">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Roadmap Timeline */}
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary/40" />
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">The Journey</span>
            <span className="h-px w-8 bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground uppercase">Roadmap</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {timeline.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex gap-6 items-start relative"
            >
              {/* Connector line */}
              {i < timeline.length - 1 && (
                <div className="absolute left-7 top-16 w-0.5 h-16 bg-gradient-to-b from-primary/30 to-border" />
              )}

              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
                  <span className="text-xl">{t.icon}</span>
                </div>
              </div>

              <div className="pb-12">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold font-display text-foreground">{t.year}</span>
                  {i === 0 && (
                    <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary/20">Current</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{t.cities}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t.goal}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA + Organized by */}
    <section className="py-24 section-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Join the Movement</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold font-display uppercase mb-6 text-white leading-[1.05]">
            Ready to Make <span className="text-primary">History?</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Be part of India's biggest school sports revolution. Register your child today.
          </p>

          <Link to="/events">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-3 uppercase tracking-wider font-bold text-base px-10 py-7">
              Explore Events <ArrowRight size={20} />
            </Button>
          </Link>

          {/* Organized by */}
          <div className="mt-20 pt-10 border-t border-white/10 max-w-md mx-auto">
            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">Organized by</p>
            <p className="text-lg font-bold font-display text-white uppercase">TDK Sports</p>
            <p className="text-sm text-gray-400 mt-1">with Santos King Tours & Travels Pvt Ltd</p>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default AboutPage;
