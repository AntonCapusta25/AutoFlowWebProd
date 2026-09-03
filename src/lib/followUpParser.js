import * as chrono from 'chrono-node'

// Phrases that signal "this note implies I need to follow up," used to avoid
// scheduling a reminder off an incidental date mention (e.g. "customer since 2019").
const FOLLOW_UP_HINTS = /\b(call|callback|bellen|terugbellen|bel|followup|opvolgen|opvolging|remind|herinneren|herinnering|reach\s*out|contact|touch\s*base|check\s*in|check\s*back|checken|ping|text|sms|email|mail|mailen|speak|spreken|afspraak|plannen|inplannen)\b/i

// Parses free-text CRM notes ("call back tmrw", "follow up next Monday at 2pm",
// "bellen volgende week maandag om 10:00", "terugbellen morgen om 14u30")
// into a concrete Date to schedule a follow-up reminder for.
//
// Uses chrono.nl for Dutch text (handles "morgen", "volgende week maandag",
// "om 14u30", "over 3 dagen om 16u", etc. natively) and falls back to
// chrono.en for English text. Returns null when nothing schedulable was found.
export function parseFollowUpDate(text, referenceDate = new Date()) {
  if (!text || !text.trim()) return null

  const hasDutchHint = /\b(morgen|gisteren|overmorgen|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|volgende|komende|vandaag|vanavond|bellen|terugbellen|opvolgen|opvolging|herinneren|herinnering|mailen|plannen|inplannen|afspraak|spreken|checken)\b/i.test(text)

  // Use the native Dutch parser when Dutch words are detected — it handles
  // "morgen om 14u30", "volgende week maandag om 10:00", "over 3 dagen", etc.
  // much more reliably than the old manual-translation approach.
  const parser = hasDutchHint ? chrono.nl : chrono.en

  const results = parser.parse(text, referenceDate, { forwardDate: true })
  if (results.length === 0) return null

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
