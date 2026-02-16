import type { ExtractedKind } from './ast-parser.js'

export const CATEGORY_EMOJI: Record<ExtractedKind, string> = {
  interface: '📋',
  struct: '🏗️',
  type: '📝',
  function: '⚡',
  method: '🧩',
  const: '🔒',
  variable: '📦',
}

export const CATEGORY_LABELS: Record<ExtractedKind, string> = {
  interface: 'Interfaces',
  struct: 'Structs',
  type: 'Types',
  function: 'Functions',
  method: 'Methods',
  const: 'Constants',
  variable: 'Variables',
}
