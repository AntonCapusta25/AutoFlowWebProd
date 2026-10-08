-- Migration: Batch Follow-Up Reminders into a Single Daily Call Digest Email
-- Eliminates individual per-reminder email spam (which sent hundreds/thousands of individual emails per day).
-- Batches all calls to be made into ONE clean digest email per salesperson.
-- Replaces 1-minute cron with a morning daily schedule (07:00 UTC / 09:00 CET).

CREATE OR REPLACE FUNCTION public.check_and_send_reminders()
RETURNS void AS $$
DECLARE
  sp RECORD;
  calls_json jsonb;
  call_count int;
  request_id bigint;
  today_date_str text;
BEGIN
  today_date_str := to_char(now(), 'FMDay, Mon FMDD, YYYY');

  -- 1. Loop through each salesperson who has pending uncompleted reminders for today or overdue
  FOR sp IN
    SELECT DISTINCT salesperson_id, salesperson_email, salesperson_name
    FROM public.reminders
    WHERE sent = false
      AND completed = false
      AND scheduled_at <= now() + interval '16 hours' -- Includes today's full day queue
      AND salesperson_email IS NOT NULL
      AND salesperson_email <> ''
  LOOP
    -- 2. Aggregate all calls for this salesperson into a structured JSON array
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'leadId', r.lead_id,
          'leadName', r.lead_name,
          'leadType', r.lead_type,
          'phone', COALESCE(ol.phone, bl.phone, cl.phone, ''),
          'company', COALESCE(ol.company, bl.service, cl.company, ''),
          'scheduledTime', to_char(r.scheduled_at, 'HH12:MI AM'),
          'notes', r.notes_content
        ) ORDER BY r.scheduled_at ASC
      ),
      count(*)
    INTO calls_json, call_count
    FROM public.reminders r
    LEFT JOIN public.outreach_leads ol ON r.lead_type = 'outreach' AND ol.id = r.lead_id
    LEFT JOIN public.booking_leads bl ON r.lead_type = 'booking' AND bl.id = r.lead_id
    LEFT JOIN public.contact_leads cl ON r.lead_type = 'contact' AND cl.id = r.lead_id
    WHERE r.sent = false
      AND r.completed = false
      AND r.scheduled_at <= now() + interval '16 hours'
      AND r.salesperson_email = sp.salesperson_email;

    -- 3. If there are calls, dispatch exactly ONE batched digest email via pg_net
    IF call_count > 0 AND calls_json IS NOT NULL THEN
      SELECT net.http_post(
        url := 'https://gvuucsammtyweehzqwjo.supabase.co/functions/v1/send-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVjc2FtbXR5d2VlaHpxd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg3NjQsImV4cCI6MjA5MzMxNDc2NH0.0RDHL9bhXaClj0lkHy6ocuquur5rjN7IaslEtia3WzE"}'::jsonb,
        body := jsonb_build_object(
          'type', 'daily_call_digest',
          'recipient', sp.salesperson_email,
          'salespersonName', sp.salesperson_name,
          'date', today_date_str,
          'calls', calls_json
        )
      ) INTO request_id;

      -- Mark all reminders included in this digest as sent
      UPDATE public.reminders
      SET sent = true, updated_at = now()
      WHERE salesperson_email = sp.salesperson_email
        AND sent = false
        AND completed = false
        AND scheduled_at <= now() + interval '16 hours';
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reschedule pg_cron to run once per day at 07:00 UTC (09:00 CET) instead of every minute
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'send-sales-reminders';

    PERFORM cron.schedule(
      'send-sales-reminders',
      '0 7 * * *',
      'select public.check_and_send_reminders();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
