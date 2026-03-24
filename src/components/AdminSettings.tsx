import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Mail, MessageSquare, Eye, EyeOff, Save } from "lucide-react";

const SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_email", "smtp_from_name"];
const WA_KEYS = ["whatsapp_api_url", "whatsapp_api_key", "whatsapp_from_number"];

const LABELS: Record<string, string> = {
  smtp_host: "SMTP Host",
  smtp_port: "SMTP Port",
  smtp_user: "SMTP Username",
  smtp_pass: "SMTP Password",
  smtp_from_email: "From Email",
  smtp_from_name: "From Name",
  whatsapp_api_url: "WhatsApp API URL",
  whatsapp_api_key: "WhatsApp API Key",
  whatsapp_from_number: "WhatsApp From Number",
};

const PLACEHOLDERS: Record<string, string> = {
  smtp_host: "smtp.gmail.com",
  smtp_port: "587",
  smtp_user: "your-email@gmail.com",
  smtp_pass: "app-password",
  smtp_from_email: "noreply@yourdomain.com",
  smtp_from_name: "Kochi Swimathon",
  whatsapp_api_url: "https://api.whatsapp.com/...",
  whatsapp_api_key: "your-api-key",
  whatsapp_from_number: "+91...",
};

const SECRET_KEYS = ["smtp_pass", "whatsapp_api_key"];

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("app_settings").select("setting_key, setting_value") as any;
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((r: any) => { map[r.setting_key] = r.setting_value; });
      setSettings(map);
    }
    setLoading(false);
  };

  const saveSettings = async (keys: string[]) => {
    setSaving(true);
    for (const key of keys) {
      await supabase.from("app_settings").update({ setting_value: settings[key] || "" } as any).eq("setting_key", key);
    }
    toast({ title: "Settings saved ✅" });
    setSaving(false);
  };

  const sendTestEmail = async () => {
    if (!testEmail) { toast({ title: "Enter a test email", variant: "destructive" }); return; }
    setTestingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-ticket-email", {
        body: { to: testEmail, subject: "Test Email from Admin", html: "<h1>Test Email</h1><p>Your SMTP settings are working correctly!</p>", isTest: true },
      });
      if (error) throw error;
      toast({ title: "Test email sent! 📧" });
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    }
    setTestingEmail(false);
  };

  const set = (key: string, val: string) => setSettings((p) => ({ ...p, [key]: val }));

  if (loading) return <p className="text-center text-muted-foreground py-10">Loading settings...</p>;

  const fieldClass = "space-y-1";
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

  const renderField = (key: string) => {
    const isSecret = SECRET_KEYS.includes(key);
    return (
      <div key={key} className={fieldClass}>
        <Label className={labelClass}>{LABELS[key]}</Label>
        <div className="relative">
          <Input
            type={isSecret && !showSecrets[key] ? "password" : "text"}
            value={settings[key] || ""}
            onChange={(e) => set(key, e.target.value)}
            placeholder={PLACEHOLDERS[key]}
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => setShowSecrets((p) => ({ ...p, [key]: !p[key] }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecrets[key] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* SMTP Settings */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={20} className="text-primary" />
          <h3 className="text-lg font-bold font-display text-foreground uppercase">SMTP Email Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Configure SMTP to send ticket emails to participants after registration.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SMTP_KEYS.map(renderField)}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button onClick={() => saveSettings(SMTP_KEYS)} disabled={saving} className="gap-2 uppercase font-semibold tracking-wider">
            <Save size={16} /> Save SMTP Settings
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Label className={labelClass}>Send Test Email</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@email.com"
              className="max-w-xs"
            />
            <Button variant="outline" onClick={sendTestEmail} disabled={testingEmail} className="uppercase text-xs font-semibold">
              {testingEmail ? "Sending..." : "Send Test"}
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-primary" />
          <h3 className="text-lg font-bold font-display text-foreground uppercase">WhatsApp API Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Configure WhatsApp Business API to send ticket notifications via WhatsApp.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WA_KEYS.map(renderField)}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button onClick={() => saveSettings(WA_KEYS)} disabled={saving} className="gap-2 uppercase font-semibold tracking-wider">
            <Save size={16} /> Save WhatsApp Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
