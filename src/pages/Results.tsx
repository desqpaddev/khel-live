import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trophy, Medal, Clock, Ruler, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { downloadCertificate } from "@/lib/certificate";
import { Download } from "lucide-react";

type ResultWithDetails = {
  id: string;
  position: number | null;
  time_recorded: string | null;
  distance_recorded: string | null;
  score: number | null;
  medal: string | null;
  notes: string | null;
  events: { title: string; event_date: string; venue: string; city: string; sport: string } | null;
  registrations: { child_name: string; age_group: string; bib_number: string | null; registration_number: string | null; school: string } | null;
};

const Results = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    // Search by bib_number or registration_number via registrations
    const { data: regData } = await supabase
      .from("registrations")
      .select("id")
      .or(`bib_number.ilike.%${query.trim()}%,registration_number.ilike.%${query.trim()}%`);

    if (regData && regData.length > 0) {
      const regIds = regData.map(r => r.id);
      const { data } = await supabase
        .from("results")
        .select("*, events(title, event_date, venue, city, sport), registrations(child_name, age_group, bib_number, registration_number, school)")
        .in("registration_id", regIds);
      setResults((data as unknown as ResultWithDetails[]) || []);
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  const medalColor: Record<string, string> = {
    gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
    silver: "bg-gray-100 text-gray-700 border-gray-300",
    bronze: "bg-orange-100 text-orange-800 border-orange-300",
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-dark">
        <div className="container mx-auto px-4 py-12 text-center">
          <Trophy size={40} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white uppercase mb-2">Search Results</h1>
          <p className="text-gray-400 max-w-md mx-auto">Find your performance results using your BIB number or Registration ID</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter BIB number (e.g. KH-001) or Registration ID (e.g. A001)"
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="bg-primary text-primary-foreground h-12 px-6 uppercase font-bold tracking-wider">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {searched && results.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
            <p className="text-muted-foreground text-sm mt-1">Please check your BIB number or Registration ID and try again</p>
          </div>
        )}

        <div className="grid gap-4 max-w-3xl mx-auto">
          {results.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-lg border border-border bg-card shadow-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold font-display text-foreground uppercase">{result.registrations?.child_name}</h3>
                  <p className="text-sm text-muted-foreground">{result.events?.title} · {result.events?.sport}</p>
                </div>
                {result.medal && (
                  <Badge className={`text-sm ${medalColor[result.medal] || "bg-secondary text-secondary-foreground"}`}>
                    {result.medal === "gold" ? "🥇" : result.medal === "silver" ? "🥈" : "🥉"} {result.medal.toUpperCase()}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {result.registrations?.registration_number && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Hash size={12} /> Reg ID</div>
                    <p className="font-bold text-foreground">{result.registrations.registration_number}</p>
                  </div>
                )}
                {result.registrations?.bib_number && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Hash size={12} /> BIB</div>
                    <p className="font-bold text-foreground">{result.registrations.bib_number}</p>
                  </div>
                )}
                {result.position && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Medal size={12} /> Position</div>
                    <p className="font-bold text-foreground">#{result.position}</p>
                  </div>
                )}
                {result.time_recorded && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Clock size={12} /> Time</div>
                    <p className="font-bold text-foreground">{result.time_recorded}</p>
                  </div>
                )}
                {result.distance_recorded && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Ruler size={12} /> Distance</div>
                    <p className="font-bold text-foreground">{result.distance_recorded}</p>
                  </div>
                )}
                {result.score !== null && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Trophy size={12} /> Score</div>
                    <p className="font-bold text-foreground">{result.score}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <span>{result.events?.venue}, {result.events?.city}</span> · <span>{result.events?.event_date}</span>
                  {result.registrations?.age_group && <span> · {result.registrations.age_group}</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary gap-2 font-semibold"
                  onClick={() => downloadCertificate({
                    childName: result.registrations?.child_name || "Participant",
                    eventTitle: result.events?.title || "Event",
                    eventDate: result.events?.event_date || "",
                    venue: result.events?.venue || "",
                    city: result.events?.city || "",
                    position: result.position,
                    medal: result.medal,
                    timeRecorded: result.time_recorded,
                    distanceRecorded: result.distance_recorded,
                    score: result.score ? Number(result.score) : null,
                    ageGroup: result.registrations?.age_group,
                    bibNumber: result.registrations?.bib_number,
                  })}
                >
                  <Download size={14} /> Certificate
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
