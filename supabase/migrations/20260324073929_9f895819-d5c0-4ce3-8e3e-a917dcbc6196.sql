
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state_country text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS photo_id_type text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS first_time_participation text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS swimming_expertise text,
  ADD COLUMN IF NOT EXISTS club_organization text,
  ADD COLUMN IF NOT EXISTS airport_transfer text DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS hotel_accommodation text DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS event_tshirt text DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS breakfast_preference text,
  ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false;

-- Make child_name nullable since we now use first_name/last_name
ALTER TABLE public.registrations ALTER COLUMN child_name DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN child_name SET DEFAULT '';
ALTER TABLE public.registrations ALTER COLUMN parent_name DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN parent_name SET DEFAULT '';
ALTER TABLE public.registrations ALTER COLUMN school DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN school SET DEFAULT '';
ALTER TABLE public.registrations ALTER COLUMN age_group DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN age_group SET DEFAULT '';
ALTER TABLE public.registrations ALTER COLUMN board DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN board SET DEFAULT '';
