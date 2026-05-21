import {
  createButtonNode,
  createContainerNode,
  createFrameNode,
  createImageNode,
  createPathNode,
  createRectNode,
  createTextNode,
} from '../../../src/domain/commands/editorCommands'
import type { LayoutProps } from '../../../src/domain/model/types'

export const textLayout: LayoutProps = {
  mode: 'absolute',
  x: 0,
  y: 0,
  width: 160,
  height: 32,
}

export const buttonLayout: LayoutProps = {
  mode: 'absolute',
  x: 40,
  y: 72,
  width: 120,
  height: 44,
}

export const imageLayout: LayoutProps = {
  mode: 'absolute',
  x: 40,
  y: 136,
  width: 240,
  height: 160,
}

export const containerLayout: LayoutProps = {
  mode: 'flex-column',
  x: 320,
  y: 72,
  width: 280,
  height: 180,
  gap: 12,
  padding: { top: 16, right: 16, bottom: 16, left: 16 },
}

export const frameLayout: LayoutProps = {
  mode: 'flex-column',
  x: 120,
  y: 120,
  width: 320,
  height: 240,
  gap: 16,
  padding: { top: 24, right: 24, bottom: 24, left: 24 },
  align: 'stretch',
  justify: 'start',
}

export const rectLayout: LayoutProps = {
  mode: 'absolute',
  x: 96,
  y: 96,
  width: 160,
  height: 120,
}

export const pathLayout: LayoutProps = {
  mode: 'absolute',
  x: 132,
  y: 104,
  width: 180,
  height: 120,
}

export function testTextNode(text: string) {
  return createTextNode({ layout: textLayout, text })
}

export function testButtonNode(text = '按钮') {
  return createButtonNode({ layout: buttonLayout, text })
}

export function testImageNode(src = '') {
  return createImageNode({ alt: '图片描述', layout: imageLayout, src })
}

export function testContainerNode() {
  return createContainerNode({ layout: containerLayout })
}

export function testFrameNode(layout: Partial<LayoutProps> = {}) {
  return createFrameNode({ layout: { ...frameLayout, ...layout } })
}

export function testRectNode(layout: Partial<LayoutProps> = {}) {
  return createRectNode({ layout: { ...rectLayout, ...layout } })
}

export function testPathNode(layout: Partial<LayoutProps> = {}) {
  return createPathNode({
    layout: { ...pathLayout, ...layout },
    pathData: 'M8 80 C30 14 70 14 92 80',
  })
}
