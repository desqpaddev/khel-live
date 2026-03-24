import { useState, useMemo } from "react";
import { Trophy, Medal, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type Registration = Tables<"registrations">;
type Result = Tables<"results"> & { registrations?: Registration | null; events?: Event | null };

interface AdminLeaderboardProps {
  results: Result[];
  events: Event[];
  registrations: Registration[];
}

const medalEmoji: Record<string, string> = { gold: "🥇", silver: "🥈", bronze: "🥉" };
const medalOrder: Record<string, number> = { gold: 1, silver: 2, bronze: 3 };

const AdminLeaderboard = ({ results, events, registrations }: AdminLeaderboardProps) => {
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterMedal, setFilterMedal] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterExpertise, setFilterExpertise] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"position" | "time" | "score" | "name">("position");

  // Build a registration lookup
  const regMap = useMemo(() => {
    const map = new Map<string, Registration>();
    registrations.forEach((r) => map.set(r.id, r));
    return map;
  }, [registrations]);

  // Unique filter values
  const cities = useMemo(() => [...new Set(registrations.map((r) => r.city).filter(Boolean))], [registrations]);
  const ageGroups = useMemo(() => [...new Set(registrations.map((r) => r.age_group).filter(Boolean))], [registrations]);
  const expertiseLevels = useMemo(() => [...new Set(registrations.map((r) => r.swimming_expertise).filter(Boolean))], [registrations]);

  const leaderboard = useMemo(() => {
    let filtered = results.filter((r) => r.position != null);

    if (filterEvent !== "all") filtered = filtered.filter((r) => r.event_id === filterEvent);
    if (filterMedal !== "all") filtered = filtered.filter((r) => r.medal === filterMedal);

    // Registration-based filters
    if (filterGender !== "all" || filterCity !== "all" || filterAgeGroup !== "all" || filterExpertise !== "all" || searchQuery) {
      filtered = filtered.filter((r) => {
        const reg = r.registrations || regMap.get(r.registration_id);
        if (!reg) return false;
        if (filterGender !== "all" && reg.gender !== filterGender) return false;
        if (filterCity !== "all" && reg.city !== filterCity) return false;
        if (filterAgeGroup !== "all" && reg.age_group !== filterAgeGroup) return false;
        if (filterExpertise !== "all" && reg.swimming_expertise !== filterExpertise) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const name = `${reg.first_name || ""} ${reg.last_name || ""}`.toLowerCase();
          const bib = (reg.bib_number || "").toLowerCase();
          const regNum = (reg.registration_number || "").toLowerCase();
          if (!name.includes(q) && !bib.includes(q) && !regNum.includes(q)) return false;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "position") return (a.position || 999) - (b.position || 999);
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "time") return (a.time_recorded || "").localeCompare(b.time_recorded || "");
      if (sortBy === "name") {
        const regA = a.registrations || regMap.get(a.registration_id);
        const regB = b.registrations || regMap.get(b.registration_id);
        return (`${regA?.first_name || ""} ${regA?.last_name || ""}`).localeCompare(`${regB?.first_name || ""} ${regB?.last_name || ""}`);
      }
      return 0;
    });

    return filtered;
  }, [results, filterEvent, filterMedal, filterGender, filterCity, filterAgeGroup, filterExpertise, searchQuery, sortBy, regMap]);

  const selectClass = "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground uppercase flex items-center gap-2">
          <Trophy size={20} className="text-primary" /> Leaderboard ({leaderboard.length})
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search by name, BIB or Reg ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <Filter size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Select value={filterEvent} onValueChange={setFilterEvent}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Event" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterMedal} onValueChange={setFilterMedal}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Medal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Medals</SelectItem>
              <SelectItem value="gold">🥇 Gold</SelectItem>
              <SelectItem value="silver">🥈 Silver</SelectItem>
              <SelectItem value="bronze">🥉 Bronze</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => <SelectItem key={c!} value={c!}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Age Group" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Age Groups</SelectItem>
              {ageGroups.map((a) => <SelectItem key={a!} value={a!}>{a}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterExpertise} onValueChange={setFilterExpertise}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Expertise" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {expertiseLevels.map((e) => <SelectItem key={e!} value={e!}>{e}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="position">By Position</SelectItem>
              <SelectItem value="score">By Score</SelectItem>
              <SelectItem value="time">By Time</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((idx) => {
            const r = leaderboard[idx];
            if (!r) return null;
            const reg = r.registrations || regMap.get(r.registration_id);
            const name = `${reg?.first_name || ""} ${reg?.last_name || ""}`.trim() || "Unknown";
            const isFirst = idx === 0;
            return (
              <div
                key={r.id}
                className={`p-5 rounded-lg border border-border bg-card shadow-card text-center ${isFirst ? "md:-mt-4 ring-2 ring-primary/30" : ""}`}
              >
                <div className="text-4xl mb-2">{medalEmoji[r.medal || ""] || `#${r.position}`}</div>
                <p className="font-bold font-display text-foreground uppercase text-sm truncate">{name}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.events?.title || "—"}</p>
                {r.time_recorded && <p className="text-xs text-primary font-semibold mt-1">⏱ {r.time_recorded}</p>}
                {r.score != null && <p className="text-xs text-primary font-semibold mt-1">Score: {r.score}</p>}
                <Badge className="mt-2 bg-secondary text-secondary-foreground text-xs">
                  #{r.position}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Rankings Table */}
      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participant</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">BIB</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reg ID</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Medal</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expertise</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => {
                const reg = r.registrations || regMap.get(r.registration_id);
                const name = `${reg?.first_name || ""} ${reg?.last_name || ""}`.trim() || "Unknown";
                return (
                  <tr key={r.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i < 3 ? "bg-primary/5" : ""}`}>
                    <td className="p-3 font-bold text-foreground">
                      {r.position! <= 3 ? (
                        <span className="text-lg">{medalEmoji[r.medal || ""] || `#${r.position}`}</span>
                      ) : (
                        <span>#{r.position}</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-foreground">{name}</td>
                    <td className="p-3 text-muted-foreground text-xs">{r.events?.title || "—"}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{reg?.bib_number || "—"}</Badge></td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{reg?.registration_number || "—"}</td>
                    <td className="p-3 text-xs font-semibold text-foreground">{r.time_recorded || "—"}</td>
                    <td className="p-3 text-xs font-semibold text-foreground">{r.score ?? "—"}</td>
                    <td className="p-3">
                      {r.medal ? (
                        <Badge className={
                          r.medal === "gold" ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" :
                          r.medal === "silver" ? "bg-gray-300/30 text-gray-600 border-gray-400/30" :
                          "bg-orange-500/20 text-orange-700 border-orange-500/30"
                        }>
                          {medalEmoji[r.medal]} {r.medal}
                        </Badge>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{reg?.gender || "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{reg?.city || "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{reg?.swimming_expertise || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {leaderboard.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No ranked results found. Adjust filters or publish results first.</p>
        )}
      </div>
    </div>
  );
};

export default AdminLeaderboard;
