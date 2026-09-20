-- Migration: Reassign 50% of US leads from muiziyiola75@gmail.com and bourhane.fetni7009@gmail.com to abdullahdesai3@gmail.com

DO $$
DECLARE
  source_muiz_id UUID;
  source_bourhane_id UUID;
  target_abdullah_id UUID;
BEGIN
  -- 1. Fetch User IDs for all 3 sales reps
  SELECT id INTO source_muiz_id 
  FROM public.profiles 
  WHERE email = 'muiziyiola75@gmail.com' LIMIT 1;

  SELECT id INTO source_bourhane_id 
  FROM public.profiles 
  WHERE email = 'bourhane.fetni7009@gmail.com' LIMIT 1;

  SELECT id INTO target_abdullah_id 
  FROM public.profiles 
  WHERE email = 'abdullahdesai3@gmail.com' LIMIT 1;

  IF target_abdullah_id IS NULL THEN
    RAISE EXCEPTION 'Target user abdullahdesai3@gmail.com not found in public.profiles';
  END IF;

  -- 2. Reassign 50% of US leads currently assigned to muiziyiola75@gmail.com
  IF source_muiz_id IS NOT NULL THEN
    WITH muiz_us_leads AS (
      SELECT id
      FROM public.outreach_leads
      WHERE assignee_id = source_muiz_id
        AND (
          'US' = ANY(tags) 
          OR location LIKE '%GA%' 
          OR location LIKE '%FL%' 
          OR location LIKE '%CO%' 
          OR location LIKE '%NY%' 
          OR location LIKE '%TX%'
          OR location LIKE '%CA%'
          OR metadata->>'source' LIKE 'us_%'
        )
      ORDER BY id
      LIMIT (
        SELECT COUNT(*) / 2 
        FROM public.outreach_leads 
        WHERE assignee_id = source_muiz_id
          AND (
            'US' = ANY(tags) 
            OR location LIKE '%GA%' 
            OR location LIKE '%FL%' 
            OR location LIKE '%CO%' 
            OR location LIKE '%NY%' 
            OR location LIKE '%TX%'
            OR location LIKE '%CA%'
            OR metadata->>'source' LIKE 'us_%'
          )
      )
    )
    UPDATE public.outreach_leads
    SET assignee_id = target_abdullah_id
    WHERE id IN (SELECT id FROM muiz_us_leads);
  END IF;

  -- 3. Reassign 50% of US leads currently assigned to bourhane.fetni7009@gmail.com
  IF source_bourhane_id IS NOT NULL THEN
    WITH bourhane_us_leads AS (
      SELECT id
      FROM public.outreach_leads
      WHERE assignee_id = source_bourhane_id
        AND (
          'US' = ANY(tags) 
          OR location LIKE '%GA%' 
          OR location LIKE '%FL%' 
          OR location LIKE '%CO%' 
          OR location LIKE '%NY%' 
          OR location LIKE '%TX%'
          OR location LIKE '%CA%'
          OR metadata->>'source' LIKE 'us_%'
        )
      ORDER BY id
      LIMIT (
        SELECT COUNT(*) / 2 
        FROM public.outreach_leads 
        WHERE assignee_id = source_bourhane_id
          AND (
            'US' = ANY(tags) 
            OR location LIKE '%GA%' 
            OR location LIKE '%FL%' 
            OR location LIKE '%CO%' 
            OR location LIKE '%NY%' 
            OR location LIKE '%TX%'
            OR location LIKE '%CA%'
            OR metadata->>'source' LIKE 'us_%'
          )
      )
    )
    UPDATE public.outreach_leads
    SET assignee_id = target_abdullah_id
    WHERE id IN (SELECT id FROM bourhane_us_leads);
  END IF;

END $$;
