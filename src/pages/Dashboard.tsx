import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Trophy, User, LogOut, Download, Clock, Flame, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { downloadCertificate } from "@/lib/certificate";

type Event = Tables<"events">;
type Registration = Tables<"registrations"> & { events?: Event | null };
type Result = Tables<"results"> & { events?: Event | null };
type Profile = Tables<"profiles">;

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editProfile, setEditProfile] = useState({
    full_name: "", phone: "", school: "", city: "", board: "", age_group: "",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [profileRes, regRes, resultsRes, eventsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("registrations").select("*, events(*)").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("results").select("*, events(*)").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("event_date", { ascending: true }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditProfile({
        full_name: profileRes.data.full_name || "", phone: profileRes.data.phone || "",
        school: profileRes.data.school || "", city: profileRes.data.city || "",
        board: profileRes.data.board || "", age_group: profileRes.data.age_group || "",
      });
    }
    if (regRes.data) setRegistrations(regRes.data as Registration[]);
    if (resultsRes.data) setResults(resultsRes.data as Result[]);
    if (eventsRes.data) setAllEvents(eventsRes.data);
    setLoading(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const registeredEventIds = new Set(registrations.map(r => r.event_id));

  const categorizedEvents = useMemo(() => {
    const upcoming: Event[] = [];
    const ongoing: Event[] = [];
    const past: Event[] = [];
    for (const ev of allEvents) {
      if (ev.status === "ongoing") ongoing.push(ev);
      else if (ev.event_date > today || ev.status === "upcoming") upcoming.push(ev);
      else past.push(ev);
    }
    return { upcoming, ongoing, past };
  }, [allEvents, today]);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(editProfile).eq("user_id", user!.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated! ✅" });
      fetchData();
    }
    setSaving(false);
  };

  const medalColor: Record<string, string> = {
    gold: "bg-accent text-accent-foreground",
    silver: "bg-secondary text-secondary-foreground",
    bronze: "bg-khelium-orange/20 text-primary",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const EventGrid = ({ events, label, emptyMsg }: { events: Event[]; label: string; emptyMsg: string }) => (
    <div>
      {events.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{emptyMsg}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => {
            const isRegistered = registeredEventIds.has(ev.id);
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">{ev.sport}</Badge>
                    {isRegistered && <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">Registered</Badge>}
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-sm">{ev.title}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {ev.event_date} · {ev.event_time}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {ev.venue}, {ev.city}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">₹{ev.price}</span>
                    <Link to={`/events/${ev.id}`}>
                      <Button size="sm" className={isRegistered ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}>
                        {isRegistered ? "View" : "Book Now"} <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut} className="border-border text-foreground gap-2">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flame size={14} className="mr-2" /> Events
            </TabsTrigger>
            <TabsTrigger value="registrations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar size={14} className="mr-2" /> My Registrations
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy size={14} className="mr-2" /> Results
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User size={14} className="mr-2" /> Profile
            </TabsTrigger>
          </TabsList>

          {/* Events - Upcoming / Ongoing / Past */}
          <TabsContent value="events" className="space-y-8">
            {categorizedEvents.ongoing.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <h2 className="text-lg font-bold text-foreground">Ongoing Events</h2>
                  <Badge className="bg-green-500/10 text-green-400 text-xs">{categorizedEvents.ongoing.length}</Badge>
                </div>
                <EventGrid events={categorizedEvents.ongoing} label="Ongoing" emptyMsg="" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Upcoming Events</h2>
                <Badge className="bg-primary/10 text-primary text-xs">{categorizedEvents.upcoming.length}</Badge>
              </div>
              <EventGrid events={categorizedEvents.upcoming} label="Upcoming" emptyMsg="No upcoming events at the moment" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">Past Events</h2>
                <Badge className="bg-secondary text-secondary-foreground text-xs">{categorizedEvents.past.length}</Badge>
              </div>
              <EventGrid events={categorizedEvents.past} label="Past" emptyMsg="No past events yet" />
            </div>
          </TabsContent>

          {/* Registrations */}
          <TabsContent value="registrations">
            {registrations.length === 0 ? (
              <div className="text-center py-16 border border-border rounded-xl bg-card">
                <p className="text-2xl mb-2">🏟️</p>
                <p className="text-muted-foreground mb-4">No registrations yet</p>
                <Link to="/events">
                  <Button className="bg-primary text-primary-foreground">Browse Events</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {registrations.map((reg) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <Link to={`/events/${reg.event_id}`} className="font-bold text-foreground hover:text-primary transition-colors">{reg.events?.title || "Event"}</Link>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {reg.events?.event_date}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {reg.events?.city}</span>
                        <span>Child: {reg.child_name}</span>
                        <span>Age: {reg.age_group}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {reg.bib_number && (
                        <Badge className="bg-secondary text-secondary-foreground">BIB #{reg.bib_number}</Badge>
                      )}
                      <Badge className={reg.status === "confirmed" ? "bg-green-500/10 text-green-400" : "bg-secondary text-secondary-foreground"}>
                        {reg.status}
                      </Badge>
                      <Badge className={reg.payment_status === "paid" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}>
                        {reg.payment_status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Results */}
          <TabsContent value="results">
            {results.length === 0 ? (
              <div className="text-center py-16 border border-border rounded-xl bg-card">
                <p className="text-2xl mb-2">🏆</p>
                <p className="text-muted-foreground">No results published yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((result) => (
                  <div key={result.id} className="p-5 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-foreground">{result.events?.title}</h3>
                      {result.medal && (
                        <Badge className={medalColor[result.medal] || "bg-secondary text-secondary-foreground"}>
                          🏅 {result.medal.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {result.position && (
                        <div><span className="text-muted-foreground">Position</span><p className="font-bold text-foreground">#{result.position}</p></div>
                      )}
                      {result.time_recorded && (
                        <div><span className="text-muted-foreground">Time</span><p className="font-bold text-foreground">{result.time_recorded}</p></div>
                      )}
                      {result.distance_recorded && (
                        <div><span className="text-muted-foreground">Distance</span><p className="font-bold text-foreground">{result.distance_recorded}</p></div>
                      )}
                      {result.score !== null && (
                        <div><span className="text-muted-foreground">Score</span><p className="font-bold text-foreground">{result.score}</p></div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-primary gap-2"
                      onClick={() => {
                        const reg = registrations.find(r => r.id === result.registration_id);
                        downloadCertificate({
                          childName: reg?.child_name || "Participant",
                          eventTitle: result.events?.title || "Event",
                          eventDate: result.events?.event_date || "",
                          venue: result.events?.venue || "",
                          city: result.events?.city || "",
                          position: result.position,
                          medal: result.medal,
                          timeRecorded: result.time_recorded,
                          distanceRecorded: result.distance_recorded,
                          score: result.score ? Number(result.score) : null,
                          ageGroup: reg?.age_group,
                          bibNumber: reg?.bib_number,
                        });
                      }}
                    >
                      <Download size={14} /> Download Certificate
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="max-w-lg rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div><Label className="text-foreground text-xs">Full Name</Label><Input value={editProfile.full_name} onChange={(e) => setEditProfile({ ...editProfile, full_name: e.target.value })} className="bg-muted border-border text-foreground" /></div>
                <div><Label className="text-foreground text-xs">Phone</Label><Input value={editProfile.phone} onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })} className="bg-muted border-border text-foreground" /></div>
                <div><Label className="text-foreground text-xs">School</Label><Input value={editProfile.school} onChange={(e) => setEditProfile({ ...editProfile, school: e.target.value })} className="bg-muted border-border text-foreground" /></div>
                <div><Label className="text-foreground text-xs">City</Label><Input value={editProfile.city} onChange={(e) => setEditProfile({ ...editProfile, city: e.target.value })} className="bg-muted border-border text-foreground" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-foreground text-xs">Board</Label>
                    <Select value={editProfile.board} onValueChange={(v) => setEditProfile({ ...editProfile, board: v })}>
                      <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                        <SelectItem value="State">State Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground text-xs">Age Group</Label>
                    <Select value={editProfile.age_group} onValueChange={(v) => setEditProfile({ ...editProfile, age_group: v })}>
                      <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["U10", "U12", "U14", "U16", "U18"].map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={saveProfile} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
