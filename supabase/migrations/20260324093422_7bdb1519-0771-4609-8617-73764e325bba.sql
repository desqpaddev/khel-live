
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default keys
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('smtp_host', ''),
  ('smtp_port', '587'),
  ('smtp_user', ''),
  ('smtp_pass', ''),
  ('smtp_from_email', ''),
  ('smtp_from_name', ''),
  ('whatsapp_api_url', ''),
  ('whatsapp_api_key', ''),
  ('whatsapp_from_number', '');

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
