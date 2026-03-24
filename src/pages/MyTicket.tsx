import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import EventTicket from "@/components/EventTicket";

const MyTicket = () => {
  const { regId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!regId || !user) { setLoading(false); return; }
      const { data } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("id", regId)
        .eq("user_id", user.id)
        .single();
      if (data) setTicketData(data);
      setLoading(false);
    };
    fetch();
  }, [regId, user]);

  if (loading) return <div className="min-h-screen bg-background pt-24 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-background pt-24 text-center">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link to="/dashboard"><Button variant="ghost" className="mt-4 text-primary">← Back to Dashboard</Button></Link>
      </div>
    );
  }

  const ev = ticketData.events;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold font-display text-foreground uppercase mb-2">Your Event Ticket</h1>
        <p className="text-muted-foreground text-sm mb-6">Present this ticket at the event entrance. The QR code will be scanned for entry confirmation.</p>

        <EventTicket
          registrationNumber={ticketData.registration_number || "—"}
          attendeeName={`${ticketData.first_name || ""} ${ticketData.last_name || ""}`.trim() || ticketData.child_name}
          eventTitle={ev?.title || ""}
          eventDate={ev?.event_date || ""}
          eventTime={ev?.event_time || ""}
          venue={ev?.venue || ""}
          city={ev?.city || ""}
          ticketType={undefined}
          bibNumber={ticketData.bib_number}
        />
      </div>
    </div>
  );
};

export default MyTicket;
