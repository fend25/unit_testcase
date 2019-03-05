export {storage} from './strg'

export function placeCaretAtEnd(el) {
  if (!el) return

  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  } else if (typeof document.body.createTextRange != "undefined") {
    const textRange = document.body.createTextRange()
    textRange.moveToElementText(el)
    textRange.collapse(false)
    textRange.select()
  }
}

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}
