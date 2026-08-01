// US Area Code timezone mappings
const EST_AREA_CODES = new Set([
  '201', '203', '207', '212', '215', '216', '218', '226', '229', '234', '239', '240', '248', '252', '256', '260',
  '267', '270', '272', '276', '289', '301', '302', '304', '305', '313', '315', '321', '330', '347', '352', '386',
  '401', '404', '407', '410', '412', '413', '416', '418', '419', '434', '437', '438', '443', '450', '470', '478',
  '484', '506', '508', '513', '514', '516', '518', '519', '540', '570', '571', '579', '581', '585', '586', '603',
  '606', '607', '609', '613', '614', '616', '631', '639', '647', '678', '703', '704', '705', '716', '718', '724',
  '732', '734', '740', '754', '757', '770', '774', '781', '786', '787', '802', '803', '804', '807', '813', '814',
  '819', '828', '839', '848', '849', '856', '860', '862', '864', '865', '876', '878', '904', '905', '908', '910',
  '914', '917', '919', '929', '937', '941', '947', '954', '959', '973', '978', '980', '989'
])

const CST_AREA_CODES = new Set([
  '205', '217', '218', '224', '225', '228', '251', '256', '262', '270', '309', '312', '314', '318', '319', '325',
  '334', '361', '402', '405', '409', '414', '417', '430', '432', '469', '479', '504', '507', '512', '515', '563',
  '573', '580', '601', '605', '608', '612', '615', '618', '630', '636', '641', '662', '682', '708', '713', '715',
  '731', '763', '769', '773', '785', '812', '815', '816', '817', '830', '832', '847', '901', '903', '915', '918',
  '920', '931', '936', '940', '952', '956', '972', '979', '985'
])

const MST_AREA_CODES = new Set([
  '303', '307', '385', '406', '435', '480', '505', '520', '575', '602', '623', '719', '720', '801', '928', '970'
])

const PST_AREA_CODES = new Set([
  '206', '209', '213', '236', '250', '253', '310', '323', '360', '408', '415', '424', '425', '503', '509', '510',
  '530', '559', '562', '604', '619', '626', '650', '661', '702', '707', '714', '760', '775', '778', '805', '818',
  '831', '858', '909', '916', '925', '949', '951', '971'
])

function getUSAreaCode(phone) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.substring(1, 4)
  }
  if (cleaned.length === 10) {
    return cleaned.substring(0, 3)
  }
  return null
}

function getTimezoneFromLocation(loc) {
  if (!loc) return null
  const norm = loc.toLowerCase()
  
  if (norm.includes('new york') || norm.includes(', ny') || norm.includes('florida') || norm.includes(', fl') || 
      norm.includes('miami') || norm.includes('atlanta') || norm.includes(', ga') || norm.includes('boston') || 
      norm.includes(', ma') || norm.includes('philadelphia') || norm.includes(', pa') || norm.includes('ohio') || 
      norm.includes(', oh') || norm.includes('michigan') || norm.includes(', mi') || norm.includes('washington dc') || 
      norm.includes(', dc') || norm.includes('north carolina') || norm.includes(', nc') || norm.includes('toronto') || 
      norm.includes('quebec') || norm.includes('montreal')) {
    return 'America/New_York'
  }
  
  if (norm.includes('chicago') || norm.includes(', il') || norm.includes('texas') || norm.includes(', tx') || 
      norm.includes('houston') || norm.includes('dallas') || norm.includes('austin') || norm.includes('minnesota') || 
      norm.includes(', mn') || norm.includes('wisconsin') || norm.includes(', wi') || norm.includes('tennessee') || 
      norm.includes(', tn') || norm.includes('nashville') || norm.includes('illinois') || norm.includes('missouri') || 
      norm.includes(', mo') || norm.includes('louisiana') || norm.includes(', la') || norm.includes('new orleans')) {
    return 'America/Chicago'
  }
  
  if (norm.includes('denver') || norm.includes(', co') || norm.includes('colorado') || norm.includes('arizona') || 
      norm.includes(', az') || norm.includes('phoenix') || norm.includes('utah') || norm.includes(', ut') || 
      norm.includes('salt lake') || norm.includes('new mexico') || norm.includes(', nm') || norm.includes('montana') || 
      norm.includes(', mt')) {
    return 'America/Denver'
  }
  
  if (norm.includes('california') || norm.includes(', ca') || norm.includes('los angeles') || norm.includes('la ') || 
      norm.includes('san francisco') || norm.includes('sf') || norm.includes('san diego') || norm.includes('san jose') || 
      norm.includes('sacramento') || norm.includes('washington state') || norm.includes(', wa') || norm.includes('seattle') || 
      norm.includes('oregon') || norm.includes(', or') || norm.includes('portland') || norm.includes('nevada') || 
      norm.includes(', nv') || norm.includes('las vegas') || norm.includes('vancouver')) {
    return 'America/Los_Angeles'
  }
  
  return null
}

export function getLeadTimezone(lead) {
  if (!lead) return null
  
  // 1. Try area code first
  const areaCode = getUSAreaCode(lead.phone)
  if (areaCode) {
    if (EST_AREA_CODES.has(areaCode)) return 'America/New_York'
    if (CST_AREA_CODES.has(areaCode)) return 'America/Chicago'
    if (MST_AREA_CODES.has(areaCode)) return 'America/Denver'
    if (PST_AREA_CODES.has(areaCode)) return 'America/Los_Angeles'
  }
  
  // 2. Try location/city/country string next
  const locTz = getTimezoneFromLocation(lead.location)
  if (locTz) return locTz
  
  // 3. Fallbacks based on phone code
  if (lead.phone?.startsWith('+44')) return 'Europe/London'
  if (lead.phone?.startsWith('+31')) return 'Europe/Amsterdam'
  
  // Fallbacks based on location keywords
  const locNorm = (lead.location || '').toLowerCase()
  if (locNorm.includes('united kingdom') || locNorm.includes('uk') || locNorm.includes('london')) {
    return 'Europe/London'
  }
  if (locNorm.includes('netherlands') || locNorm.includes('nl') || locNorm.includes('amsterdam')) {
    return 'Europe/Amsterdam'
  }
  
  return null
}

export function getLeadLocalTimeStr(lead) {
  const tz = getLeadTimezone(lead)
  if (!tz) return 'N/A'
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    let tzName = 'ET'
    if (tz === 'America/Chicago') tzName = 'CT'
    else if (tz === 'America/Denver') tzName = 'MT'
    else if (tz === 'America/Los_Angeles') tzName = 'PT'
    else if (tz === 'Europe/London') tzName = 'GMT'
    else if (tz === 'Europe/Amsterdam') tzName = 'CET'
    
    return `${formatter.format(new Date())} (${tzName})`
  } catch (e) {
    return 'N/A'
  }
}
