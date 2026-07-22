// Replaces the clipboard.js package: reads a trigger element's
// data-clipboard-text/data-clipboard-target attribute (the only two features
// Atlas actually uses) and writes to the system clipboard.
export function getSourceText (trigger) {
  if (trigger.hasAttribute('data-clipboard-text')) {
    return trigger.getAttribute('data-clipboard-text')
  }

  const targetSelector = trigger.getAttribute('data-clipboard-target')
  const target = targetSelector && document.querySelector(targetSelector)
  if (!target) return ''

  return (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
    ? target.value
    : target.textContent
}

export async function writeToClipboard (text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      // Fall through to the execCommand fallback below.
    }
  }

  // Fallback for non-secure contexts (e.g. plain-http dev environments), where
  // the async Clipboard API isn't available. execCommand is deprecated but
  // still functions everywhere it's needed here.
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  const success = document.execCommand('copy')
  document.body.removeChild(el)
  return success
}
