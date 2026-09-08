-- Migration: Expanded "No Response" lead automation and English template configuration
-- Updates lead status to 'No Response' when notes contain any variation of no response (nr, vm, voicemail, no answer, na, etc.)
-- Enables the English 'No Response' email template in email_templates.

CREATE OR REPLACE FUNCTION public.auto_update_lead_status_no_response()
RETURNS trigger AS $$
BEGIN
  -- Check if the note/call content contains any variation of no response, nr, vm, voicemail, no answer, na, etc.
  IF (new.event_type = 'note' OR new.event_type = 'call') AND 
     (new.content ~* '\y(no[ -]?response|no[ -]?answer|no[ -]?ans|nr|n\.r\.|n/r|vm|v\.m\.|v/m|voicemail|voice[ -]?mail|na|n\.a\.|n/a|geen[ -]?gehoor|ingesproken)\y|left (a )?(vm|voicemail|voice[ -]?mail)') THEN
     
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

-- Enable English 'No Response' template in email_templates table
INSERT INTO email_templates (status, subject, body, enabled)
VALUES (
  'No Response',
  'Checking in, {{name}} 👋',
  '<p>Hi {{name}},</p><p>We noticed we haven''t been able to connect with you yet. We''d love to learn more about your automation needs — feel free to reply or book a time that suits you.</p><p>Best,<br/>AutoFlow Studio</p>',
  true
)
ON CONFLICT (status) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  enabled = true;
