-- Migration: Reassign all inactive Horeca & Hospitality leads (no calls, no comments) to Lounis Cherifi
-- Target Rep: Lounis Cherifi (lounischerificr7@gmail.com)
-- Filter: Horeca / Hospitality leads with notes IS NULL/empty AND call_attempts IS NULL/0 AND no lead_history

DO $$
DECLARE
  lounis_id uuid;
  updated_count int;
BEGIN
  -- 1. Resolve Lounis Cherifi's UUID from profiles or auth.users
  SELECT id INTO lounis_id FROM public.profiles WHERE email ILIKE 'lounischerificr7%' LIMIT 1;
  IF lounis_id IS NULL THEN
    SELECT id INTO lounis_id FROM auth.users WHERE email ILIKE 'lounischerificr7%' LIMIT 1;
  END IF;

  IF lounis_id IS NULL THEN
    RAISE EXCEPTION 'Lounis Cherifi (lounischerificr7@gmail.com) not found in profiles or auth.users';
  END IF;

  -- 2. Reassign all Horeca & Hospitality leads with NO activity (no calls, no comments) to Lounis
  UPDATE public.outreach_leads
  SET assignee_id = lounis_id
  WHERE 
    (
      tags @> ARRAY['Horeca']
      OR tags @> ARRAY['Hospitality']
      OR industry ILIKE '%horeca%'
      OR industry ILIKE '%hospitality%'
      OR industry ILIKE '%zaalverhuur%'
      OR metadata->>'target_segment' ILIKE '%horeca%'
      OR metadata->>'target_segment' ILIKE '%hospitality%'
    )
    AND (notes IS NULL OR trim(notes) = '')
    AND (call_attempts IS NULL OR call_attempts = 0)
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_history lh WHERE lh.lead_id = outreach_leads.id
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Successfully reassigned % inactive Horeca/Hospitality leads to Lounis Cherifi (%)', updated_count, lounis_id;
END $$;
