// Interface for file icon mapping
interface FileIconMapping {
  [key: string]: string
}

// Default file icon for unknown types
const DEFAULT_FILE_ICON = 'vscode-icons:default-file'

// Map of file extensions to their corresponding VSCode icons
const fileIconMap: FileIconMapping = {
  folder: 'vscode-icons:default-folder-opened',

  // Text files
  txt: 'vscode-icons:file-type-text',
  md: 'vscode-icons:file-type-markdown',

  // Web development
  html: 'vscode-icons:file-type-html',
  css: 'vscode-icons:file-type-css',
  js: 'vscode-icons:file-type-js',
  ts: 'vscode-icons:file-type-typescript',
  jsx: 'vscode-icons:file-type-reactjs',
  tsx: 'vscode-icons:file-type-reactts',
  vue: 'vscode-icons:file-type-vue',
  svelte: 'vscode-icons:file-type-svelte',
  scss: 'vscode-icons:file-type-scss',
  sass: 'vscode-icons:file-type-sass',
  less: 'vscode-icons:file-type-less',

  // Configuration files
  json: 'vscode-icons:file-type-json',
  yaml: 'vscode-icons:file-type-yaml',
  yml: 'vscode-icons:file-type-yaml',
  toml: 'vscode-icons:file-type-toml',
  xml: 'vscode-icons:file-type-xml',
  ini: 'vscode-icons:file-type-ini',
  env: 'vscode-icons:file-type-env',

  // Programming languages
  py: 'vscode-icons:file-type-python',
  java: 'vscode-icons:file-type-java',
  cpp: 'vscode-icons:file-type-cpp',
  c: 'vscode-icons:file-type-c',
  cs: 'vscode-icons:file-type-csharp',
  go: 'vscode-icons:file-type-go',
  rs: 'vscode-icons:file-type-rust',
  rb: 'vscode-icons:file-type-ruby',
  php: 'vscode-icons:file-type-php',
  swift: 'vscode-icons:file-type-swift',
  kt: 'vscode-icons:file-type-kotlin',

  // Other common types
  pdf: 'vscode-icons:file-type-pdf2',
  png: 'vscode-icons:file-type-image',
  jpg: 'vscode-icons:file-type-image',
  jpeg: 'vscode-icons:file-type-image',
  gif: 'vscode-icons:file-type-image',
  svg: 'vscode-icons:file-type-svg',
  mp4: 'vscode-icons:file-type-video',
  mp3: 'vscode-icons:file-type-audio',
  wav: 'vscode-icons:file-type-audio',
  zip: 'vscode-icons:file-type-zip',
  tar: 'vscode-icons:file-type-zip',
  gz: 'vscode-icons:file-type-zip',
  doc: 'vscode-icons:file-type-word',
  docx: 'vscode-icons:file-type-word',
  xls: 'vscode-icons:file-type-excel',
  xlsx: 'vscode-icons:file-type-excel',
  ppt: 'vscode-icons:file-type-powerpoint',
  pptx: 'vscode-icons:file-type-powerpoint'
}

/**
 * Gets the appropriate icon name for a given filename
 * @param filename The name of the file
 * @returns The icon name from the VSCode icons set
 */
export function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  return fileIconMap[extension] || DEFAULT_FILE_ICON
}
