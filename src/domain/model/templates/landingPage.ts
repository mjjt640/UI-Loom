import { createTextNode, insertChildNode } from '../../commands/editorCommands'
import { createEmptyDocument } from '../factories'

export function createLandingPageTemplate() {
  const document = createEmptyDocument('落地页')
  return insertChildNode(
    document,
    document.rootNodeId,
    createTextNode({
      layout: { mode: 'absolute', x: 0, y: 0, width: 320, height: 40 },
      text: 'Build faster with UI Loom',
    }),
  )
}
