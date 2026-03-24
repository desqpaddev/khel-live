
-- Add registration_number column
ALTER TABLE public.registrations ADD COLUMN registration_number text UNIQUE;

-- Create sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS public.registration_number_seq START 1;

-- Function to auto-generate registration number on insert
CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.registration_number := 'A' || LPAD(nextval('public.registration_number_seq')::text, 3, '0');
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER set_registration_number
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_registration_number();

-- Backfill existing registrations
UPDATE public.registrations
SET registration_number = 'A' || LPAD(nextval('public.registration_number_seq')::text, 3, '0')
WHERE registration_number IS NULL;
