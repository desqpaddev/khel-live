import { useState, useEffect } from "react";
import {
  Calendar, Users, BarChart3, Trophy, Plus, Edit, Trash2,
  Search, Download, Medal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { downloadCertificate } from "@/lib/certificate";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Event = Tables<"events">;
type Registration = Tables<"registrations"> & { events?: Event | null };
type Result = Tables<"results"> & { registrations?: Tables<"registrations"> | null; events?: Event | null };

const COLORS = ["hsl(0,85%,50%)", "hsl(28,100%,52%)", "hsl(220,50%,50%)", "hsl(150,50%,45%)", "hsl(45,90%,50%)"];

const emptyEvent = {
  title: "", sport: "", category: "", city: "", venue: "",
  event_date: "", event_time: "", age_groups: [] as string[],
  price: 0, total_spots: 100, description: "", featured: false, status: "upcoming",
};

const BibAssigner = ({ registration, onUpdate }: { registration: Registration; onUpdate: () => void }) => {
  const [bib, setBib] = useState(registration.bib_number || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const assignBib = async () => {
    if (!bib.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("registrations").update({ bib_number: bib.trim() }).eq("id", registration.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `BIB ${bib} assigned ✅` });
      onUpdate();
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Input value={bib} onChange={(e) => setBib(e.target.value)} placeholder="KH-001" className="h-7 w-24 text-xs" />
      <Button size="sm" variant="ghost" onClick={assignBib} disabled={saving} className="h-7 px-2 text-xs text-primary font-semibold">{saving ? "..." : "Set"}</Button>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [allUsers, setAllUsers] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultForm, setResultForm] = useState({
    event_id: "", registration_id: "", position: "", time_recorded: "",
    distance_recorded: "", score: "", medal: "", notes: "",
  });
  const [searchReg, setSearchReg] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [evRes, regRes, resRes, usersRes] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: false }),
      supabase.from("registrations").select("*, events(*)").order("created_at", { ascending: false }),
      supabase.from("results").select("*, events(*), registrations(*)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    if (evRes.data) setEvents(evRes.data);
    if (regRes.data) setRegistrations(regRes.data as Registration[]);
    if (resRes.data) setResults(resRes.data as Result[]);
    if (usersRes.data) setAllUsers(usersRes.data);
    setLoading(false);
  };

  const saveEvent = async () => {
    const payload = { ...eventForm, created_by: user!.id, age_groups: eventForm.age_groups };
    if (editingEventId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingEventId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Event updated ✅" });
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Event created 🎉" });
    }
    setEventDialogOpen(false);
    setEditingEventId(null);
    setEventForm(emptyEvent);
    fetchAll();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Event deleted" });
    fetchAll();
  };

  const openEditEvent = (ev: Event) => {
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title, sport: ev.sport, category: ev.category, city: ev.city,
      venue: ev.venue, event_date: ev.event_date, event_time: ev.event_time,
      age_groups: ev.age_groups, price: ev.price, total_spots: ev.total_spots,
      description: ev.description || "", featured: ev.featured || false, status: ev.status,
    });
    setEventDialogOpen(true);
  };

  const saveResult = async () => {
    const payload = {
      event_id: resultForm.event_id,
      registration_id: resultForm.registration_id,
      position: resultForm.position ? parseInt(resultForm.position) : null,
      time_recorded: resultForm.time_recorded || null,
      distance_recorded: resultForm.distance_recorded || null,
      score: resultForm.score ? parseFloat(resultForm.score) : null,
      medal: resultForm.medal || null,
      notes: resultForm.notes || null,
    };
    const { error } = await supabase.from("results").insert(payload);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Result added 🏆" });
    setResultDialogOpen(false);
    setResultForm({ event_id: "", registration_id: "", position: "", time_recorded: "", distance_recorded: "", score: "", medal: "", notes: "" });
    fetchAll();
  };

  const regsByCity = Object.entries(
    registrations.reduce<Record<string, number>>((acc, r) => { const city = r.events?.city || "Unknown"; acc[city] = (acc[city] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const regsBySport = Object.entries(
    registrations.reduce<Record<string, number>>((acc, r) => { const sport = r.events?.sport || "Unknown"; acc[sport] = (acc[sport] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const regsByAge = Object.entries(
    registrations.reduce<Record<string, number>>((acc, r) => { acc[r.age_group] = (acc[r.age_group] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const revenue = events.reduce((sum, ev) => {
    const count = registrations.filter((r) => r.event_id === ev.id && r.payment_status === "paid").length;
    return sum + count * ev.price;
  }, 0);

  const filteredRegs = registrations.filter((r) =>
    !searchReg || r.child_name.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.parent_name.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.events?.title?.toLowerCase().includes(searchReg.toLowerCase())
  );

  const ageGroupOptions = ["U10", "U12", "U14", "U16", "U18"];
  const toggleAgeGroup = (ag: string) => {
    setEventForm(prev => ({
      ...prev, age_groups: prev.age_groups.includes(ag) ? prev.age_groups.filter(a => a !== ag) : [...prev.age_groups, ag],
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-background pt-24 flex items-center justify-center"><p className="text-muted-foreground">Loading admin dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen bg-secondary pt-20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground uppercase">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage KHELIUM events, registrations & results</p>
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Events", value: events.length, icon: <Calendar size={20} /> },
            { label: "Registrations", value: registrations.length, icon: <Users size={20} /> },
            { label: "Results Published", value: results.length, icon: <Trophy size={20} /> },
            { label: "Revenue", value: `₹${revenue.toLocaleString()}`, icon: <BarChart3 size={20} /> },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-lg border border-border bg-card shadow-card">
              <div className="flex items-center gap-3 mb-2 text-primary">{s.icon}</div>
              <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">Events</TabsTrigger>
            <TabsTrigger value="registrations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">Registrations</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">Results</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">Users</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">Analytics</TabsTrigger>
          </TabsList>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display text-foreground uppercase">Manage Events</h2>
              <Dialog open={eventDialogOpen} onOpenChange={(o) => { setEventDialogOpen(o); if (!o) { setEditingEventId(null); setEventForm(emptyEvent); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground gap-2 uppercase font-semibold tracking-wider"><Plus size={16} /> Create Event</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display uppercase">{editingEventId ? "Edit Event" : "Create Event"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div><Label className="text-xs font-semibold uppercase tracking-wider">Title</Label><Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Sport</Label><Input value={eventForm.sport} onChange={(e) => setEventForm({ ...eventForm, sport: e.target.value })} /></div>
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Category</Label><Input value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">City</Label><Input value={eventForm.city} onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })} /></div>
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Venue</Label><Input value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Date</Label><Input type="date" value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} /></div>
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Time</Label><Input value={eventForm.event_time} onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })} placeholder="9:00 AM" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Price (₹)</Label><Input type="number" value={eventForm.price} onChange={(e) => setEventForm({ ...eventForm, price: parseInt(e.target.value) || 0 })} /></div>
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Total Spots</Label><Input type="number" value={eventForm.total_spots} onChange={(e) => setEventForm({ ...eventForm, total_spots: parseInt(e.target.value) || 100 })} /></div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider">Age Groups</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {ageGroupOptions.map((ag) => (
                          <Badge key={ag} onClick={() => toggleAgeGroup(ag)} className={`cursor-pointer ${eventForm.age_groups.includes(ag) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{ag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider">Description</Label><Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} /></div>
                    <div className="flex items-center gap-3">
                      <Label className="text-xs font-semibold uppercase tracking-wider">Featured</Label>
                      <Switch checked={eventForm.featured as boolean} onCheckedChange={(v) => setEventForm({ ...eventForm, featured: v })} />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider">Status</Label>
                      <Select value={eventForm.status} onValueChange={(v) => setEventForm({ ...eventForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["upcoming", "ongoing", "completed", "cancelled"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={saveEvent} className="w-full bg-primary text-primary-foreground uppercase font-bold tracking-wider">{editingEventId ? "Update Event" : "Create Event"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 rounded-lg border border-border bg-card flex items-center justify-between gap-4 shadow-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold font-display text-foreground truncate uppercase">{ev.title}</h3>
                      <Badge className="bg-secondary text-secondary-foreground text-xs shrink-0">{ev.status}</Badge>
                      {ev.featured && <Badge className="bg-primary/10 text-primary text-xs shrink-0">Featured</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{ev.sport} · {ev.city} · {ev.event_date} · ₹{ev.price}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEditEvent(ev)} className="text-muted-foreground hover:text-foreground"><Edit size={16} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteEvent(ev.id)} className="text-destructive hover:text-destructive"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
              {events.length === 0 && <p className="text-center text-muted-foreground py-10">No events yet. Create your first event!</p>}
            </div>
          </TabsContent>

          {/* REGISTRATIONS TAB */}
          <TabsContent value="registrations">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display text-foreground uppercase">All Registrations ({registrations.length})</h2>
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." value={searchReg} onChange={(e) => setSearchReg(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    {["Child", "Event", "Age", "School", "Status", "Payment", "BIB", "Actions"].map(h => (
                      <th key={h} className="text-left p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-3 text-foreground font-medium">{r.child_name}<br /><span className="text-xs text-muted-foreground">{r.parent_name}</span></td>
                      <td className="p-3 text-foreground">{r.events?.title}</td>
                      <td className="p-3 text-foreground">{r.age_group}</td>
                      <td className="p-3 text-foreground">{r.school}</td>
                      <td className="p-3"><Badge className={r.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-secondary text-secondary-foreground"}>{r.status}</Badge></td>
                      <td className="p-3"><Badge className={r.payment_status === "paid" ? "bg-primary/10 text-primary" : "bg-yellow-100 text-yellow-800"}>{r.payment_status}</Badge></td>
                      <td className="p-3 text-foreground font-semibold">{r.bib_number || "—"}</td>
                      <td className="p-3"><BibAssigner registration={r} onUpdate={fetchAll} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRegs.length === 0 && <p className="text-center text-muted-foreground py-8">No registrations found</p>}
            </div>
          </TabsContent>

          {/* RESULTS TAB */}
          <TabsContent value="results">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display text-foreground uppercase">Results & Certificates</h2>
              <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground gap-2 uppercase font-semibold tracking-wider"><Plus size={16} /> Add Result</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display uppercase">Add Result</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider">Event</Label>
                      <Select value={resultForm.event_id} onValueChange={(v) => setResultForm({ ...resultForm, event_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                        <SelectContent>{events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider">Registration</Label>
                      <Select value={resultForm.registration_id} onValueChange={(v) => setResultForm({ ...resultForm, registration_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                        <SelectContent>
                          {registrations.filter((r) => r.event_id === resultForm.event_id).map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.child_name} ({r.age_group})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Position</Label><Input value={resultForm.position} onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} type="number" /></div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider">Medal</Label>
                        <Select value={resultForm.medal} onValueChange={(v) => setResultForm({ ...resultForm, medal: v })}>
                          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">🥇 Gold</SelectItem>
                            <SelectItem value="silver">🥈 Silver</SelectItem>
                            <SelectItem value="bronze">🥉 Bronze</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Time</Label><Input value={resultForm.time_recorded} onChange={(e) => setResultForm({ ...resultForm, time_recorded: e.target.value })} placeholder="00:12.34" /></div>
                      <div><Label className="text-xs font-semibold uppercase tracking-wider">Distance</Label><Input value={resultForm.distance_recorded} onChange={(e) => setResultForm({ ...resultForm, distance_recorded: e.target.value })} placeholder="5.67m" /></div>
                    </div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider">Score</Label><Input value={resultForm.score} onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} type="number" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider">Notes</Label><Textarea value={resultForm.notes} onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })} rows={2} /></div>
                    <Button onClick={saveResult} className="w-full bg-primary text-primary-foreground uppercase font-bold tracking-wider">Save Result</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.id} className="p-4 rounded-lg border border-border bg-card flex items-center justify-between gap-4 shadow-card">
                  <div>
                    <h3 className="font-bold font-display text-foreground uppercase">{r.registrations?.child_name} — {r.events?.title}</h3>
                    <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                      {r.position && <span>#{r.position}</span>}
                      {r.time_recorded && <span>{r.time_recorded}</span>}
                      {r.distance_recorded && <span>{r.distance_recorded}</span>}
                      {r.score !== null && <span>Score: {r.score}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.medal && (
                      <Badge className={r.medal === "gold" ? "bg-yellow-100 text-yellow-800" : r.medal === "silver" ? "bg-gray-100 text-gray-700" : "bg-orange-100 text-orange-800"}>
                        {r.medal === "gold" ? "🥇" : r.medal === "silver" ? "🥈" : "🥉"} {r.medal}
                      </Badge>
                    )}
                    <Button size="sm" variant="ghost" className="text-primary gap-1 font-semibold" onClick={() => downloadCertificate({
                      childName: r.registrations?.child_name || "Participant",
                      eventTitle: r.events?.title || "Event",
                      eventDate: r.events?.event_date || "",
                      venue: r.events?.venue || "",
                      city: r.events?.city || "",
                      position: r.position,
                      medal: r.medal,
                      timeRecorded: r.time_recorded,
                      distanceRecorded: r.distance_recorded,
                      score: r.score ? Number(r.score) : null,
                      ageGroup: r.registrations?.age_group,
                      bibNumber: r.registrations?.bib_number,
                    })}>
                      <Download size={14} /> Cert
                    </Button>
                  </div>
                </div>
              ))}
              {results.length === 0 && <p className="text-center text-muted-foreground py-10">No results published yet</p>}
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <h2 className="text-xl font-bold font-display text-foreground mb-4 uppercase">Registered Users ({allUsers.length})</h2>
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    {["Name", "Phone", "School", "City", "Board", "Joined"].map(h => (
                      <th key={h} className="text-left p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="p-3 text-foreground font-medium">{u.full_name || "—"}</td>
                      <td className="p-3 text-foreground">{u.phone || "—"}</td>
                      <td className="p-3 text-foreground">{u.school || "—"}</td>
                      <td className="p-3 text-foreground">{u.city || "—"}</td>
                      <td className="p-3 text-foreground">{u.board || "—"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allUsers.length === 0 && <p className="text-center text-muted-foreground py-8">No users yet</p>}
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <h2 className="text-xl font-bold font-display text-foreground mb-6 uppercase">Analytics & Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-lg border border-border bg-card shadow-card">
                <h3 className="text-sm font-bold font-display text-foreground mb-4 uppercase">Registrations by City</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={regsByCity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220,10%,46%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(220,10%,46%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220,13%,91%)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="hsl(0,85%,50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card shadow-card">
                <h3 className="text-sm font-bold font-display text-foreground mb-4 uppercase">Registrations by Sport</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={regsBySport} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                      {regsBySport.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220,13%,91%)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card shadow-card">
                <h3 className="text-sm font-bold font-display text-foreground mb-4 uppercase">Registrations by Age Group</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={regsByAge}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220,10%,46%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(220,10%,46%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220,13%,91%)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="hsl(28,100%,52%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card shadow-card">
                <h3 className="text-sm font-bold font-display text-foreground mb-4 uppercase">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Revenue</span><span className="font-bold text-foreground">₹{revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Avg per Event</span><span className="font-bold text-foreground">{events.length ? Math.round(registrations.length / events.length) : 0} registrations</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Medals Awarded</span><span className="font-bold text-foreground">{results.filter((r) => r.medal).length}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Paid Registrations</span><span className="font-bold text-foreground">{registrations.filter((r) => r.payment_status === "paid").length}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Pending Payments</span><span className="font-bold text-primary">{registrations.filter((r) => r.payment_status === "pending").length}</span></div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
