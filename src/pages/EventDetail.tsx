import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Shield, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events } from "@/lib/data";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const EventDetail = () => {
  const { id } = useParams();
  const event = events.find((e) => e.id === id);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    childName: "",
    parentName: "",
    email: "",
    phone: "",
    school: "",
    ageGroup: "",
    board: "",
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-background pt-24 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <Link to="/events">
          <Button variant="ghost" className="mt-4 text-primary">← Back to Events</Button>
        </Link>
      </div>
    );
  }

  const spotsPercent = ((event.totalSpots - event.spotsLeft) / event.totalSpots) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Submitted! 🎉",
      description: `${formData.childName} has been registered for ${event.title}. Confirmation will be sent to ${formData.email}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-10">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Event Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Badge variant="secondary" className="mb-3 bg-secondary text-secondary-foreground">{event.sport}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{event.title}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <Calendar size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-medium text-foreground">{event.date} · {event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <MapPin size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="text-sm font-medium text-foreground">{event.venue}, {event.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <Users size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Age Groups</p>
                  <p className="text-sm font-medium text-foreground">{event.ageGroups.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <Clock size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="text-sm font-medium text-foreground">{event.spotsLeft} of {event.totalSpots} spots left</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-3">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{event.description}</p>

            <h2 className="text-xl font-bold text-foreground mb-4">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <Shield size={20} />, label: "RFID Timing", desc: "Professional electronic timing" },
                { icon: <Award size={20} />, label: "Medal & Certificate", desc: "For all participants" },
                { icon: <Heart size={20} />, label: "Safety First", desc: "On-site medical team" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-card border border-border text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-foreground">₹{event.price}</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">per participant</Badge>
              </div>

              {/* Capacity bar */}
              <div className="mb-6">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${spotsPercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{event.spotsLeft} spots remaining</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-foreground text-xs">Child's Name</Label>
                  <Input required value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} className="bg-muted border-border text-foreground" placeholder="Full name" />
                </div>
                <div>
                  <Label className="text-foreground text-xs">Parent's Name</Label>
                  <Input required value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className="bg-muted border-border text-foreground" placeholder="Full name" />
                </div>
                <div>
                  <Label className="text-foreground text-xs">Email</Label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-muted border-border text-foreground" placeholder="parent@email.com" />
                </div>
                <div>
                  <Label className="text-foreground text-xs">Phone</Label>
                  <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-muted border-border text-foreground" placeholder="+91 ..." />
                </div>
                <div>
                  <Label className="text-foreground text-xs">School</Label>
                  <Input required value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} className="bg-muted border-border text-foreground" placeholder="School name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-foreground text-xs">Age Group</Label>
                    <Select value={formData.ageGroup} onValueChange={(v) => setFormData({ ...formData, ageGroup: v })}>
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {event.ageGroups.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground text-xs">Board</Label>
                    <Select value={formData.board} onValueChange={(v) => setFormData({ ...formData, board: v })}>
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                        <SelectItem value="State">State Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow" size="lg">
                  Register Now — ₹{event.price}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Includes RFID bib, medal, certificate & photo
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
