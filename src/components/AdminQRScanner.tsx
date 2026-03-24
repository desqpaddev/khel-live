import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, CheckCircle2, XCircle, Search, Camera, CameraOff, Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScannedAttendee {
  id: string;
  registration_number: string;
  first_name: string;
  last_name: string;
  child_name: string;
  event_title: string;
  checked_in: boolean;
  checked_in_at: string | null;
  bib_number: string | null;
}

const AdminQRScanner = () => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannedAttendee, setScannedAttendee] = useState<ScannedAttendee | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  const startScanner = async () => {
    setError("");
    setScannedAttendee(null);
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => handleScan(text, scanner),
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      setError("Camera access denied or not available. Use manual entry instead.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const handleScan = async (text: string, scanner: Html5Qrcode) => {
    try { await scanner.stop(); } catch {}
    setScanning(false);
    scannerRef.current = null;

    let regNumber = "";
    try {
      const parsed = JSON.parse(text);
      regNumber = parsed.reg || text;
    } catch {
      regNumber = text;
    }
    await lookupRegistration(regNumber);
  };

  const lookupRegistration = async (regNumber: string) => {
    setProcessing(true);
    setError("");
    setScannedAttendee(null);

    const { data, error: err } = await supabase
      .from("registrations")
      .select("*, events(*)")
      .eq("registration_number", regNumber.trim().toUpperCase())
      .single();

    if (err || !data) {
      setError(`No registration found for: ${regNumber}`);
      setProcessing(false);
      return;
    }

    const r = data as any;
    setScannedAttendee({
      id: r.id,
      registration_number: r.registration_number,
      first_name: r.first_name || "",
      last_name: r.last_name || "",
      child_name: r.child_name || "",
      event_title: r.events?.title || "Unknown",
      checked_in: r.checked_in || false,
      checked_in_at: r.checked_in_at,
      bib_number: r.bib_number,
    });
    setProcessing(false);
  };

  const confirmCheckIn = async () => {
    if (!scannedAttendee) return;
    setProcessing(true);

    const { error: err } = await supabase
      .from("registrations")
      .update({ checked_in: true, checked_in_at: new Date().toISOString() } as any)
      .eq("id", scannedAttendee.id);

    if (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Check-in confirmed!", description: `${scannedAttendee.first_name || scannedAttendee.child_name} is checked in.` });
      setScannedAttendee({ ...scannedAttendee, checked_in: true, checked_in_at: new Date().toISOString() });
    }
    setProcessing(false);
  };

  const handleManualLookup = () => {
    if (manualCode.trim()) {
      lookupRegistration(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground uppercase flex items-center gap-2">
          <QrCode size={24} className="text-primary" /> Entry Scanner
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner area */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold font-display uppercase text-sm text-foreground">QR Code Scanner</h3>
          
          <div id={containerId} className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black min-h-[280px]" />

          <div className="flex gap-2 justify-center">
            {!scanning ? (
              <Button onClick={startScanner} className="bg-primary text-primary-foreground gap-2 uppercase font-semibold tracking-wider">
                <Camera size={16} /> Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline" className="gap-2 uppercase font-semibold tracking-wider">
                <CameraOff size={16} /> Stop Camera
              </Button>
            )}
          </div>

          {/* Manual entry */}
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Or enter Registration ID manually</p>
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="e.g. A001"
                className="font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
              />
              <Button onClick={handleManualLookup} variant="outline" className="shrink-0 gap-1">
                <Search size={14} /> Look Up
              </Button>
            </div>
          </div>
        </div>

        {/* Result display */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-bold font-display uppercase text-sm text-foreground mb-4">Scan Result</h3>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle size={24} className="text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {processing && (
            <p className="text-muted-foreground text-center py-8">Looking up registration...</p>
          )}

          {scannedAttendee && !processing && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                scannedAttendee.checked_in 
                  ? "border-green-500/50 bg-green-500/5" 
                  : "border-primary/50 bg-primary/5"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="font-mono text-sm">{scannedAttendee.registration_number}</Badge>
                  {scannedAttendee.checked_in ? (
                    <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 size={12} /> Checked In</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">Not Checked In</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Attendee</span>
                    <p className="font-bold text-foreground text-lg">{scannedAttendee.first_name} {scannedAttendee.last_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Event</span>
                    <p className="font-semibold text-foreground">{scannedAttendee.event_title}</p>
                  </div>
                  {scannedAttendee.bib_number && (
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">BIB Number</span>
                      <p className="font-semibold text-foreground">{scannedAttendee.bib_number}</p>
                    </div>
                  )}
                  {scannedAttendee.checked_in && scannedAttendee.checked_in_at && (
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Checked In At</span>
                      <p className="text-foreground">{new Date(scannedAttendee.checked_in_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {!scannedAttendee.checked_in && (
                <Button 
                  onClick={confirmCheckIn}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 uppercase font-bold tracking-wider text-lg py-6"
                >
                  <CheckCircle2 size={20} /> Confirm Entry
                </Button>
              )}

              {scannedAttendee.checked_in && (
                <div className="text-center py-3">
                  <p className="text-green-600 font-bold text-lg flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} /> Already Checked In
                  </p>
                </div>
              )}

              <Button
                onClick={() => { setScannedAttendee(null); setError(""); }}
                variant="outline"
                className="w-full uppercase font-semibold tracking-wider"
              >
                Scan Next
              </Button>
            </div>
          )}

          {!scannedAttendee && !processing && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <QrCode size={48} className="mx-auto mb-3 opacity-30" />
              <p>Scan a QR code or enter a registration ID to check in an attendee</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQRScanner;
