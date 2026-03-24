import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import eventsHero from "@/assets/events-hero.jpg";

type Event = Tables<"events">;

const sportCategories = [
  { id: "track", name: "Track Events", icon: "🏃" },
  { id: "field-jump", name: "Jumping", icon: "🦘" },
  { id: "field-throw", name: "Throwing", icon: "🥏" },
  { id: "swimming", name: "Swimming", icon: "🏊" },
  { id: "cycling", name: "Cycling", icon: "🚴" },
  { id: "race-walking", name: "Race Walking", icon: "🚶" },
];

const cities = ["Kochi", "Trivandrum", "Kozhikode"];
const ageGroups = ["U10", "U12", "U14", "U16", "U18"];

const EventsPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAge, setSelectedAge] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCity && e.city !== selectedCity) return false;
      if (selectedCategory && e.category !== selectedCategory) return false;
      if (selectedAge && !e.age_groups.includes(selectedAge)) return false;
      return true;
    });
  }, [events, search, selectedCity, selectedCategory, selectedAge]);

  const clearFilters = () => { setSearch(""); setSelectedCity(""); setSelectedCategory(""); setSelectedAge(""); };
  const hasFilters = search || selectedCity || selectedCategory || selectedAge;

  const toCardEvent = (e: Event) => ({
    id: e.id, title: e.title, sport: e.sport, category: e.category, city: e.city,
    venue: e.venue, date: e.event_date, time: e.event_time, ageGroups: e.age_groups,
    price: e.price, spotsLeft: e.total_spots, totalSpots: e.total_spots, image: (e as any).image_url || "",
    description: e.description || "", featured: e.featured || false,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventsHero} alt="Events" className="w-full h-full object-cover" width={1920} height={720} />
          <div className="absolute inset-0 bg-gradient-to-r from-khelium-navy/95 via-khelium-navy/80 to-khelium-navy/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-khelium-navy via-transparent to-transparent opacity-60" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-1 w-10 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-[0.25em]">Find & Register</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-white uppercase mb-4">
              Browse <span className="text-primary">Events</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
              Discover and register for KHELIUM sports events across Kerala. Filter by sport, city, or age group.
            </p>

            {/* Quick stats */}
            <div className="flex gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">September 2026</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">3 Cities</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters Bar */}
      <div className="sticky top-16 z-40 bg-card/95 border-b border-border shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary gap-1 font-semibold">
                <X size={14} /> Clear
              </Button>
            )}
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-4 pb-2 space-y-4 border-t border-border mt-4"
            >
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">City</h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <Badge key={c} onClick={() => setSelectedCity(selectedCity === c ? "" : c)} className={`cursor-pointer transition-colors ${selectedCity === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"}`}>{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sport</h3>
                <div className="flex flex-wrap gap-2">
                  {sportCategories.map((cat) => (
                    <Badge key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)} className={`cursor-pointer transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"}`}>{cat.icon} {cat.name}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Age Group</h3>
                <div className="flex flex-wrap gap-2">
                  {ageGroups.map((a) => (
                    <Badge key={a} onClick={() => setSelectedAge(selectedAge === a ? "" : a)} className={`cursor-pointer transition-colors ${selectedAge === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"}`}>{a}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <EventCard event={toCardEvent(event)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏟️</span>
                </div>
                <p className="text-lg font-display font-bold text-foreground uppercase mb-2">No Events Found</p>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to find events</p>
                <Button variant="outline" onClick={clearFilters} className="text-primary border-primary/30 font-semibold">
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
