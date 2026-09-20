import * as chrono from 'chrono-node'

// Phrases that signal "this note implies I need to follow up," used to avoid
// scheduling a reminder off an incidental date mention (e.g. "customer since 2019").
export const FOLLOW_UP_HINTS = /(?:^|\b|\s)(call|callback|bellen|terugbellen|bel|followup|opvolgen|opvolging|remind|herinneren|herinnering|reach\s*out|contact|touch\s*base|check\s*in|check\s*back|checken|ping|text|sms|email|mail|mailen|speak|spreken|afspraak|plannen|inplannen|no[ -]?response|no[ -]?answer|no[ -]?ans|nr|n[._\/]?r[._]?|vm|v[._\/]?m[._]?|voicemail|voice[ -]?mail|na|n[._\/]?a[._]?|n[ -.]a|geen[ -]?gehoor|ingesproken)(?:\b|\s|$|[.,;!])|left[ -]?(a[ -]?)?(vm|voicemail|voice[ -]?mail)/i

export const NO_RESPONSE_HINTS = /(?:^|\b|\s)(no[ -]?response|no[ -]?answer|no[ -]?ans|nr|n[._\/]?r[._]?|vm|v[._\/]?m[._]?|voicemail|voice[ -]?mail|na|n[._\/]?a[._]?|n[ -.]a|geen[ -]?gehoor|ingesproken)(?:\b|\s|$|[.,;!])|left[ -]?(a[ -]?)?(vm|voicemail|voice[ -]?mail)/i

// Parses free-text CRM notes ("call back tmrw", "follow up next Monday at 2pm",
// "bellen volgende week maandag om 10:00", "terugbellen morgen om 14u30", "nr", "left vm")
// into a concrete Date to schedule a follow-up reminder for.
export function parseFollowUpDate(text, referenceDate = new Date()) {
  if (!text || !text.trim()) return null

  const hasDutchHint = /\b(morgen|gisteren|overmorgen|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|volgende|komende|vandaag|vanavond|bellen|terugbellen|opvolgen|opvolging|herinneren|herinnering|mailen|plannen|inplannen|afspraak|spreken|checken|geen gehoor|ingesproken)\b/i.test(text)

  const parser = hasDutchHint ? chrono.nl : chrono.en

  const results = parser.parse(text, referenceDate, { forwardDate: true })
  
  // If chrono didn't find an explicit date/time in the text, but the note contains
  // a "No Response" or "Follow-Up" hint (like "nr", "left vm", "no answer"),
  // default to scheduling a follow-up for 1 day later at 9:00 AM.
  if (results.length === 0) {
    if (NO_RESPONSE_HINTS.test(text) || FOLLOW_UP_HINTS.test(text)) {
      const defaultDate = new Date(referenceDate)
      defaultDate.setDate(defaultDate.getDate() + 1)
      defaultDate.setHours(9, 0, 0, 0)
      return defaultDate
    }
    return null
  }

  const hasExplicitTime = results.some(r => r.start.isCertain('hour'))
  if (!hasExplicitTime && !FOLLOW_UP_HINTS.test(text)) return null

  // Merge date & time details from all matching parsed segments
  let date = null
  let targetHour = 9
  let targetMinute = 0
  let isHourCertain = false

  for (const result of results) {
    const d = result.start.date()
    if (!date) {
      date = d
    } else {
      if (result.start.isCertain('day') || result.start.isCertain('weekday')) {
        date.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
      }
    }
    if (result.start.isCertain('hour')) {
      isHourCertain = true
      targetHour = result.start.get('hour')
      targetMinute = result.start.get('minute') || 0
    }
  }

  if (!date) return null

  // If only a day was given (no time), default to 9am so it lands during work hours.
  if (!isHourCertain) {
    date.setHours(9, 0, 0, 0)
  } else {
    date.setHours(targetHour, targetMinute, 0, 0)
  }

  // Ignore parses too far in the past (clock skew) or absurdly far in the future.
  const now = referenceDate.getTime()
  const maxFuture = now + 1000 * 60 * 60 * 24 * 365
  if (date.getTime() < now - 1000 * 60 * 5 || date.getTime() > maxFuture) return null

  return date
}

