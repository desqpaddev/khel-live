import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [regId, setRegId] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const registrationId = searchParams.get("reg_id");
    if (!orderId || !registrationId) {
      setStatus("failed");
      return;
    }
    setRegId(registrationId);
    verifyPayment(orderId, registrationId);
  }, []);

  const verifyPayment = async (orderId: string, registrationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-cashfree-payment", {
        body: { orderId, registrationId },
      });

      if (error) throw error;

      if (data.success) {
        setStatus("success");

        // Fetch registration details for sending notifications
        const { data: reg } = await supabase
          .from("registrations")
          .select("*")
          .eq("id", registrationId)
          .single();

        if (reg) {
          // Send ticket email
          supabase.functions.invoke("send-ticket-email", {
            body: {
              to: reg.email,
              subject: `Your Event Ticket — ${reg.registration_number}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:2px solid #e53e3e;border-radius:12px;">
                <h1 style="color:#e53e3e;text-align:center;">🎫 Your Event Ticket</h1>
                <p style="text-align:center;font-size:18px;font-weight:bold;">${reg.first_name} ${reg.last_name}</p>
                <p style="text-align:center;color:#666;">Registration No: <strong>${reg.registration_number}</strong></p>
                <p style="text-align:center;color:#28a745;font-weight:bold;">✅ Payment Confirmed</p>
                <hr style="border:1px solid #eee;margin:16px 0;" />
                <p style="text-align:center;">Please visit your dashboard to download the full ticket with QR code.</p>
              </div>`,
            },
          }).catch(() => {});

          // Send WhatsApp
          if (reg.phone) {
            supabase.functions.invoke("send-ticket-whatsapp", {
              body: {
                phone: reg.phone,
                participantName: `${reg.first_name} ${reg.last_name}`,
                registrationNumber: reg.registration_number,
              },
            }).catch(() => {});
          }
        }

        toast({ title: "Payment Successful! 🎉" });
      } else {
        setStatus("failed");
        toast({ title: "Payment failed", variant: "destructive" });
      }
    } catch (e: any) {
      console.error("Verify error:", e);
      setStatus("failed");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 p-8 rounded-lg border border-border bg-card text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin mb-4" />
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">Verifying Payment</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">Your registration is confirmed. Check your email for the ticket.</p>
            <div className="space-y-3">
              <Button onClick={() => navigate(`/ticket/${regId}`)} className="w-full bg-primary text-primary-foreground uppercase tracking-wider font-bold">
                View My Ticket
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">Something went wrong with your payment. Please try again.</p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/events")} className="w-full bg-primary text-primary-foreground uppercase tracking-wider font-bold">
                Back to Events
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
