import { motion } from "framer-motion";
import { Trophy, Target, Globe, Users, Shield, Cpu } from "lucide-react";

const values = [
  { icon: <Trophy size={24} />, title: "Olympic Pathway", desc: "Connected to ISF Gymnasiade and Youth Olympics for talented athletes." },
  { icon: <Target size={24} />, title: "Fair Competition", desc: "Age-appropriate events with professional timing and judging standards." },
  { icon: <Shield size={24} />, title: "Safety First", desc: "On-site medical teams, insurance coverage, and escort systems for every child." },
  { icon: <Users size={24} />, title: "Inclusive", desc: "CBSE, ICSE, and State board schools united under one movement." },
  { icon: <Cpu size={24} />, title: "Tech-Driven", desc: "RFID timing, photo finish cameras, live results, and digital certificates." },
  { icon: <Globe size={24} />, title: "National Vision", desc: "Starting Kerala 2026, expanding to 13+ cities nationwide by 2028." },
];

const timeline = [
  { year: "2026", cities: "Kochi, Trivandrum, Kozhikode", goal: "Establish credibility, refine experience" },
  { year: "2027", cities: "Kerala + Chennai, Bangalore", goal: "Multi-state participation, regional prestige" },
  { year: "2028", cities: "13 cities across India", goal: "All-India recognition" },
];

const AboutPage = () => (
  <div className="min-h-screen bg-background pt-20">
    {/* Header */}
    <div className="section-dark">
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Who We Are</span>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white mt-2 uppercase">
            About <span className="text-primary">KHELIUM</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mt-4">
            India's pioneering school sports movement, created to spark every child's journey toward Olympic dreams.
          </p>
        </motion.div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-16">
      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="p-6 rounded-lg border border-border bg-card shadow-card hover:shadow-glow transition-shadow"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
              {v.icon}
            </div>
            <h3 className="text-lg font-bold font-display text-foreground mb-2 uppercase">{v.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto mb-20">
        <h2 className="text-3xl font-bold font-display text-foreground text-center mb-10 uppercase">Roadmap</h2>
        <div className="space-y-6">
          {timeline.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex gap-6 items-start"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm font-display">
                  {t.year}
                </div>
                {i < timeline.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
              </div>
              <div className="pt-2">
                <p className="text-sm font-bold text-foreground mb-1">{t.cities}</p>
                <p className="text-sm text-muted-foreground">{t.goal}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Organized by */}
      <div className="text-center p-8 rounded-lg border border-border bg-secondary">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Organized by</p>
        <p className="text-lg font-bold font-display text-foreground uppercase">TDK Sports</p>
        <p className="text-sm text-muted-foreground">with Santos King Tours & Travels Pvt Ltd</p>
      </div>
    </div>
  </div>
);

export default AboutPage;
