import type { UINode } from '../model/types'

export interface ComponentNameEntry {
  componentName: string
  fileName: string
  nodeId: string
}

function wordsFromValue(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.trim())
    .filter(Boolean)
}

function pascalCase(value: string) {
  const words = wordsFromValue(value)

  if (words.length === 0) {
    return 'Component'
  }

  return words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join('')
}

export function componentNameForNode(node: UINode) {
  return pascalCase(node.meta.componentHint ?? node.name)
}

export function componentFileNameForNode(node: UINode) {
  return componentNameForNode(node)
}

export function uniqueComponentNamesForNodes(nodes: UINode[]): ComponentNameEntry[] {
  const counts = new Map<string, number>()

  return nodes.map((node) => {
    const baseName = componentNameForNode(node)
    const nextCount = (counts.get(baseName) ?? 0) + 1
    counts.set(baseName, nextCount)

    const componentName = nextCount === 1 ? baseName : `${baseName}${nextCount}`

    return {
      componentName,
      fileName: componentName,
      nodeId: node.id,
    }
  })
}
