import * as fs from 'node:fs'
import * as path from 'node:path'

export type ExtractedKind =
  | 'interface'
  | 'struct'
  | 'type'
  | 'function'
  | 'method'
  | 'const'
  | 'variable'

export interface PropertyInfo {
  name: string
  type: string
  optional: boolean
  readonly: boolean
  docs?: string
  isMethod: boolean
  isCallSignature: boolean
  isIndexSignature: boolean
  parameters?: string[]
  returnType?: string
}

export interface ExtractedType {
  name: string
  kind: ExtractedKind
  exported: boolean
  file: string
  module: string
  signature: string
  fullSignature?: string
  properties?: PropertyInfo[]
  methods?: PropertyInfo[]
  members?: string[]
  docs?: string
  value?: string
  lineNumber?: number
}

export interface ModuleStatistics {
  module: string
  interfaces: number
  structs: number
  types: number
  functions: number
  methods: number
  consts: number
  variables: number
  total: number
}

export interface LibraryStatistics {
  totalDeclarations: number
  byKind: Record<ExtractedKind, number>
  byModule: ModuleStatistics[]
  topInterfaces: string[]
  topTypes: string[]
  topFunctions: string[]
}

export interface DependencyInfo {
  module: string
  imports: string[]
  exports: string[]
  reExportsFrom: string[]
}

export interface RankedTypeResult {
  type: ExtractedType
  score: number
  matchedIn: string[]
}

export interface ModuleSummary {
  module: string
  total: number
  byKind: Record<ExtractedKind, number>
  files: string[]
  highlights: ExtractedType[]
}

interface SearchFilters {
  module?: string
  kind?: ExtractedKind
}

interface HierarchyResult {
  type: ExtractedType
  parents: string[]
  children: string[]
}

export class AstParser {
  private readonly repoPath: string
  private cachedTypes: ExtractedType[] | null = null

  constructor(repoPath: string) {
    this.repoPath = this.resolveRepoRoot(repoPath)
  }

  private resolveRepoRoot(inputPath: string): string {
    const normalized = path.resolve(inputPath)
    if (fs.existsSync(path.join(normalized, 'go.mod'))) return normalized

    const parent = path.resolve(normalized, '..')
    if (fs.existsSync(path.join(parent, 'go.mod'))) return parent

    return normalized
  }

  private getRelativePath(filePath: string): string {
    return path.relative(this.repoPath, filePath).replace(/\\/g, '/')
  }

  private getModuleName(filePath: string): string {
    const relative = this.getRelativePath(filePath)
    const parts = relative.split('/')
    return parts.length > 1 ? parts[0] : 'root'
  }

  private listGoFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return []

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      if (entry.name === 'vendor') continue

      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        files.push(...this.listGoFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.go') && !entry.name.endsWith('_test.go')) {
        files.push(fullPath)
      }
    }

    return files
  }

  extractAllTypes(): ExtractedType[] {
    if (this.cachedTypes) return this.cachedTypes

    const files = this.listGoFiles(this.repoPath)
    const extracted: ExtractedType[] = []

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8')
      extracted.push(...this.extractFromContent(filePath, content))
    }

    this.cachedTypes = extracted
    return extracted
  }

  private extractFromContent(filePath: string, content: string): ExtractedType[] {
    const results: ExtractedType[] = []
    const lines = content.split(/\r?\n/)
    const relativeFile = this.getRelativePath(filePath)
    const moduleName = this.getModuleName(filePath)

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].trim()
      if (!line) continue

      const docs = this.extractDocAbove(lines, index)

      const interfaceMatch = line.match(/^type\s+([A-Z]\w*)\s+interface\s*\{/) 
      if (interfaceMatch) {
        const block = this.captureBracedBlock(lines, index)
        const methods = this.parseInterfaceMethods(block.text)
        results.push({
          name: interfaceMatch[1],
          kind: 'interface',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature: this.firstLine(block.text),
          fullSignature: block.text,
          methods,
          docs,
          lineNumber: index + 1,
        })
        index = block.endLine
        continue
      }

      const structMatch = line.match(/^type\s+([A-Z]\w*)\s+struct\s*\{/) 
      if (structMatch) {
        const block = this.captureBracedBlock(lines, index)
        const properties = this.parseStructFields(block.text)
        results.push({
          name: structMatch[1],
          kind: 'struct',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature: this.firstLine(block.text),
          fullSignature: block.text,
          properties,
          docs,
          lineNumber: index + 1,
        })
        index = block.endLine
        continue
      }

      const typeMatch = line.match(/^type\s+([A-Z]\w*)\s*(=)?\s*(.+)$/)
      if (typeMatch && !line.includes('interface{') && !line.includes('struct{')) {
        results.push({
          name: typeMatch[1],
          kind: 'type',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature: line,
          value: typeMatch[3].trim(),
          docs,
          lineNumber: index + 1,
        })
        continue
      }

      const methodMatch = line.match(/^func\s*\(([^)]+)\)\s*([A-Z]\w*)\s*\(/)
      if (methodMatch) {
        const signature = this.captureFunctionSignature(lines, index)
        results.push({
          name: methodMatch[2],
          kind: 'method',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature,
          docs,
          lineNumber: index + 1,
        })
        continue
      }

      const functionMatch = line.match(/^func\s+([A-Z]\w*)\s*\(/)
      if (functionMatch) {
        const signature = this.captureFunctionSignature(lines, index)
        results.push({
          name: functionMatch[1],
          kind: 'function',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature,
          docs,
          lineNumber: index + 1,
        })
        continue
      }

      if (/^const\s*\(/.test(line)) {
        const block = this.captureParenBlock(lines, index)
        const members = this.parseConstVarBlockMembers(block.text)
        for (const member of members) {
          if (!/^[A-Z]/.test(member.name)) continue
          results.push({
            name: member.name,
            kind: 'const',
            exported: true,
            file: relativeFile,
            module: moduleName,
            signature: member.signature,
            value: member.value,
            docs,
            lineNumber: member.lineNumber,
          })
        }
        index = block.endLine
        continue
      }

      if (/^var\s*\(/.test(line)) {
        const block = this.captureParenBlock(lines, index)
        const members = this.parseConstVarBlockMembers(block.text)
        for (const member of members) {
          if (!/^[A-Z]/.test(member.name)) continue
          results.push({
            name: member.name,
            kind: 'variable',
            exported: true,
            file: relativeFile,
            module: moduleName,
            signature: member.signature,
            value: member.value,
            docs,
            lineNumber: member.lineNumber,
          })
        }
        index = block.endLine
        continue
      }

      const constSingle = line.match(/^const\s+([A-Z]\w*)\b(.*)$/)
      if (constSingle) {
        results.push({
          name: constSingle[1],
          kind: 'const',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature: line,
          value: constSingle[2].trim() || undefined,
          docs,
          lineNumber: index + 1,
        })
        continue
      }

      const varSingle = line.match(/^var\s+([A-Z]\w*)\b(.*)$/)
      if (varSingle) {
        results.push({
          name: varSingle[1],
          kind: 'variable',
          exported: true,
          file: relativeFile,
          module: moduleName,
          signature: line,
          value: varSingle[2].trim() || undefined,
          docs,
          lineNumber: index + 1,
        })
      }
    }

    return results
  }

  private extractDocAbove(lines: string[], lineIndex: number): string | undefined {
    const docs: string[] = []
    let cursor = lineIndex - 1

    while (cursor >= 0) {
      const raw = lines[cursor]
      const trimmed = raw.trim()

      if (!trimmed) {
        if (docs.length === 0) {
          cursor--
          continue
        }
        break
      }

      if (trimmed.startsWith('//')) {
        docs.unshift(trimmed.replace(/^\/\/\s?/, ''))
        cursor--
        continue
      }

      if (trimmed.endsWith('*/') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        docs.unshift(trimmed.replace(/^\/\*+\s?/, '').replace(/^\*\s?/, '').replace(/\*\/$/, '').trim())
        cursor--
        continue
      }

      break
    }

    const text = docs.join(' ').trim()
    return text || undefined
  }

  private captureBracedBlock(lines: string[], startLine: number): { text: string; endLine: number } {
    let braceBalance = 0
    const chunk: string[] = []
    let started = false

    for (let index = startLine; index < lines.length; index++) {
      const line = lines[index]
      chunk.push(line)

      for (const char of line) {
        if (char === '{') {
          braceBalance += 1
          started = true
        } else if (char === '}') {
          braceBalance -= 1
        }
      }

      if (started && braceBalance === 0) {
        return { text: chunk.join('\n'), endLine: index }
      }
    }

    return { text: chunk.join('\n'), endLine: lines.length - 1 }
  }

  private captureParenBlock(lines: string[], startLine: number): { text: string; endLine: number } {
    let balance = 0
    const chunk: string[] = []
    let started = false

    for (let index = startLine; index < lines.length; index++) {
      const line = lines[index]
      chunk.push(line)

      for (const char of line) {
        if (char === '(') {
          balance += 1
          started = true
        } else if (char === ')') {
          balance -= 1
        }
      }

      if (started && balance === 0) {
        return { text: chunk.join('\n'), endLine: index }
      }
    }

    return { text: chunk.join('\n'), endLine: lines.length - 1 }
  }

  private captureFunctionSignature(lines: string[], startLine: number): string {
    const chunk: string[] = []
    let parenBalance = 0

    for (let index = startLine; index < lines.length; index++) {
      const line = lines[index]
      chunk.push(line.trim())

      for (const char of line) {
        if (char === '(') parenBalance += 1
        if (char === ')') parenBalance -= 1
      }

      if (line.includes('{')) break
      if (parenBalance <= 0 && line.trim().endsWith(')')) break
      if (index - startLine > 12) break
    }

    return chunk.join(' ')
  }

  private parseInterfaceMethods(blockText: string): PropertyInfo[] {
    const lines = blockText.split(/\r?\n/)
    const methods: PropertyInfo[] = []

    for (const line of lines.slice(1, -1)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//')) continue

      const methodMatch = trimmed.match(/^([A-Za-z_]\w*)\s*\((.*)\)\s*(.*)$/)
      if (!methodMatch) continue

      methods.push({
        name: methodMatch[1],
        type: methodMatch[3] || 'void',
        optional: false,
        readonly: false,
        isMethod: true,
        isCallSignature: false,
        isIndexSignature: false,
        parameters: methodMatch[2]
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean),
        returnType: methodMatch[3] || 'void',
      })
    }

    return methods
  }

  private parseStructFields(blockText: string): PropertyInfo[] {
    const lines = blockText.split(/\r?\n/)
    const fields: PropertyInfo[] = []

    for (const line of lines.slice(1, -1)) {
      const cleaned = line.replace(/\s*\/\/.*$/, '').trim()
      if (!cleaned) continue

      const fieldMatch = cleaned.match(/^([A-Za-z_]\w*)\s+(.+)$/)
      if (!fieldMatch) continue

      fields.push({
        name: fieldMatch[1],
        type: fieldMatch[2].trim(),
        optional: false,
        readonly: false,
        isMethod: false,
        isCallSignature: false,
        isIndexSignature: false,
      })
    }

    return fields
  }

  private parseConstVarBlockMembers(blockText: string): Array<{ name: string; signature: string; value?: string; lineNumber: number }> {
    const lines = blockText.split(/\r?\n/)
    const members: Array<{ name: string; signature: string; value?: string; lineNumber: number }> = []

    for (let index = 1; index < lines.length - 1; index++) {
      const raw = lines[index]
      const line = raw.replace(/\s*\/\/.*$/, '').trim()
      if (!line) continue

      const match = line.match(/^([A-Za-z_]\w*)\b(.*)$/)
      if (!match) continue

      members.push({
        name: match[1],
        signature: line,
        value: match[2].trim() || undefined,
        lineNumber: index + 1,
      })
    }

    return members
  }

  private firstLine(text: string): string {
    return text.split(/\r?\n/)[0].trim()
  }

  searchType(name: string): ExtractedType | null {
    const lowerName = name.toLowerCase()
    const all = this.extractAllTypes()
    const exact = all.find((type) => type.name === name)
    if (exact) return exact
    return all.find((type) => type.name.toLowerCase() === lowerName) || null
  }

  fuzzySearch(query: string, limit = 20): ExtractedType[] {
    return this.searchByContext(query, limit).map((item) => item.type)
  }

  searchByContext(query: string, limit = 20, filters?: SearchFilters): RankedTypeResult[] {
    const normalized = query.toLowerCase().trim()
    const terms = normalized.split(/\s+/).filter(Boolean)

    let types = this.extractAllTypes()
    if (filters?.module) {
      types = types.filter((type) => type.module.toLowerCase() === filters.module?.toLowerCase())
    }
    if (filters?.kind) {
      types = types.filter((type) => type.kind === filters.kind)
    }

    const ranked: RankedTypeResult[] = []

    for (const type of types) {
      const matchedIn: string[] = []
      let score = 0

      const name = type.name.toLowerCase()
      const signature = type.signature.toLowerCase()
      const docs = (type.docs || '').toLowerCase()
      const file = type.file.toLowerCase()
      const module = type.module.toLowerCase()
      const kind = type.kind.toLowerCase()

      for (const term of terms) {
        if (name === term) {
          score += 25
          matchedIn.push('name-exact')
          continue
        }
        if (name.includes(term)) {
          score += 12
          matchedIn.push('name')
        }
        if (signature.includes(term)) {
          score += 6
          matchedIn.push('signature')
        }
        if (docs.includes(term)) {
          score += 5
          matchedIn.push('docs')
        }
        if (file.includes(term)) {
          score += 4
          matchedIn.push('file')
        }
        if (module.includes(term)) {
          score += 5
          matchedIn.push('module')
        }
        if (kind.includes(term)) {
          score += 4
          matchedIn.push('kind')
        }
      }

      if (terms.length === 0 || score > 0) {
        ranked.push({ type, score, matchedIn: Array.from(new Set(matchedIn)) })
      }
    }

    return ranked
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score
        return left.type.name.localeCompare(right.type.name)
      })
      .slice(0, Math.max(1, limit))
  }

  summarizeModule(moduleName: string, highlightCount = 12): ModuleSummary {
    const types = this.getTypesFromModule(moduleName)
    const byKind: Record<ExtractedKind, number> = {
      interface: 0,
      struct: 0,
      type: 0,
      function: 0,
      method: 0,
      const: 0,
      variable: 0,
    }

    for (const type of types) {
      byKind[type.kind] += 1
    }

    const files = Array.from(new Set(types.map((type) => type.file))).sort((a, b) => a.localeCompare(b))
    const highlights = [...types]
      .sort((left, right) => {
        const leftScore = this.highlightScore(left)
        const rightScore = this.highlightScore(right)
        if (rightScore !== leftScore) return rightScore - leftScore
        return left.name.localeCompare(right.name)
      })
      .slice(0, Math.max(1, highlightCount))

    return {
      module: moduleName,
      total: types.length,
      byKind,
      files,
      highlights,
    }
  }

  private highlightScore(type: ExtractedType): number {
    let score = 0
    if (type.docs) score += 2
    if (type.kind === 'function' || type.kind === 'method') score += 4
    if (type.kind === 'interface' || type.kind === 'struct') score += 3
    if (type.name.length <= 24) score += 1
    return score
  }

  getTypesFromModule(moduleName: string): ExtractedType[] {
    return this.extractAllTypes().filter((type) => type.module.toLowerCase() === moduleName.toLowerCase())
  }

  getTypesByKind(kind: ExtractedKind): ExtractedType[] {
    return this.extractAllTypes().filter((type) => type.kind === kind)
  }

  getConstants(): ExtractedType[] {
    return this.extractAllTypes().filter((type) => type.kind === 'const' || type.kind === 'variable')
  }

  getFunctions(): ExtractedType[] {
    return this.extractAllTypes().filter((type) => type.kind === 'function' || type.kind === 'method')
  }

  getInterfaces(): ExtractedType[] {
    return this.extractAllTypes().filter((type) => type.kind === 'interface')
  }

  getEnums(): ExtractedType[] {
    return []
  }

  getTypeHierarchy(name: string): HierarchyResult | null {
    const target = this.searchType(name)
    if (!target) return null

    const all = this.extractAllTypes()
    const parents: string[] = []
    const children: string[] = []

    const fullSignature = (target.fullSignature || target.signature).toLowerCase()
    if (target.kind === 'interface' || target.kind === 'struct' || target.kind === 'type') {
      const embedded = fullSignature
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^[A-Z][A-Za-z0-9_]*$/.test(line))
      parents.push(...embedded)
    }

    for (const candidate of all) {
      if (candidate.name === target.name) continue
      const candidateSignature = (candidate.fullSignature || candidate.signature).toLowerCase()
      if (candidateSignature.includes(target.name.toLowerCase())) {
        children.push(candidate.name)
      }
    }

    return {
      type: target,
      parents: Array.from(new Set(parents)).sort((a, b) => a.localeCompare(b)),
      children: Array.from(new Set(children)).sort((a, b) => a.localeCompare(b)),
    }
  }

  analyzeDependencies(): DependencyInfo[] {
    const files = this.listGoFiles(this.repoPath)
    const byModule = new Map<string, { imports: Set<string>; exports: Set<string> }>()

    for (const filePath of files) {
      const moduleName = this.getModuleName(filePath)
      const content = fs.readFileSync(filePath, 'utf-8')
      if (!byModule.has(moduleName)) {
        byModule.set(moduleName, { imports: new Set<string>(), exports: new Set<string>() })
      }

      const entry = byModule.get(moduleName)
      if (!entry) continue

      for (const imported of this.extractImports(content)) {
        entry.imports.add(imported)
      }
    }

    for (const type of this.extractAllTypes()) {
      const entry = byModule.get(type.module)
      if (!entry) continue
      entry.exports.add(type.name)
    }

    const result: DependencyInfo[] = []
    for (const [module, data] of byModule.entries()) {
      result.push({
        module,
        imports: Array.from(data.imports).sort((a, b) => a.localeCompare(b)),
        exports: Array.from(data.exports).sort((a, b) => a.localeCompare(b)),
        reExportsFrom: [],
      })
    }

    return result.sort((left, right) => left.module.localeCompare(right.module))
  }

  private extractImports(content: string): string[] {
    const imports: string[] = []
    const lines = content.split(/\r?\n/)

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].trim()

      const single = line.match(/^import\s+"([^"]+)"/)
      if (single) {
        imports.push(single[1])
        continue
      }

      if (/^import\s*\(/.test(line)) {
        for (let inner = index + 1; inner < lines.length; inner++) {
          const item = lines[inner].trim()
          if (item === ')') {
            index = inner
            break
          }

          const blockItem = item.match(/^(?:[A-Za-z_]\w*\s+)?"([^"]+)"/)
          if (blockItem) imports.push(blockItem[1])
        }
      }
    }

    return imports
  }

  getStatistics(): LibraryStatistics {
    const all = this.extractAllTypes()

    const byKind: Record<ExtractedKind, number> = {
      interface: 0,
      struct: 0,
      type: 0,
      function: 0,
      method: 0,
      const: 0,
      variable: 0,
    }

    for (const type of all) {
      byKind[type.kind] += 1
    }

    const moduleMap = new Map<string, ModuleStatistics>()

    for (const type of all) {
      if (!moduleMap.has(type.module)) {
        moduleMap.set(type.module, {
          module: type.module,
          interfaces: 0,
          structs: 0,
          types: 0,
          functions: 0,
          methods: 0,
          consts: 0,
          variables: 0,
          total: 0,
        })
      }

      const stat = moduleMap.get(type.module)
      if (!stat) continue

      if (type.kind === 'interface') stat.interfaces += 1
      if (type.kind === 'struct') stat.structs += 1
      if (type.kind === 'type') stat.types += 1
      if (type.kind === 'function') stat.functions += 1
      if (type.kind === 'method') stat.methods += 1
      if (type.kind === 'const') stat.consts += 1
      if (type.kind === 'variable') stat.variables += 1
      stat.total += 1
    }

    return {
      totalDeclarations: all.length,
      byKind,
      byModule: Array.from(moduleMap.values()).sort((left, right) => left.module.localeCompare(right.module)),
      topInterfaces: this.topNames(this.getInterfaces(), 15),
      topTypes: this.topNames(all.filter((type) => type.kind === 'type' || type.kind === 'struct'), 20),
      topFunctions: this.topNames(this.getFunctions(), 20),
    }
  }

  private topNames(types: ExtractedType[], limit: number): string[] {
    return types
      .map((type) => type.name)
      .sort((left, right) => left.localeCompare(right))
      .slice(0, limit)
  }
}
