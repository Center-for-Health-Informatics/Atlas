const DEFAULT_FORMAT = '0,0'

const formatterCache = new Map()

function toNumber (val) {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val
  }
  if (val === null || val === undefined || val === '') {
    return 0
  }
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

// Only the decimal-place count and presence of a thousands separator ever
// varied across this app's numeral format strings (e.g. '0,0', '0.00',
// '0,0.0000'), so that's all this parses.
function getFormatter (format) {
  let formatter = formatterCache.get(format)
  if (!formatter) {
    const dotIndex = format.indexOf('.')
    const decimals = dotIndex === -1 ? 0 : format.length - dotIndex - 1
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: format.includes(',')
    })
    formatterCache.set(format, formatter)
  }
  return formatter
}

// Intl.NumberFormat renders a value that rounds to zero as "-0"/"-0.00" when
// the input was negative; numeral suppresses the sign in that case.
function stripNegativeZero (formatted) {
  if (formatted[0] !== '-') {
    return formatted
  }
  return /^0+$/.test(formatted.slice(1).replace(/[.,]/g, '')) ? formatted.slice(1) : formatted
}

export function formatNumeral (val, format = DEFAULT_FORMAT) {
  const n = toNumber(val)
  if (!isFinite(n)) {
    return 'NaN'
  }
  return stripNegativeZero(getFormatter(format).format(n))
}
