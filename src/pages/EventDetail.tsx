import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Shield, Award, Heart, Ticket, Tag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import RegistrationForm from "@/components/RegistrationForm";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type TicketRow = {
  id: string; event_id: string; ticket_type: string; description: string | null;
  price: number; quantity: number; sale_start: string | null; sale_end: string | null;
  attendee_message: string | null; status: string;
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [spotsLeft, setSpotsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ name: string; value: number; unit: string } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);



  useEffect(() => {
    const fetchEvent = async () => {
      const [{ data }, { data: ticketData }] = await Promise.all([
        supabase.from("events").select("*").eq("id", id!).single(),
        supabase.from("tickets").select("*").eq("event_id", id!).eq("status", "active").order("price"),
      ]);
      if (data) {
        setEvent(data);
        const { data: spots } = await supabase.rpc("get_event_spots_left", { event_id: data.id });
        setSpotsLeft(spots ?? data.total_spots);
      }
      if (ticketData && ticketData.length > 0) {
        setTickets(ticketData as unknown as TicketRow[]);
        setSelectedTicket(ticketData[0] as unknown as TicketRow);
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
  const displayPrice = selectedTicket ? selectedTicket.price : event.price;

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    setApplyingCode(true);
    setDiscountError("");
    setAppliedDiscount(null);

    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", discountCode.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      setDiscountError("Invalid or expired discount code");
      setApplyingCode(false);
      return;
    }

    const d = data as any;
    const now = new Date();
    if (d.valid_from && new Date(d.valid_from) > now) { setDiscountError("This code is not active yet"); setApplyingCode(false); return; }
    if (d.valid_until && new Date(d.valid_until) < now) { setDiscountError("This code has expired"); setApplyingCode(false); return; }
    if (d.max_uses && d.used_count >= d.max_uses) { setDiscountError("This code has reached its usage limit"); setApplyingCode(false); return; }
    if (d.event_id && d.event_id !== event.id) { setDiscountError("This code is not valid for this event"); setApplyingCode(false); return; }
    if (d.ticket_id && selectedTicket && d.ticket_id !== selectedTicket.id) { setDiscountError("This code is not valid for this ticket type"); setApplyingCode(false); return; }

    setAppliedDiscount({ name: d.name, value: d.discount_value, unit: d.discount_unit });
    setApplyingCode(false);
  };

  const discountAmount = appliedDiscount
    ? appliedDiscount.unit === "percent"
      ? Math.round(displayPrice * appliedDiscount.value / 100)
      : Math.min(appliedDiscount.value, displayPrice)
    : 0;
  const finalPrice = displayPrice - discountAmount;

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
      const msg = selectedTicket?.attendee_message
        ? `${formData.childName} has been registered for ${event.title}. ${selectedTicket.attendee_message}`
        : `${formData.childName} has been registered for ${event.title}.`;
      toast({ title: "Registration Submitted! 🎉", description: msg });
      setFormData({ childName: "", parentName: "", email: "", phone: "", school: "", ageGroup: "", board: "" });
      const { data: spots } = await supabase.rpc("get_event_spots_left", { event_id: event.id });
      setSpotsLeft(spots ?? spotsLeft - 1);
    }
    setSubmitting(false);
  };

  const now = new Date();
  const isTicketOnSale = (t: TicketRow) => {
    if (t.sale_start && new Date(t.sale_start) > now) return false;
    if (t.sale_end && new Date(t.sale_end) < now) return false;
    return true;
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

            {/* Ticket Options */}
            {tickets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold font-display text-foreground mb-4 uppercase flex items-center gap-2">
                  <Ticket size={20} className="text-primary" /> Available Tickets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tickets.map((t) => {
                    const onSale = isTicketOnSale(t);
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => onSale && setSelectedTicket(t)}
                        className={`relative p-5 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : onSale
                            ? "border-border bg-card hover:border-primary/50"
                            : "border-border bg-muted opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">✓</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-primary/10 text-primary font-semibold">{t.ticket_type}</Badge>
                          <span className="text-lg font-bold font-display text-foreground">₹{t.price}</span>
                        </div>
                        {t.description && <p className="text-sm text-muted-foreground mb-2">{t.description}</p>}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t.quantity} available</span>
                          {!onSale && (
                            <Badge variant="outline" className="text-xs">
                              {t.sale_start && new Date(t.sale_start) > now ? "Not on sale yet" : "Sale ended"}
                            </Badge>
                          )}
                          {onSale && t.sale_end && (
                            <span>Ends {new Date(t.sale_end).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold font-display text-foreground">₹{displayPrice}</span>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                  {selectedTicket ? selectedTicket.ticket_type : "per participant"}
                </Badge>
              </div>
              {selectedTicket && (
                <p className="text-xs text-muted-foreground mb-4">{selectedTicket.description}</p>
              )}

              <div className="mb-6">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${spotsPercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{spotsLeft} spots remaining</p>
              </div>

              {/* Ticket selector in sidebar for quick switch */}
              {tickets.length > 1 && (
                <div className="mb-4">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Ticket Type</Label>
                  <Select value={selectedTicket?.id || ""} onValueChange={(v) => setSelectedTicket(tickets.find(t => t.id === v) || null)}>
                    <SelectTrigger><SelectValue placeholder="Select ticket" /></SelectTrigger>
                    <SelectContent>
                      {tickets.filter(isTicketOnSale).map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.ticket_type} — ₹{t.price}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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

                  {/* Discount Code */}
                  <div className="border border-dashed border-border rounded-lg p-3 space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Tag size={12} /> Discount Code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={discountCode}
                        onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(""); }}
                        placeholder="Enter code"
                        className="font-mono text-sm flex-1"
                        disabled={!!appliedDiscount}
                      />
                      {appliedDiscount ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }} className="text-xs shrink-0">Remove</Button>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={applyDiscountCode} disabled={applyingCode || !discountCode.trim()} className="text-xs shrink-0">{applyingCode ? "..." : "Apply"}</Button>
                      )}
                    </div>
                    {discountError && <p className="text-xs text-destructive">{discountError}</p>}
                    {appliedDiscount && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Check size={12} /> {appliedDiscount.name} — {appliedDiscount.unit === "percent" ? `${appliedDiscount.value}% off` : `₹${appliedDiscount.value} off`}
                      </div>
                    )}
                  </div>

                  {/* Price Summary */}
                  {discountAmount > 0 && (
                    <div className="bg-secondary rounded-lg p-3 space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground"><span>Ticket Price</span><span>₹{displayPrice}</span></div>
                      <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discountAmount}</span></div>
                      <div className="flex justify-between font-bold text-foreground border-t border-border pt-1"><span>Total</span><span>₹{finalPrice}</span></div>
                    </div>
                  )}

                  <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow uppercase tracking-wider font-bold" size="lg">
                    {submitting ? "Registering..." : `Register Now — ₹${finalPrice}`}
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
