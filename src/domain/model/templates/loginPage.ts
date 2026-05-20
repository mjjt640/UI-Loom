import { createTextNode, insertChildNode } from '../../commands/editorCommands'
import { createEmptyDocument } from '../factories'

export function createLoginPageTemplate() {
  const document = createEmptyDocument('登录页')
  return insertChildNode(document, document.rootNodeId, createTextNode('欢迎回来'))
}
