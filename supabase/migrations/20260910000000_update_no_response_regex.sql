-- Migration: Update 'No Response' trigger regex to catch all NA, N.A., N.A, N/A, N-A, N A variations
CREATE OR REPLACE FUNCTION public.auto_update_lead_status_no_response()
RETURNS trigger AS $$
BEGIN
  -- Check if the note/call content contains any variation of no response, nr, vm, voicemail, no answer, na, n.a., n/a, etc.
  IF (new.event_type = 'note' OR new.event_type = 'call') AND 
     (new.content ~* '(^|\y|\s)(no[ -]?response|no[ -]?answer|no[ -]?ans|nr|n[._/]?r[._]?|vm|v[._/]?m[._]?|voicemail|voice[ -]?mail|na|n[._/]?a[._]?|n[ -.]a|geen[ -]?gehoor|ingesproken)(\y|\s|$|[.,;!])|left (a )?(vm|voicemail|voice[ -]?mail)') THEN
     
    -- Update lead status to 'No Response' based on lead type
    IF new.lead_type = 'booking' THEN
      UPDATE public.booking_leads
      SET status = 'No Response'
      WHERE id = new.lead_id;
    ELSIF new.lead_type = 'contact' THEN
      UPDATE public.contact_leads
      SET status = 'No Response'
      WHERE id = new.lead_id;
    ELSIF new.lead_type = 'outreach' THEN
      UPDATE public.outreach_leads
      SET status = 'No Response'
      WHERE id = new.lead_id;
    END IF;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to public.lead_history
DROP TRIGGER IF EXISTS on_lead_history_no_response ON public.lead_history;
CREATE TRIGGER on_lead_history_no_response
  AFTER INSERT ON public.lead_history
  FOR EACH ROW EXECUTE PROCEDURE public.auto_update_lead_status_no_response();
