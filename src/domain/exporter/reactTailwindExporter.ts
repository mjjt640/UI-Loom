import type { PageDocument, UINode } from '../model/types'
import { nodeMappingAttribute } from './codeMapping'
import {
  boxStyleToClassName,
  layoutAlignmentToClassName,
  layoutToClassName,
  paddingToClassName,
  textStyleToClassName,
} from './tailwindMapping'

function escapeText(value = '') {
  return value.replaceAll('{', '&#123;').replaceAll('}', '&#125;')
}

export function indentReact(value: string) {
  return value
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

function className(...values: string[]) {
  return values.filter(Boolean).join(' ')
}

function ariaLabelForNode(node: UINode, defaultLabel: string) {
  return node.name === defaultLabel ? defaultLabel : node.name
}

export function resolveReactRenderableNode(document: PageDocument, nodeId: string) {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Export node not found: ${nodeId}`)
  }

  if (
    node.type !== 'text' &&
    node.type !== 'button' &&
    node.type !== 'image' &&
    node.type !== 'container' &&
    node.type !== 'frame' &&
    node.type !== 'rect' &&
    node.type !== 'group'
  ) {
    throw new Error(`React Tailwind export does not support node type: ${node.type}`)
  }

  return node
}

export function visibleReactChildNodes(document: PageDocument, node: UINode) {
  return node.children
    .map((childId) => resolveReactRenderableNode(document, childId))
    .filter((childNode) => childNode.meta.visible !== false)
}

export function renderReactNode(document: PageDocument, node: UINode): string {
  if (node.type === 'text') {
    return `      <div ${nodeMappingAttribute(node)} className="${textStyleToClassName(node.style)}">${escapeText(
      node.content.text,
    )}</div>`
  }

  if (node.type === 'button') {
    return `      <button ${nodeMappingAttribute(node)} type="button" className="${boxStyleToClassName(node.style)} px-4 py-2">${escapeText(
      node.content.text,
    )}</button>`
  }

  if (node.type === 'image') {
    return `      <img ${nodeMappingAttribute(node)} className="${boxStyleToClassName(
      node.style,
    )}" src="${escapeText(node.content.src)}" alt="${escapeText(node.content.alt)}" />`
  }

  if (node.type === 'rect') {
    return `      <div ${nodeMappingAttribute(node)} aria-label="${escapeText(
      ariaLabelForNode(node, 'Rectangle') === 'Rectangle'
        ? '矩形图层'
        : ariaLabelForNode(node, 'Rectangle'),
    )}" className="${boxStyleToClassName(
      node.style,
    )}"></div>`
  }

  if (node.type === 'container') {
    const children = visibleReactChildNodes(document, node)
      .map((childNode) => renderReactNode(document, childNode))
      .join('\n')
    const classes = className(
      boxStyleToClassName(node.style),
      layoutToClassName(node.layout),
      paddingToClassName(node.layout),
      layoutAlignmentToClassName(node.layout),
    )

    if (!children) {
      return `      <div ${nodeMappingAttribute(node)} className="${classes}"></div>`
    }

    return [`      <div ${nodeMappingAttribute(node)} className="${classes}">`, indentReact(children), '      </div>'].join(
      '\n',
    )
  }

  if (node.type === 'frame') {
    const children = visibleReactChildNodes(document, node)
      .map((childNode) => renderReactNode(document, childNode))
      .join('\n')
    const classes = className(
      boxStyleToClassName(node.style),
      layoutToClassName(node.layout),
      paddingToClassName(node.layout),
      layoutAlignmentToClassName(node.layout),
    )

    if (!children) {
      return `      <section ${nodeMappingAttribute(node)} aria-label="${escapeText(
        ariaLabelForNode(node, 'Frame') === 'Frame'
          ? 'Frame 节点'
          : ariaLabelForNode(node, 'Frame'),
      )}" className="${classes}"></section>`
    }

    return [
      `      <section ${nodeMappingAttribute(node)} aria-label="${escapeText(
        ariaLabelForNode(node, 'Frame') === 'Frame'
          ? 'Frame 节点'
          : ariaLabelForNode(node, 'Frame'),
      )}" className="${classes}">`,
      indentReact(children),
      '      </section>',
    ].join('\n')
  }

  if (node.type === 'group') {
    const children = visibleReactChildNodes(document, node)
      .map((childNode) => renderReactNode(document, childNode))
      .join('\n')

    if (!children) {
      return `      <div ${nodeMappingAttribute(node)} aria-label="图层组"></div>`
    }

    return [`      <div ${nodeMappingAttribute(node)} aria-label="图层组">`, indentReact(children), '      </div>'].join(
      '\n',
    )
  }

  throw new Error(`React Tailwind export does not support node type: ${node.type}`)
}
