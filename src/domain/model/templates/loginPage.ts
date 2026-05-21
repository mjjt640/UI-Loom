import { createTextNode, insertChildNode } from '../../commands/editorCommands'
import { createEmptyDocument } from '../factories'

export function createLoginPageTemplate() {
  const document = createEmptyDocument('登录页')
  return insertChildNode(
    document,
    document.rootNodeId,
    createTextNode({
      layout: { mode: 'absolute', x: 0, y: 0, width: 160, height: 32 },
      text: '欢迎回来',
    }),
  )
}
