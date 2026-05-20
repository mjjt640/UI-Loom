import { createTextNode, insertChildNode } from '../../commands/editorCommands'
import { createEmptyDocument } from '../factories'

export function createLandingPageTemplate() {
  const document = createEmptyDocument('落地页')
  return insertChildNode(document, document.rootNodeId, createTextNode('Build faster with UI Loom'))
}
