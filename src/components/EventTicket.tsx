import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventTicketProps {
  registrationNumber: string;
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  ticketType?: string;
  bibNumber?: string | null;
}

const EventTicket = ({
  registrationNumber,
  attendeeName,
  eventTitle,
  eventDate,
  eventTime,
  venue,
  city,
  ticketType,
  bibNumber,
}: EventTicketProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const qrPayload = JSON.stringify({ reg: registrationNumber });
    QRCode.toDataURL(qrPayload, {
      width: 160,
      margin: 1,
      color: { dark: "#0a0e1a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [registrationNumber]);

  const drawTicket = (ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement) => {
    const W = 900, H = 400;
    ctx.canvas.width = W;
    ctx.canvas.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0a0e1a");
    bg.addColorStop(1, "#121830");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 16);
    ctx.fill();

    // Left accent bar
    const accent = ctx.createLinearGradient(0, 0, 0, H);
    accent.addColorStop(0, "#f97316");
    accent.addColorStop(1, "#dc2626");
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 6, H);

    // Dashed separator
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(249,115,22,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W - 220, 20);
    ctx.lineTo(W - 220, H - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Header
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 28px Oswald, sans-serif";
    ctx.fillText("KHELIUM", 30, 50);
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("SPORTS FOR EVERY CHILD", 30, 68);

    // Event title
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 22px Oswald, sans-serif";
    ctx.fillText(eventTitle.toUpperCase(), 30, 110);

    // Details grid
    const details = [
      { label: "ATTENDEE", value: attendeeName },
      { label: "DATE", value: eventDate },
      { label: "TIME", value: eventTime },
      { label: "VENUE", value: `${venue}, ${city}` },
      ...(ticketType ? [{ label: "TICKET", value: ticketType }] : []),
      ...(bibNumber ? [{ label: "BIB", value: bibNumber }] : []),
    ];

    let y = 145;
    details.forEach((d) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.fillText(d.label, 30, y);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillText(d.value, 30, y + 18);
      y += 40;
    });

    // Registration number badge
    ctx.fillStyle = "rgba(249,115,22,0.15)";
    ctx.beginPath();
    ctx.roundRect(30, H - 55, 200, 32, 6);
    ctx.fill();
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`REG: ${registrationNumber}`, 42, H - 33);

    // QR Code section
    const qrSize = 140;
    const qrX = W - 190;
    const qrY = (H - qrSize) / 2 - 20;

    // QR background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 8);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // "Scan for entry" text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN FOR ENTRY", W - 120, qrY + qrSize + 30);
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText(registrationNumber, W - 120, qrY + qrSize + 46);
    ctx.textAlign = "start";

    // Border
    ctx.strokeStyle = "rgba(249,115,22,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(1, 1, W - 2, H - 2, 16);
    ctx.stroke();
  };

  const downloadTicket = () => {
    if (!canvasRef.current || !qrDataUrl) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      drawTicket(ctx, img);
      const link = document.createElement("a");
      link.download = `KHELIUM_Ticket_${registrationNumber}.png`;
      link.href = canvasRef.current!.toDataURL("image/png");
      link.click();
    };
    img.src = qrDataUrl;
  };

  return (
    <div className="space-y-4">
      {/* Visual ticket preview */}
      <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg" style={{ background: "linear-gradient(135deg, #0a0e1a, #121830)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
        
        <div className="flex">
          {/* Left content */}
          <div className="flex-1 p-6 pr-4">
            <div className="mb-4">
              <h3 className="text-xl font-bold font-display text-primary">KHELIUM</h3>
              <p className="text-[10px] tracking-[3px] text-muted-foreground">SPORTS FOR EVERY CHILD</p>
            </div>

            <h2 className="text-lg font-bold font-display text-white uppercase mb-4">{eventTitle}</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">ATTENDEE</p>
                <p className="text-white font-medium">{attendeeName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">DATE</p>
                <p className="text-white font-medium">{eventDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">TIME</p>
                <p className="text-white font-medium">{eventTime}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">VENUE</p>
                <p className="text-white font-medium">{venue}, {city}</p>
              </div>
              {ticketType && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">TICKET</p>
                  <p className="text-white font-medium">{ticketType}</p>
                </div>
              )}
              {bibNumber && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">BIB</p>
                  <p className="text-white font-medium">{bibNumber}</p>
                </div>
              )}
            </div>

            <div className="mt-4 inline-block px-3 py-1.5 rounded-md bg-primary/15">
              <span className="text-primary font-mono font-bold text-sm">REG: {registrationNumber}</span>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center">
            <div className="w-0 border-l-2 border-dashed border-primary/20 h-[85%]" />
          </div>

          {/* QR section */}
          <div className="flex flex-col items-center justify-center px-6 py-6 min-w-[180px]">
            {qrDataUrl && (
              <div className="bg-white rounded-lg p-2">
                <img src={qrDataUrl} alt="QR Code" className="w-28 h-28" />
              </div>
            )}
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider mt-3 text-center">SCAN FOR ENTRY</p>
            <p className="text-[9px] text-muted-foreground font-mono mt-1">{registrationNumber}</p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <Button onClick={downloadTicket} className="w-full bg-primary text-primary-foreground gap-2 uppercase font-bold tracking-wider">
        <Download size={16} /> Download Ticket
      </Button>
    </div>
  );
};

export default EventTicket;
