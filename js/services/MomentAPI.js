import ko from 'knockout'
import sharedState from 'atlas-state'
import { get } from 'utils/NativeCompat'

const DATE_TIME_FORMAT = 'MM/DD/YYYY h:mm A'
const DATE_TIME_FORMAT_WITH_SECONDS = 'MM/DD/YYYY h:mm:ss A'
const DATE_FORMAT = 'MM/DD/YYYY'
const ISO_DATE_FORMAT = 'YYYY-MM-DD'
const DURATION_FORMAT = 'HH:mm:ss'
const DESIGN_DATE_TIME_FORMAT = 'YYYY-MM-DD H:mm'
const EMPTY_DATE = ''

const dateTimeFormat = ko.computed(() => get(ko.unwrap(sharedState.localeSettings), 'format.date.datetime', DATE_TIME_FORMAT))
const dateTimeFormatWithSeconds = ko.computed(() => get(ko.unwrap(sharedState.localeSettings), 'format.date.datetimeWithSeconds', DATE_TIME_FORMAT_WITH_SECONDS))
const seconds = ko.computed(() => get(ko.unwrap(sharedState.localeSettings), 'format.date.seconds', 'sec'))
const minutes = ko.computed(() => get(ko.unwrap(sharedState.localeSettings), 'format.date.minutes', 'min'))

function pad (n, len = 2) {
  return String(n).padStart(len, '0')
}

// Supports the small token vocabulary actually used by this app's format strings:
// YYYY, MM, DD, HH, hh, H, h, mm, ss, A. Longer tokens are listed before their
// single-character prefixes so the alternation doesn't stop short.
function formatToken (date, format) {
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  const tokens = {
    YYYY: pad(date.getFullYear(), 4),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(hours24),
    hh: pad(hours12),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    H: String(hours24),
    h: String(hours12),
    A: hours24 < 12 ? 'AM' : 'PM',
  }
  return format.replace(/YYYY|MM|DD|HH|hh|mm|ss|H|h|A/g, (token) => tokens[token])
}

// Date objects, epoch numbers, and ISO-ish strings (as returned by WebAPI) all
// parse natively; anything else is treated as unparseable. Bare "YYYY-MM-DD"
// strings are special-cased to local midnight (native Date parses them as UTC
// midnight per spec, which moment's default parsing did not).
function toDate (input) {
  if (typeof input === 'string') {
    const dateOnly = input.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateOnly) {
      const [, y, mo, d] = dateOnly
      return new Date(+y, +mo - 1, +d)
    }
  }
  if (input instanceof Date || typeof input === 'number' || typeof input === 'string') {
    const d = new Date(input)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

// Interprets a naive (no-offset) ISO-ish date string as UTC wall-clock time,
// matching moment.utc(str).valueOf() for the same input.
function parseAsUTC (str) {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?/)
  if (!match) {
    return Date.parse(str)
  }
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = match
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)
}

function formatDateTime (date) {
  const d = toDate(date)
  return d ? formatToken(d, dateTimeFormat()) : EMPTY_DATE
}

function formatDate (date, outFormat) {
  const d = toDate(date)
  return d ? formatToken(d, outFormat || DATE_FORMAT) : EMPTY_DATE
}

function formatDuration (ms) {
  if (typeof ms !== 'number' || isNaN(ms)) {
    return EMPTY_DATE
  }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600) % 24
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`
}

function formatInterval (ms) {
  const durationSec = ms / 1000
  return `${Math.floor(durationSec / 60)} ${minutes()} ${Math.round(durationSec % 60)} ${seconds()}`
}

function formatDateTimeWithFormat (timestamp, outFormat) {
  if (timestamp === undefined || timestamp === null) {
    return EMPTY_DATE
  }
  const d = toDate(timestamp)
  return d ? formatToken(d, outFormat) : EMPTY_DATE
}

function formatDateTimeUTC (timestamp, withSeconds) {
  const ms = typeof timestamp === 'string' ? parseAsUTC(timestamp) : timestamp
  const d = toDate(ms)
  const format = withSeconds ? dateTimeFormatWithSeconds() : dateTimeFormat()
  return d ? formatToken(d, format) : EMPTY_DATE
}

function diffInDays (fromDate, toDate2) {
  const fd = toDate(fromDate)
  const td = toDate(toDate2)
  if (!fd || !td) {
    return NaN
  }
  return Math.trunc((td.getTime() - fd.getTime()) / 86400000)
}

function formatDateToString (value, format = ISO_DATE_FORMAT) {
  return value instanceof Date ? formatToken(value, format) : value
}

const api = {
  formatDateTime,
  formatDate,
  formatDuration,
  formatDateTimeUTC,
  formatDateTimeWithFormat,
  formatInterval,
  formatDateToString,
  diffInDays,
  PARSE_FORMAT: 'YYYY-MM-DD, H:mm',
  DATE_TIME_FORMAT,
  DATE_FORMAT,
  DURATION_FORMAT,
  DESIGN_DATE_TIME_FORMAT,
  ISO_DATE_FORMAT
}

export default api
