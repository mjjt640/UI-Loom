import type { LayoutProps, StyleProps } from '../model/types'

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
  if (style.radius === 24) classes.push('rounded-3xl')
  if (style.background === '#111827') classes.push('bg-gray-900')
  if (style.background === '#ffffff') classes.push('bg-white')
  if (style.background === '#f8fafc') classes.push('bg-slate-50')
  if (style.color === '#ffffff') classes.push('text-white')
  if (style.borderWidth) classes.push('border')
  if (style.borderColor === '#e2e8f0') classes.push('border-slate-200')
  if (style.borderColor === '#d6d3d1') classes.push('border-stone-300')

  return classes.join(' ')
}

function spacingClass(prefix: string, value: number | undefined) {
  if (value === undefined) {
    return ''
  }

  if (value === 12) return `${prefix}-3`
  if (value === 16) return `${prefix}-4`
  if (value === 24) return `${prefix}-6`
  if (value === 32) return `${prefix}-8`

  return `${prefix}-[${value}px]`
}

export function layoutToClassName(layout: Pick<LayoutProps, 'gap' | 'mode'>) {
  const classes: string[] = []

  if (layout.mode === 'flex-column') classes.push('flex', 'flex-col')
  if (layout.mode === 'flex-row') classes.push('flex', 'flex-row')
  classes.push(spacingClass('gap', layout.gap))

  return classes.join(' ')
}

export function layoutAlignmentToClassName(
  layout: Pick<LayoutProps, 'align' | 'justify'>,
) {
  const classes: string[] = []

  if (layout.align === 'start') classes.push('items-start')
  if (layout.align === 'center') classes.push('items-center')
  if (layout.align === 'end') classes.push('items-end')
  if (layout.align === 'stretch') classes.push('items-stretch')
  if (layout.justify === 'center') classes.push('justify-center')
  if (layout.justify === 'end') classes.push('justify-end')
  if (layout.justify === 'between') classes.push('justify-between')

  return classes.join(' ')
}

export function paddingToClassName(layout: Pick<LayoutProps, 'padding'>) {
  const padding = layout.padding

  if (!padding) {
    return ''
  }

  const uniformPadding =
    padding.top === 16 &&
    padding.right === 16 &&
    padding.bottom === 16 &&
    padding.left === 16
      ? 16
      : padding.top === 24 &&
          padding.right === 24 &&
          padding.bottom === 24 &&
          padding.left === 24
        ? 24
        : padding.top === 32 &&
            padding.right === 32 &&
            padding.bottom === 32 &&
            padding.left === 32
          ? 32
          : null

  if (uniformPadding !== null) {
    return spacingClass('p', uniformPadding)
  }

  return [
    spacingClass('pt', padding.top),
    spacingClass('pr', padding.right),
    spacingClass('pb', padding.bottom),
    spacingClass('pl', padding.left),
  ].join(' ')
}
