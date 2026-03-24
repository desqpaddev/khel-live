
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 100,
  sale_start TIMESTAMP WITH TIME ZONE,
  sale_end TIMESTAMP WITH TIME ZONE,
  attendee_message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tickets are viewable by everyone" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Admins can insert tickets" ON public.tickets FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update tickets" ON public.tickets FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete tickets" ON public.tickets FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
