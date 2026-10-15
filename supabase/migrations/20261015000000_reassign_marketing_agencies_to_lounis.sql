-- Migration: Reassign all Marketing Agencies leads to Lounis Cherifi
-- Target Rep: Lounis Cherifi (lounischerificr7@gmail.com)
-- Total Leads: 536 marketing agency leads (336 from US Marketing Agencies + 200 from Autoflow Expansion)

DO $$
DECLARE
  lounis_id uuid;
  updated_count int;
BEGIN
  -- 1. Resolve Lounis Cherifi's UUID
  SELECT id INTO lounis_id FROM public.profiles WHERE email ILIKE 'lounischerificr7%' LIMIT 1;
  IF lounis_id IS NULL THEN
    SELECT id INTO lounis_id FROM auth.users WHERE email ILIKE 'lounischerificr7%' LIMIT 1;
  END IF;

  IF lounis_id IS NULL THEN
    RAISE EXCEPTION 'Lounis Cherifi (lounischerificr7@gmail.com) not found in profiles or auth.users';
  END IF;

  -- 2. Reassign all Marketing Agencies leads to Lounis
  UPDATE public.outreach_leads
  SET assignee_id = lounis_id,
      updated_at = now()
  WHERE 
    tags @> ARRAY['Marketing Agency']
    OR tags @> ARRAY['Marketing Agencies']
    OR industry ILIKE '%marketing agenc%'
    OR metadata->>'target_segment' ILIKE '%marketing%'
    OR metadata->>'source' ILIKE '%marketing_agencies%';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Successfully reassigned % marketing agency leads to Lounis Cherifi (%)', updated_count, lounis_id;
END $$;
