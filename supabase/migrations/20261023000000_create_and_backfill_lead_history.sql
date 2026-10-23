-- Migration: Create and backfill public.lead_history
-- Fixes missing relation error: ERROR 42P01: relation "public.lead_history" does not exist
-- Restores call activities and interaction timeline for the Admin Dashboard and Lead Bank

-- 1. Create lead_history table if it does not exist
CREATE TABLE IF NOT EXISTS public.lead_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    lead_id uuid, -- Polymorphic reference (outreach_leads, booking_leads, contact_leads)
    lead_type text NOT NULL CHECK (lead_type IN ('booking', 'contact', 'outreach', 'marketing')),
    event_type text NOT NULL, -- 'call', 'note', 'email', 'status_change', 'follow_up_scheduled', 'email_sent', 'marketing'
    content text,
    admin_id uuid DEFAULT auth.uid()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id ON public.lead_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_created_at ON public.lead_history(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_history_event_type ON public.lead_history(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_history_admin_id ON public.lead_history(admin_id);

-- 3. Enable RLS and create full access policies for authenticated users
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated select lead_history" ON public.lead_history;
CREATE POLICY "authenticated select lead_history" ON public.lead_history FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert lead_history" ON public.lead_history;
CREATE POLICY "authenticated insert lead_history" ON public.lead_history FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update lead_history" ON public.lead_history;
CREATE POLICY "authenticated update lead_history" ON public.lead_history FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated delete lead_history" ON public.lead_history;
CREATE POLICY "authenticated delete lead_history" ON public.lead_history FOR DELETE TO authenticated USING (true);

-- 4. Re-attach No Response status automation trigger if the function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_update_lead_status_no_response') THEN
    DROP TRIGGER IF EXISTS on_lead_history_no_response ON public.lead_history;
    CREATE TRIGGER on_lead_history_no_response
      AFTER INSERT ON public.lead_history
      FOR EACH ROW EXECUTE PROCEDURE public.auto_update_lead_status_no_response();
  END IF;
END $$;

-- 5. Backfill call attempts and notes from outreach_leads
INSERT INTO public.lead_history (lead_id, lead_type, event_type, content, admin_id, created_at)
SELECT 
  id AS lead_id,
  'outreach' AS lead_type,
  'call' AS event_type,
  CASE 
    WHEN notes IS NOT NULL AND trim(notes) != '' THEN 'Call attempt #' || coalesce(call_attempts, 1) || ': ' || notes
    ELSE 'Call attempt #' || coalesce(call_attempts, 1)
  END AS content,
  assignee_id AS admin_id,
  coalesce(created_at, now()) AS created_at
FROM public.outreach_leads
WHERE (call_attempts IS NOT NULL AND call_attempts > 0)
   OR (notes IS NOT NULL AND trim(notes) != '');
