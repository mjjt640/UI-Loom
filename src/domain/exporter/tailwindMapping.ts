import type { StyleProps } from '../model/types'

export function textStyleToClassName(style: StyleProps) {
  const classes: string[] = []

  if (style.fontWeight === 600) classes.push('font-semibold')
  if (style.fontWeight === 700) classes.push('font-bold')
  if (style.color === '#111827') classes.push('text-gray-900')
  if (style.fontSize === 24) classes.push('text-2xl')

  return classes.join(' ')
}
