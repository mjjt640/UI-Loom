export interface FileSystemAdapter {
  saveTextFile(path: string, content: string): Promise<void>
  readTextFile(path: string): Promise<string>
  pickDirectory(): Promise<string | null>
}
