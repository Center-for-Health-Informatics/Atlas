import $ from 'jquery'
import { getSourceText, writeToClipboard } from 'utils/ClipboardUtils'

const Clipboard = (C = class {}) => class extends C {
  async copyToClipboard (clipboardButtonSelector, clipboardButtonMessageSelector, appendedText) {
    const trigger = document.querySelector(clipboardButtonSelector)
    if (!trigger) return

    const text = getSourceText(trigger) + (appendedText || '')
    const success = await writeToClipboard(text)

    if (success) {
      console.log('Copied to clipboard')
      window.getSelection().removeAllRanges()
      $(clipboardButtonMessageSelector).fadeIn()
      setTimeout(() => {
        $(clipboardButtonMessageSelector).fadeOut()
      }, 1500)
    } else {
      console.log('Error copying to clipboard')
    }
  }
}

export default Clipboard
