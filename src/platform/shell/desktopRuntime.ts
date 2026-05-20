declare global {
  interface Window {
    __TAURI__?: unknown
    __ELECTRON__?: unknown
  }
}

export function isDesktopRuntime() {
  return '__TAURI__' in window || '__ELECTRON__' in window
}
