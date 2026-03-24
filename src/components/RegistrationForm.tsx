import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegistrationFormProps {
  eventId: string;
  userId: string;
  ticketLabel?: string;
  finalPrice: number;
  onSuccess: () => void;
}

const RegistrationForm = ({ eventId, userId, ticketLabel, finalPrice, onSuccess }: RegistrationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", dob: "", phone: "",
    gender: "", address: "", city: "", stateCountry: "", pincode: "",
    photoIdType: "", idNumber: "",
    emergencyContactName: "", emergencyContactPhone: "",
    firstTime: "", bloodGroup: "", swimmingExpertise: "",
    clubOrganization: "", airportTransfer: "No", hotelAccommodation: "No",
    eventTshirt: "No", breakfastPreference: "", termsAccepted: false,
  });

  const set = (key: string, val: string | boolean) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.termsAccepted) {
      toast({ title: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const regId = crypto.randomUUID();
    const { data, error } = await supabase.from("registrations").insert({
      id: regId,
      event_id: eventId,
      user_id: userId,
      first_name: form.firstName,
      last_name: form.lastName,
      child_name: `${form.firstName} ${form.lastName}`,
      parent_name: "",
      email: form.email,
      phone: form.phone,
      school: "",
      age_group: "",
      board: "",
      date_of_birth: form.dob || null,
      gender: form.gender,
      address: form.address,
      city: form.city,
      state_country: form.stateCountry,
      pincode: form.pincode,
      photo_id_type: form.photoIdType,
      id_number: form.idNumber,
      emergency_contact_name: form.emergencyContactName,
      emergency_contact_phone: form.emergencyContactPhone,
      first_time_participation: form.firstTime,
      blood_group: form.bloodGroup,
      swimming_expertise: form.swimmingExpertise,
      club_organization: form.clubOrganization,
      airport_transfer: form.airportTransfer,
      hotel_accommodation: form.hotelAccommodation,
      event_tshirt: form.eventTshirt,
      breakfast_preference: form.breakfastPreference,
      terms_accepted: form.termsAccepted,
    } as any).select().single();

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      const regNumber = data?.registration_number || "";
      toast({ title: "Registration Submitted! 🎉", description: `${form.firstName} ${form.lastName} has been registered (${regNumber}). Redirecting to your ticket...` });
      onSuccess();

      // Send ticket via email (fire & forget)
      supabase.functions.invoke("send-ticket-email", {
        body: {
          to: form.email,
          subject: `Your Event Ticket — ${regNumber}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:2px solid #e53e3e;border-radius:12px;">
            <h1 style="color:#e53e3e;text-align:center;">🎫 Your Event Ticket</h1>
            <p style="text-align:center;font-size:18px;font-weight:bold;">${form.firstName} ${form.lastName}</p>
            <p style="text-align:center;color:#666;">Registration No: <strong>${regNumber}</strong></p>
            <hr style="border:1px solid #eee;margin:16px 0;" />
            <p style="text-align:center;">Please visit your dashboard to download the full ticket with QR code.</p>
            <p style="text-align:center;color:#999;font-size:12px;">Please bring this ticket to the event for check-in.</p>
          </div>`,
        },
      }).catch(() => {});

      // Send WhatsApp notification (fire & forget)
      if (form.phone) {
        supabase.functions.invoke("send-ticket-whatsapp", {
          body: {
            phone: form.phone,
            participantName: `${form.firstName} ${form.lastName}`,
            registrationNumber: regNumber,
          },
        }).catch(() => {});
      }

      setTimeout(() => navigate(`/ticket/${data?.id || regId}`), 1500);
    }
    setSubmitting(false);
  };

  const fieldClass = "space-y-1";
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div className={fieldClass}>
          <Label className={labelClass}>First Name *</Label>
          <Input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="First name" />
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>Last Name *</Label>
          <Input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Last name" />
        </div>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Email *</Label>
        <Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={fieldClass}>
          <Label className={labelClass}>Date of Birth *</Label>
          <Input required type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>Contact Number *</Label>
          <Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." />
        </div>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Gender *</Label>
        <Select required value={form.gender} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Address *</Label>
        <Textarea required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" rows={2} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className={fieldClass}>
          <Label className={labelClass}>City / Town *</Label>
          <Input required value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>State / Country *</Label>
          <Input required value={form.stateCountry} onChange={(e) => set("stateCountry", e.target.value)} />
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>Pin Code *</Label>
          <Input required value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={fieldClass}>
          <Label className={labelClass}>Photo ID Type *</Label>
          <Select required value={form.photoIdType} onValueChange={(v) => set("photoIdType", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Passport", "Voter ID", "Aadhar", "Driving License", "PAN"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>ID Number *</Label>
          <Input required value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="ID number" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={fieldClass}>
          <Label className={labelClass}>Emergency Contact Name *</Label>
          <Input required value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} />
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>Emergency Contact No. *</Label>
          <Input required value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} />
        </div>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>First time in this event? *</Label>
        <Select required value={form.firstTime} onValueChange={(v) => set("firstTime", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {["Yes First Time", "Second Time", "Third Time", "Fourth Time", "Fifth Time"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={fieldClass}>
          <Label className={labelClass}>Blood Group *</Label>
          <Select required value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Others"].map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={fieldClass}>
          <Label className={labelClass}>Swimming Expertise *</Label>
          <Select required value={form.swimmingExpertise} onValueChange={(v) => set("swimmingExpertise", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Beginner", "Intermediate", "Expert", "Pro Swimmer"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Club / Organization *</Label>
        <Input required value={form.clubOrganization} onChange={(e) => set("clubOrganization", e.target.value)} placeholder="Your club or organization" />
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Prepaid Airport / Railway Station Transfer? *</Label>
        <Select required value={form.airportTransfer} onValueChange={(v) => set("airportTransfer", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Hotel Accommodation? *</Label>
        <Select required value={form.hotelAccommodation} onValueChange={(v) => set("hotelAccommodation", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Yes, Budget">Yes, Budget</SelectItem>
            <SelectItem value="Yes, Deluxe">Yes, Deluxe</SelectItem>
            <SelectItem value="Yes, Premium">Yes, Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Event T-Shirt *</Label>
        <Select required value={form.eventTshirt} onValueChange={(v) => set("eventTshirt", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes, I'd love to book my T-Shirt</SelectItem>
            <SelectItem value="No">No, I'll skip this for now</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Would you like to pre-book your souvenir T-shirt?</p>
      </div>

      <div className={fieldClass}>
        <Label className={labelClass}>Breakfast Preference *</Label>
        <Select required value={form.breakfastPreference} onValueChange={(v) => set("breakfastPreference", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Veg">Veg</SelectItem>
            <SelectItem value="Non Veg">Non Veg</SelectItem>
            <SelectItem value="Any">Any</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-secondary">
        <Checkbox
          id="terms"
          checked={form.termsAccepted}
          onCheckedChange={(v) => set("termsAccepted", !!v)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          I accept the <span className="text-primary font-semibold">Terms and Conditions</span>. I confirm all information provided is accurate and I understand the event rules and safety guidelines.
        </label>
      </div>

      <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow uppercase tracking-wider font-bold" size="lg">
        {submitting ? "Registering..." : `Register Now — ₹${finalPrice}`}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Includes RFID bib, medal, certificate & photo</p>
    </form>
  );
};

export default RegistrationForm;
