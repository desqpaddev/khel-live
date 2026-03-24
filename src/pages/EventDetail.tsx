import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Shield, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [spotsLeft, setSpotsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    childName: "", parentName: "", email: "", phone: "", school: "", ageGroup: "", board: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id!).single();
      if (data) {
        setEvent(data);
        const { data: spots } = await supabase.rpc("get_event_spots_left", { event_id: data.id });
        setSpotsLeft(spots ?? data.total_spots);
      }
      setLoading(false);
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background pt-24 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background pt-24 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <Link to="/events"><Button variant="ghost" className="mt-4 text-primary">← Back to Events</Button></Link>
      </div>
    );
  }

  const spotsPercent = ((event.total_spots - spotsLeft) / event.total_spots) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to register.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from("registrations").insert({
      event_id: event.id,
      user_id: user.id,
      child_name: formData.childName,
      parent_name: formData.parentName,
      email: formData.email,
      phone: formData.phone,
      school: formData.school,
      age_group: formData.ageGroup,
      board: formData.board,
    });

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registration Submitted! 🎉", description: `${formData.childName} has been registered for ${event.title}.` });
      setFormData({ childName: "", parentName: "", email: "", phone: "", school: "", ageGroup: "", board: "" });
      const { data: spots } = await supabase.rpc("get_event_spots_left", { event_id: event.id });
      setSpotsLeft(spots ?? spotsLeft - 1);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero banner */}
      <div className="section-dark">
        <div className="container mx-auto px-4 py-10">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary mb-4">
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3 font-semibold uppercase tracking-wider">{event.sport}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white uppercase">{event.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
                <Calendar size={20} className="text-primary" />
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Date & Time</p><p className="text-sm font-semibold text-foreground">{event.event_date} · {event.event_time}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
                <MapPin size={20} className="text-primary" />
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Venue</p><p className="text-sm font-semibold text-foreground">{event.venue}, {event.city}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
                <Users size={20} className="text-primary" />
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Age Groups</p><p className="text-sm font-semibold text-foreground">{event.age_groups.join(", ")}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
                <Clock size={20} className="text-primary" />
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Availability</p><p className="text-sm font-semibold text-foreground">{spotsLeft} of {event.total_spots} spots left</p></div>
              </div>
            </div>

            <h2 className="text-xl font-bold font-display text-foreground mb-3 uppercase">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{event.description}</p>

            <h2 className="text-xl font-bold font-display text-foreground mb-4 uppercase">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Shield size={20} />, label: "RFID Timing", desc: "Professional electronic timing" },
                { icon: <Award size={20} />, label: "Medal & Certificate", desc: "For all participants" },
                { icon: <Heart size={20} />, label: "Safety First", desc: "On-site medical team" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-secondary border border-border text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">{item.icon}</div>
                  <p className="text-sm font-bold font-display text-foreground uppercase">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold font-display text-foreground">₹{event.price}</span>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">per participant</Badge>
              </div>

              <div className="mb-6">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${spotsPercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{spotsLeft} spots remaining</p>
              </div>

              {!user ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">Sign in to register</p>
                  <Link to="/auth"><Button className="bg-primary text-primary-foreground w-full uppercase tracking-wider font-bold">Sign In / Sign Up</Button></Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label className="text-xs font-semibold uppercase tracking-wider">Child's Name</Label><Input required value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} placeholder="Full name" /></div>
                  <div><Label className="text-xs font-semibold uppercase tracking-wider">Parent's Name</Label><Input required value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} placeholder="Full name" /></div>
                  <div><Label className="text-xs font-semibold uppercase tracking-wider">Email</Label><Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="parent@email.com" /></div>
                  <div><Label className="text-xs font-semibold uppercase tracking-wider">Phone</Label><Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 ..." /></div>
                  <div><Label className="text-xs font-semibold uppercase tracking-wider">School</Label><Input required value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} placeholder="School name" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider">Age Group</Label>
                      <Select value={formData.ageGroup} onValueChange={(v) => setFormData({ ...formData, ageGroup: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {event.age_groups.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider">Board</Label>
                      <Select value={formData.board} onValueChange={(v) => setFormData({ ...formData, board: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CBSE">CBSE</SelectItem>
                          <SelectItem value="ICSE">ICSE</SelectItem>
                          <SelectItem value="State">State Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow uppercase tracking-wider font-bold" size="lg">
                    {submitting ? "Registering..." : `Register Now — ₹${event.price}`}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Includes RFID bib, medal, certificate & photo</p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
