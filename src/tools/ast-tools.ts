import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { AstParser, ExtractedType, ExtractedKind } from '../ast-parser.js'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../constants.js'
import { formatExtractedType, formatStatistics, formatDependencies } from '../formatters.js'

export function registerAstTools(mcpServer: McpServer, repoPath: string) {
  mcpServer.registerTool(
    'whatsmeow_extrair_tipos',
    {
      description:
        'Extrai interfaces, structs, types, funções, métodos, constantes e variáveis exportadas do WhatsMeow (Go).',
      inputSchema: {
        modulo: z.string().optional().describe('Nome do módulo/pasta (ex: types, store, socket).'),
        apenas_kind: z
          .enum(['interface', 'struct', 'type', 'function', 'method', 'const', 'variable'])
          .optional()
          .describe('Filtrar por categoria específica.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ modulo, apenas_kind }) => {
      const parser = new AstParser(repoPath)
      let types: ExtractedType[] = modulo ? parser.getTypesFromModule(modulo) : parser.extractAllTypes()

      if (apenas_kind) {
        types = types.filter((type) => type.kind === apenas_kind)
      }

      const grouped: Record<string, ExtractedType[]> = {}
      for (const type of types) {
        if (!grouped[type.module]) grouped[type.module] = []
        grouped[type.module].push(type)
      }

      let result = `# 📚 Tipos Exportados${modulo ? ` (${modulo})` : ''}${apenas_kind ? ` - ${CATEGORY_LABELS[apenas_kind]}` : ''}\n\n`
      result += `**Total:** ${types.length} declarações\n\n`

      for (const [moduleName, moduleTypes] of Object.entries(grouped)) {
        result += `## 📁 ${moduleName}\n\n`
        for (const type of moduleTypes) {
          result += formatExtractedType(type, false)
        }
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_buscar_tipo',
    {
      description:
        'Busca a definição de um tipo/função/método por nome no WhatsMeow. Retorna assinatura e detalhes relevantes.',
      inputSchema: {
        nome: z.string().describe('Nome do símbolo a buscar (ex: Client, SendMessage, ReqCreateGroup).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ nome }) => {
      const parser = new AstParser(repoPath)
      const found = parser.searchType(nome)

      if (!found) {
        const fuzzy = parser.fuzzySearch(nome, 5)
        let suggestion = ''
        if (fuzzy.length > 0) {
          suggestion = '\n\n**Você quis dizer:**\n' + fuzzy.map((type) => `- \`${type.name}\` (${type.kind})`).join('\n')
        }

        return {
          content: [{ type: 'text' as const, text: `❌ Símbolo "${nome}" não encontrado.${suggestion}` }],
          isError: true,
        }
      }

      return { content: [{ type: 'text' as const, text: formatExtractedType(found, true) }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_buscar_fuzzy',
    {
      description: 'Busca símbolos com correspondência aproximada. Útil quando não sabe o nome exato.',
      inputSchema: {
        query: z.string().describe('Termo de busca (ex: message send, app state, group invite).'),
        limite: z.number().optional().describe('Número máximo de resultados (default: 20).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limite }) => {
      const parser = new AstParser(repoPath)
      const ranked = parser.searchByContext(query, limite || 20)

      if (ranked.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `❌ Nenhum resultado encontrado para "${query}"` }],
          isError: true,
        }
      }

      let result = `# 🔍 Resultados para "${query}"\n\n`
      result += `**Encontrados:** ${ranked.length} símbolos\n\n`

      for (const entry of ranked) {
        const type = entry.type
        result += `- ${CATEGORY_EMOJI[type.kind]} **\`${type.name}\`** (${type.kind}) - \`${type.file}\`\n`
        result += `  - score: ${entry.score}`
        if (entry.matchedIn.length > 0) {
          result += ` | match: ${entry.matchedIn.join(', ')}`
        }
        result += '\n'
        if (type.docs) result += `  > ${type.docs.substring(0, 100)}...\n`
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_listar_exports',
    {
      description: 'Lista todos os símbolos exportados da biblioteca, agrupados por módulo e categoria.',
      annotations: { readOnlyHint: true },
    },
    async () => {
      const parser = new AstParser(repoPath)
      const types = parser.extractAllTypes()

      const byModule: Record<string, Record<ExtractedKind, string[]>> = {}
      for (const type of types) {
        if (!byModule[type.module]) byModule[type.module] = {} as Record<ExtractedKind, string[]>
        if (!byModule[type.module][type.kind]) byModule[type.module][type.kind] = []
        byModule[type.module][type.kind].push(type.name)
      }

      let result = '# 📚 Exports da Biblioteca WhatsMeow\n\n'
      result += `**Total:** ${types.length} declarações exportadas\n\n`

      for (const [moduleName, kinds] of Object.entries(byModule)) {
        const total = Object.values(kinds).flat().length
        result += `## 📁 ${moduleName} (${total})\n\n`

        for (const [kind, names] of Object.entries(kinds)) {
          result += `### ${CATEGORY_EMOJI[kind as ExtractedKind]} ${CATEGORY_LABELS[kind as ExtractedKind]} (${names.length})\n`
          for (const name of names.slice(0, 12)) {
            result += `- \`${name}\`\n`
          }
          if (names.length > 12) {
            result += `- ... e mais ${names.length - 12}\n`
          }
          result += '\n'
        }
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_categorias',
    {
      description: 'Lista símbolos de uma categoria específica (interface, struct, type, function, method, const, variable).',
      inputSchema: {
        categoria: z
          .enum(['interface', 'struct', 'type', 'function', 'method', 'const', 'variable'])
          .describe('Categoria de declarações para listar.'),
        modulo: z.string().optional().describe('Filtrar por módulo específico (opcional).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ categoria, modulo }) => {
      const parser = new AstParser(repoPath)
      let types = parser.getTypesByKind(categoria)

      if (modulo) {
        types = types.filter((type) => type.module.toLowerCase() === modulo.toLowerCase())
      }

      let result = `# ${CATEGORY_EMOJI[categoria]} ${CATEGORY_LABELS[categoria]}\n\n`
      result += `**Total:** ${types.length}\n\n`

      for (const type of types) {
        result += formatExtractedType(type, categoria === 'interface' || categoria === 'struct')
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_constantes',
    {
      description: 'Lista constantes e variáveis exportadas da biblioteca (inclui iota e erros comuns).',
      inputSchema: {
        modulo: z.string().optional().describe('Filtrar por módulo específico.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ modulo }) => {
      const parser = new AstParser(repoPath)
      let constants = parser.getConstants()

      if (modulo) {
        constants = constants.filter((item) => item.module.toLowerCase() === modulo.toLowerCase())
      }

      let result = '# 🔒 Constantes e Variáveis Exportadas\n\n'
      result += `**Total:** ${constants.length}\n\n`

      const byModule: Record<string, ExtractedType[]> = {}
      for (const item of constants) {
        if (!byModule[item.module]) byModule[item.module] = []
        byModule[item.module].push(item)
      }

      for (const [moduleName, vars] of Object.entries(byModule)) {
        result += `## 📁 ${moduleName}\n\n`
        for (const v of vars) {
          result += `### \`${v.name}\`\n`
          result += `**Tipo:** \`${v.kind}\`\n`
          result += `**Assinatura:** \`${v.signature}\`\n`
          if (v.value) {
            result += `**Valor:** \`${v.value}\`\n`
          }
          result += '\n'
        }
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_hierarquia',
    {
      description: 'Mostra relacionamentos de um tipo (embedded/uso em outras assinaturas).',
      inputSchema: {
        nome: z.string().describe('Nome do tipo para analisar hierarquia.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ nome }) => {
      const parser = new AstParser(repoPath)
      const hierarchy = parser.getTypeHierarchy(nome)

      if (!hierarchy) {
        return {
          content: [{ type: 'text' as const, text: `❌ Tipo "${nome}" não encontrado.` }],
          isError: true,
        }
      }

      let result = `# 🌳 Hierarquia de \`${hierarchy.type.name}\`\n\n`
      result += formatExtractedType(hierarchy.type, false)

      if (hierarchy.parents.length > 0) {
        result += '## ⬆️ Relacionado com (Parents/Embedded)\n\n'
        for (const parent of hierarchy.parents) result += `- \`${parent}\`\n`
        result += '\n'
      }

      if (hierarchy.children.length > 0) {
        result += '## ⬇️ Referenciado por (Children)\n\n'
        for (const child of hierarchy.children) result += `- \`${child}\`\n`
        result += '\n'
      }

      if (hierarchy.parents.length === 0 && hierarchy.children.length === 0) {
        result += '*Este tipo não possui relacionamentos detectados.*\n'
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_estatisticas',
    {
      description: 'Retorna estatísticas detalhadas da biblioteca: contagem por categoria e por módulo.',
      annotations: { readOnlyHint: true },
    },
    async () => {
      const parser = new AstParser(repoPath)
      return { content: [{ type: 'text' as const, text: formatStatistics(parser.getStatistics()) }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_dependencias',
    {
      description: 'Analisa dependências entre módulos/pacotes e exports por módulo.',
      annotations: { readOnlyHint: true },
    },
    async () => {
      const parser = new AstParser(repoPath)
      return { content: [{ type: 'text' as const, text: formatDependencies(parser.analyzeDependencies()) }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_interfaces',
    {
      description: 'Lista todas as interfaces exportadas com campos e métodos.',
      inputSchema: {
        modulo: z.string().optional().describe('Filtrar por módulo específico.'),
        detalhado: z.boolean().optional().describe('Incluir detalhes (default: false).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ modulo, detalhado }) => {
      const parser = new AstParser(repoPath)
      let interfaces = parser.getInterfaces()

      if (modulo) {
        interfaces = interfaces.filter((item) => item.module.toLowerCase() === modulo.toLowerCase())
      }

      let result = '# 📋 Interfaces da Biblioteca\n\n'
      result += `**Total:** ${interfaces.length}\n\n`

      for (const iface of interfaces) {
        result += formatExtractedType(iface, detalhado || false)
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_funcoes',
    {
      description: 'Lista funções e métodos exportados com assinaturas.',
      inputSchema: {
        modulo: z.string().optional().describe('Filtrar por módulo específico.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ modulo }) => {
      const parser = new AstParser(repoPath)
      let functions = parser.getFunctions()

      if (modulo) {
        functions = functions.filter((item) => item.module.toLowerCase() === modulo.toLowerCase())
      }

      let result = '# ⚡ Funções e Métodos da Biblioteca\n\n'
      result += `**Total:** ${functions.length}\n\n`

      const byModule: Record<string, ExtractedType[]> = {}
      for (const fn of functions) {
        if (!byModule[fn.module]) byModule[fn.module] = []
        byModule[fn.module].push(fn)
      }

      for (const [moduleName, funcs] of Object.entries(byModule)) {
        result += `## 📁 ${moduleName}\n\n`
        for (const func of funcs) {
          result += formatExtractedType(func, true)
        }
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )
}
