export interface RemixIconResource {
  category: string
  name: string
  source: 'Remix Icon'
  svgPath: string
  tags: string[]
  viewBox: string
}

const remixLinearIconResourcePath = '/remix-linear-icons.json'

export async function loadRemixLinearIcons(): Promise<RemixIconResource[]> {
  const response = await fetch(remixLinearIconResourcePath)

  if (!response.ok) {
    throw new Error(`Failed to load Remix icons: ${response.status}`)
  }

  return (await response.json()) as RemixIconResource[]
}

export async function findRemixIcon(name: string) {
  const icons = await loadRemixLinearIcons()

  return icons.find((icon) => icon.name === name)
}
