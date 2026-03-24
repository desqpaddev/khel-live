export interface CertificateData {
  childName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  city: string;
  position?: number | null;
  medal?: string | null;
  timeRecorded?: string | null;
  distanceRecorded?: string | null;
  score?: number | null;
  ageGroup?: string;
  bibNumber?: string | null;
}

export const generateCertificateSVG = (data: CertificateData): string => {
  const medalEmoji = data.medal === "gold" ? "🥇" : data.medal === "silver" ? "🥈" : data.medal === "bronze" ? "🥉" : "";
  const medalText = data.medal ? data.medal.charAt(0).toUpperCase() + data.medal.slice(1) + " Medal" : "Participation";
  const performanceLines: string[] = [];
  if (data.position) performanceLines.push(`Position: #${data.position}`);
  if (data.timeRecorded) performanceLines.push(`Time: ${data.timeRecorded}`);
  if (data.distanceRecorded) performanceLines.push(`Distance: ${data.distanceRecorded}`);
  if (data.score !== null && data.score !== undefined) performanceLines.push(`Score: ${data.score}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="100%" stop-color="#121830"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="border" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="800" height="560" fill="url(#bg)" rx="12"/>
  <rect x="12" y="12" width="776" height="536" rx="8" fill="none" stroke="url(#border)" stroke-width="2" opacity="0.6"/>
  <rect x="24" y="24" width="752" height="512" rx="6" fill="none" stroke="url(#border)" stroke-width="0.5" opacity="0.3"/>
  
  <text x="400" y="70" text-anchor="middle" font-family="serif" font-size="14" fill="#94a3b8" letter-spacing="6">CERTIFICATE OF ${data.medal ? "ACHIEVEMENT" : "PARTICIPATION"}</text>
  <text x="400" y="110" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#f97316">KHELIUM</text>
  <text x="400" y="132" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b" letter-spacing="3">SPORTS FOR EVERY CHILD</text>
  
  <line x1="200" y1="150" x2="600" y2="150" stroke="#f97316" stroke-width="0.5" opacity="0.4"/>
  
  <text x="400" y="185" text-anchor="middle" font-family="serif" font-size="13" fill="#94a3b8">This is to certify that</text>
  <text x="400" y="225" text-anchor="middle" font-family="serif" font-size="32" font-weight="bold" fill="#f1f5f9">${escapeXml(data.childName)}</text>
  <line x1="200" y1="240" x2="600" y2="240" stroke="#475569" stroke-width="0.5"/>
  
  <text x="400" y="275" text-anchor="middle" font-family="serif" font-size="13" fill="#94a3b8">has successfully participated in</text>
  <text x="400" y="305" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="#fbbf24">${escapeXml(data.eventTitle)}</text>
  <text x="400" y="335" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748b">${escapeXml(data.venue)}, ${escapeXml(data.city)} · ${escapeXml(data.eventDate)}</text>
  
  ${data.medal ? `<text x="400" y="375" text-anchor="middle" font-size="36">${medalEmoji}</text>
  <text x="400" y="405" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#fbbf24">${medalText}</text>` : 
  `<text x="400" y="390" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#94a3b8">${medalText} Certificate</text>`}
  
  ${performanceLines.length > 0 ? `<text x="400" y="${data.medal ? 435 : 420}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">${performanceLines.join("  ·  ")}</text>` : ""}
  
  ${data.ageGroup ? `<text x="160" y="500" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Age Group: ${data.ageGroup}</text>` : ""}
  ${data.bibNumber ? `<text x="400" y="500" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">BIB: ${data.bibNumber}</text>` : ""}
  <text x="640" y="500" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">KHELIUM Official</text>
  
  <line x1="560" y1="480" x2="720" y2="480" stroke="#475569" stroke-width="0.5"/>
  <text x="640" y="520" text-anchor="middle" font-family="serif" font-size="9" fill="#334155">Authorized Signature</text>
</svg>`;
};

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const downloadCertificate = (data: CertificateData) => {
  const svg = generateCertificateSVG(data);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `KHELIUM_Certificate_${data.childName.replace(/\s+/g, "_")}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
