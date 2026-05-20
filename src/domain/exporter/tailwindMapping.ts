import type { StyleProps } from '../model/types'

export function textStyleToClassName(style: StyleProps) {
  const classes: string[] = []

  if (style.fontWeight === 600) classes.push('font-semibold')
  if (style.fontWeight === 700) classes.push('font-bold')
  if (style.color === '#111827') classes.push('text-gray-900')
  if (style.fontSize === 24) classes.push('text-2xl')

  return classes.join(' ')
}

export function boxStyleToClassName(style: StyleProps) {
  const classes: string[] = []

  if (style.radius === 12) classes.push('rounded-xl')
  if (style.radius === 16) classes.push('rounded-2xl')
  if (style.radius === 20) classes.push('rounded-2xl')
  if (style.background === '#111827') classes.push('bg-gray-900')
  if (style.background === '#f8fafc') classes.push('bg-slate-50')
  if (style.color === '#ffffff') classes.push('text-white')
  if (style.borderWidth) classes.push('border')
  if (style.borderColor === '#e2e8f0') classes.push('border-slate-200')

  return classes.join(' ')
}
