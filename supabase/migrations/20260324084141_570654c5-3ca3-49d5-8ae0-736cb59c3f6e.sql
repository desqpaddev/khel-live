ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone;