-- Migration: Assign all unassigned leads to lounischerificr7@gmail.com

DO $$
DECLARE
  target_rep UUID;
  assigned_outreach_count INT;
  assigned_booking_count INT;
  assigned_contact_count INT;
BEGIN
  -- 1. Find the target sales rep ID by email (checks public.profiles first, then auth.users as fallback)
  SELECT id INTO target_rep 
  FROM public.profiles 
  WHERE email ILIKE 'lounischerificr7%' 
  LIMIT 1;

  IF target_rep IS NULL THEN
    SELECT id INTO target_rep 
    FROM auth.users 
    WHERE email ILIKE 'lounischerificr7%' 
    LIMIT 1;
  END IF;

  IF target_rep IS NULL THEN
    RAISE EXCEPTION 'Target user lounischerificr7 (lounischerificr7@gmail.com) not found in public.profiles or auth.users';
  END IF;

  -- 2. Assign all unassigned outreach leads (assignee_id IS NULL)
  UPDATE public.outreach_leads
  SET assignee_id = target_rep
  WHERE assignee_id IS NULL;

  GET DIAGNOSTICS assigned_outreach_count = ROW_COUNT;

  -- 3. Assign any unassigned inbound booking leads (assignee_id IS NULL)
  UPDATE public.booking_leads
  SET assignee_id = target_rep
  WHERE assignee_id IS NULL;

  GET DIAGNOSTICS assigned_booking_count = ROW_COUNT;

  -- 4. Assign any unassigned inbound contact leads (assignee_id IS NULL)
  UPDATE public.contact_leads
  SET assignee_id = target_rep
  WHERE assignee_id IS NULL;

  GET DIAGNOSTICS assigned_contact_count = ROW_COUNT;

  RAISE NOTICE 'Successfully assigned leads to lounischerificr7 (%): Outreach: %, Bookings: %, Contacts: %', 
    target_rep, assigned_outreach_count, assigned_booking_count, assigned_contact_count;

END $$;
