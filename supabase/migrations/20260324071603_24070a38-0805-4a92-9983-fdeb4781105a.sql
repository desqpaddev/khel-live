
CREATE TABLE public.discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('code', 'group', 'flat', 'loyalty', 'affiliate')),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  discount_value NUMERIC NOT NULL DEFAULT 0,
  discount_unit TEXT NOT NULL DEFAULT 'percent' CHECK (discount_unit IN ('percent', 'flat')),
  min_group_size INTEGER,
  min_past_events INTEGER,
  affiliate_source TEXT,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discounts are viewable by everyone" ON public.discounts FOR SELECT USING (true);
CREATE POLICY "Admins can insert discounts" ON public.discounts FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update discounts" ON public.discounts FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete discounts" ON public.discounts FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE UNIQUE INDEX discounts_code_unique ON public.discounts (code) WHERE code IS NOT NULL AND code != '';
