export function getNoteDetails(noteSymbol) {
  let noteWrapper = noteSymbol.closest('.note-wrapper')
  if (!noteWrapper) {
    return null
  }
  const dataAttr = Array.from(noteWrapper.attributes).find(
    (attr) => attr.name.startsWith('data-') && attr.name !== 'data-note-id'
  )
  if (!dataAttr) {
    return null
  }
  const noteType = dataAttr.name.replace('data-', '')
  const noteValue = dataAttr.value
  return {
    noteType,
    noteValue,
    noteWrapper
  }
}
