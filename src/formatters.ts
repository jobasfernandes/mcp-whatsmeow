import * as fs from 'node:fs'
import * as path from 'node:path'
import type {
  ExtractedType,
  PropertyInfo,
  LibraryStatistics,
  DependencyInfo,
  ExtractedKind,
} from './ast-parser.js'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from './constants.js'

export function getDirectoryTree(dirPath: string, prefix = ''): string {
  let result = ''
  const items = fs.readdirSync(dirPath, { withFileTypes: true })

  const dirs = items.filter((i) => i.isDirectory() && !i.name.startsWith('.'))
  const files = items.filter((i) => i.isFile() && i.name.endsWith('.go'))

  for (const file of files) {
    result += `${prefix}├── ${file.name}\n`
  }

  for (let index = 0; index < dirs.length; index++) {
    const dir = dirs[index]
    const isLast = index === dirs.length - 1
    result += `${prefix}${isLast ? '└── ' : '├── '}${dir.name}/\n`
    result += getDirectoryTree(path.join(dirPath, dir.name), prefix + (isLast ? '    ' : '│   '))
  }

  return result
}

export function formatProperty(prop: PropertyInfo): string {
  if (prop.isMethod || prop.isCallSignature) {
    const params = prop.parameters?.join(', ') || ''
    return `${prop.name}(${params}): ${prop.returnType || prop.type}`
  }
  return `${prop.name}: ${prop.type}`
}

export function formatExtractedType(type: ExtractedType, detailed = false): string {
  let result = `### ${CATEGORY_EMOJI[type.kind]} ${type.kind}: \`${type.name}\`\n\n`
  result += `**Arquivo:** \`${type.file}\`${type.lineNumber ? ` (linha ${type.lineNumber})` : ''}\n`
  result += `**Módulo:** ${type.module}\n\n`

  if (type.docs) {
    result += `> ${type.docs}\n\n`
  }

  result += `\`\`\`go\n${type.signature}\n\`\`\`\n\n`

  if (!detailed) return result

  if (type.properties && type.properties.length > 0) {
    result += '**Campos/Propriedades:**\n'
    for (const prop of type.properties.slice(0, 20)) {
      result += `- \`${formatProperty(prop)}\`\n`
    }
    if (type.properties.length > 20) {
      result += `- ... e mais ${type.properties.length - 20}\n`
    }
    result += '\n'
  }

  if (type.methods && type.methods.length > 0) {
    result += '**Métodos:**\n'
    for (const method of type.methods.slice(0, 20)) {
      result += `- \`${formatProperty(method)}\`\n`
    }
    if (type.methods.length > 20) {
      result += `- ... e mais ${type.methods.length - 20}\n`
    }
    result += '\n'
  }

  if (type.members && type.members.length > 0) {
    result += '**Membros:**\n'
    for (const member of type.members.slice(0, 30)) {
      result += `- \`${member}\`\n`
    }
    if (type.members.length > 30) {
      result += `- ... e mais ${type.members.length - 30}\n`
    }
    result += '\n'
  }

  if (type.value) {
    result += `**Valor:** \`${type.value}\`\n\n`
  }

  return result
}

export function formatStatistics(stats: LibraryStatistics): string {
  let result = '# 📊 Estatísticas da Biblioteca WhatsMeow\n\n'
  result += `**Total de Declarações:** ${stats.totalDeclarations}\n\n`

  result += '## Por Categoria\n\n'
  result += '| Categoria | Quantidade | % |\n'
  result += '|-----------|------------|---|\n'
  for (const [kind, count] of Object.entries(stats.byKind)) {
    const percentage = stats.totalDeclarations > 0
      ? ((count / stats.totalDeclarations) * 100).toFixed(1)
      : '0.0'
    result += `| ${CATEGORY_EMOJI[kind as ExtractedKind]} ${CATEGORY_LABELS[kind as ExtractedKind]} | ${count} | ${percentage}% |\n`
  }

  result += '\n## Por Módulo\n\n'
  result += '| Módulo | Total | Interfaces | Structs | Types | Functions | Methods | Consts | Vars |\n'
  result += '|--------|-------|------------|---------|-------|-----------|---------|--------|------|\n'
  for (const mod of stats.byModule) {
    result += `| **${mod.module}** | ${mod.total} | ${mod.interfaces} | ${mod.structs} | ${mod.types} | ${mod.functions} | ${mod.methods} | ${mod.consts} | ${mod.variables} |\n`
  }

  result += '\n## Top Interfaces\n'
  for (const name of stats.topInterfaces) result += `- \`${name}\`\n`

  result += '\n## Top Types/Structs\n'
  for (const name of stats.topTypes) result += `- \`${name}\`\n`

  result += '\n## Top Funções\n'
  for (const name of stats.topFunctions) result += `- \`${name}\`\n`

  return result
}

export function formatDependencies(deps: DependencyInfo[]): string {
  let result = '# 🔗 Análise de Dependências\n\n'

  for (const dep of deps) {
    result += `## 📁 ${dep.module}\n\n`

    if (dep.imports.length > 0) {
      result += `**Imports (${dep.imports.length}):** `
      result += dep.imports.slice(0, 15).map((i) => `\`${i}\``).join(', ')
      if (dep.imports.length > 15) result += `, ... (+${dep.imports.length - 15})`
      result += '\n\n'
    }

    if (dep.exports.length > 0) {
      result += `**Exports (${dep.exports.length}):** `
      result += dep.exports.slice(0, 15).map((e) => `\`${e}\``).join(', ')
      if (dep.exports.length > 15) result += `, ... (+${dep.exports.length - 15})`
      result += '\n\n'
    }
  }

  return result
}
