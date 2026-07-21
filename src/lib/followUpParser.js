import * as chrono from 'chrono-node'

// Phrases that signal "this note implies I need to follow up," used to avoid
// scheduling a reminder off an incidental date mention (e.g. "customer since 2019").
const FOLLOW_UP_HINTS = /\b(call|call\s*back|follow[\s-]?up|remind|reach out|touch base|check in|check\s*back|ping|text|email)\b/i

// Parses free-text CRM notes ("call back tmrw", "follow up next Monday at 2pm")
// into a concrete Date to schedule a follow-up reminder for.
// Returns null when nothing schedulable was found.
export function parseFollowUpDate(text, referenceDate = new Date()) {
  if (!text || !text.trim()) return null

  const results = chrono.parse(text, referenceDate, { forwardDate: true })
  if (results.length === 0) return null

  const hasExplicitTime = results.some(r => r.start.isCertain('hour'))
  if (!hasExplicitTime && !FOLLOW_UP_HINTS.test(text)) return null

  const result = results[0]
  let date = result.start.date()

  // If only a day was given (no time), default to 9am so it lands during work hours.
  if (!result.start.isCertain('hour')) {
    date.setHours(9, 0, 0, 0)
  }

  // Ignore parses too far in the past (clock skew) or absurdly far in the future.
  const now = referenceDate.getTime()
  const maxFuture = now + 1000 * 60 * 60 * 24 * 365
  if (date.getTime() < now - 1000 * 60 * 5 || date.getTime() > maxFuture) return null

  return date
}
