-- Migration: Add is_favorite boolean column and index to outreach_leads
ALTER TABLE public.outreach_leads 
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_outreach_leads_is_favorite 
ON public.outreach_leads(is_favorite);
