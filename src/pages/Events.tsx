import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const sportCategories = [
  { id: "track", name: "Track Events", icon: "🏃" },
  { id: "field-jump", name: "Field – Jumping", icon: "🦘" },
  { id: "field-throw", name: "Field – Throwing", icon: "🥏" },
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

  // Convert db event to EventCard format
  const toCardEvent = (e: Event) => ({
    id: e.id, title: e.title, sport: e.sport, category: e.category, city: e.city,
    venue: e.venue, date: e.event_date, time: e.event_time, ageGroups: e.age_groups,
    price: e.price, spotsLeft: e.total_spots, totalSpots: e.total_spots, image: "",
    description: e.description || "", featured: e.featured || false,
  });

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Events</h1>
          <p className="text-muted-foreground">Find and register for KHELIUM sports events across Kerala</p>
        </motion.div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <Button variant="outline" className="border-border text-foreground gap-2 md:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} /> Filters
          </Button>
        </div>

        <div className="flex gap-8">
          <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0 space-y-6`}>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">City</h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((c) => (
                  <Badge key={c} onClick={() => setSelectedCity(selectedCity === c ? "" : c)} className={`cursor-pointer transition-colors ${selectedCity === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Sport</h3>
              <div className="flex flex-wrap gap-2">
                {sportCategories.map((cat) => (
                  <Badge key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)} className={`cursor-pointer transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{cat.icon} {cat.name}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Age Group</h3>
              <div className="flex flex-wrap gap-2">
                {ageGroups.map((a) => (
                  <Badge key={a} onClick={() => setSelectedAge(selectedAge === a ? "" : a)} className={`cursor-pointer transition-colors ${selectedAge === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{a}</Badge>
                ))}
              </div>
            </div>
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">Clear all filters</Button>}
          </aside>

          <div className="flex-1">
            {loading ? (
              <p className="text-center text-muted-foreground py-20">Loading events...</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filtered.length} events found</p>
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((event) => <EventCard key={event.id} event={toCardEvent(event)} />)}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-2xl mb-2">🏟️</p>
                    <p className="text-muted-foreground">No events match your filters</p>
                    <Button variant="ghost" onClick={clearFilters} className="mt-3 text-primary">Clear filters</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
