import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { AstParser, ExtractedKind } from '../ast-parser.js'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../constants.js'
import { formatExtractedType } from '../formatters.js'

function shortSignature(signature: string, maxLength = 180): string {
  if (signature.length <= maxLength) return signature
  return `${signature.slice(0, maxLength)}...`
}

export function registerContentTools(mcpServer: McpServer, repoPath: string) {
  mcpServer.registerTool(
    'whatsmeow_buscar_contexto',
    {
      description:
        'Busca contexto semântico no WhatsMeow com ranking por nome, assinatura, docs, arquivo, módulo e categoria.',
      inputSchema: {
        query: z.string().describe('Consulta de domínio (ex: qr pair, send message, newsletter).'),
        modulo: z.string().optional().describe('Filtrar por módulo/pasta (ex: types, store, socket).'),
        categoria: z
          .enum(['interface', 'struct', 'type', 'function', 'method', 'const', 'variable'])
          .optional()
          .describe('Filtrar por categoria de declaração.'),
        limite: z.number().optional().describe('Limite de resultados (default: 20).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, modulo, categoria, limite }) => {
      const parser = new AstParser(repoPath)
      const ranked = parser.searchByContext(query, limite || 20, {
        module: modulo,
        kind: categoria,
      })

      if (ranked.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `❌ Nenhum resultado encontrado para "${query}"` }],
          isError: true,
        }
      }

      let result = `# 🎯 Busca de Contexto: "${query}"\n\n`
      result += `**Resultados:** ${ranked.length}\n`
      if (modulo) result += `**Filtro módulo:** ${modulo}\n`
      if (categoria) result += `**Filtro categoria:** ${categoria}\n`
      result += '\n'

      for (const entry of ranked) {
        const type = entry.type
        const line = type.lineNumber ? `:${type.lineNumber}` : ''
        result += `## ${CATEGORY_EMOJI[type.kind]} \`${type.name}\` (${type.kind})\n`
        result += `- **score:** ${entry.score}\n`
        result += `- **match:** ${entry.matchedIn.join(', ') || 'n/a'}\n`
        result += `- **módulo:** ${type.module}\n`
        result += `- **arquivo:** \`${type.file}${line}\`\n`
        result += `- **assinatura:** \`${shortSignature(type.signature)}\`\n`
        if (type.docs) {
          result += `> ${type.docs.substring(0, 200)}${type.docs.length > 200 ? '...' : ''}\n`
        }
        result += '\n'
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_resumo_modulo',
    {
      description:
        'Gera resumo de um módulo do WhatsMeow com contagem por categoria, arquivos e símbolos em destaque.',
      inputSchema: {
        modulo: z.string().describe('Módulo alvo (ex: root, types, store, socket, appstate).'),
        destaque: z.number().optional().describe('Quantidade de símbolos em destaque (default: 12).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ modulo, destaque }) => {
      const parser = new AstParser(repoPath)
      const summary = parser.summarizeModule(modulo, destaque || 12)

      if (summary.total === 0) {
        const knownModules = parser
          .getStatistics()
          .byModule
          .map((moduleStats) => moduleStats.module)
          .slice(0, 20)

        return {
          content: [{
            type: 'text' as const,
            text: `❌ Módulo "${modulo}" não encontrado.\n\nMódulos conhecidos: ${knownModules.join(', ') || 'nenhum'}`,
          }],
          isError: true,
        }
      }

      let result = `# 🧭 Resumo do Módulo ${summary.module}\n\n`
      result += `**Total de declarações:** ${summary.total}\n`
      result += `**Arquivos:** ${summary.files.length}\n\n`

      result += '## Por categoria\n\n'
      for (const [kind, count] of Object.entries(summary.byKind)) {
        if (count === 0) continue
        const typedKind = kind as ExtractedKind
        result += `- ${CATEGORY_EMOJI[typedKind]} ${CATEGORY_LABELS[typedKind]}: ${count}\n`
      }

      result += '\n## Arquivos do módulo\n\n'
      for (const file of summary.files.slice(0, 40)) {
        result += `- \`${file}\`\n`
      }
      if (summary.files.length > 40) {
        result += `- ... e mais ${summary.files.length - 40} arquivo(s)\n`
      }

      result += '\n## Símbolos em destaque\n\n'
      for (const type of summary.highlights) {
        result += formatExtractedType(type, false)
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_topicos',
    {
      description:
        'Mostra mapa de tópicos práticos do WhatsMeow (pairing, eventos, mensagens, grupos, mídia, appstate) e descoberta guiada.',
      inputSchema: {
        topico: z.string().optional().describe('Tópico para explorar (ex: pairing, message, group, appstate, media, newsletter).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topico }) => {
      const parser = new AstParser(repoPath)

      if (!topico) {
        const topicGuide: Array<{ topic: string; modules: string[]; hints: string[] }> = [
          { topic: 'pairing', modules: ['root', 'store'], hints: ['GetQRChannel', 'PairPhone', 'NewClient'] },
          { topic: 'events', modules: ['root', 'types'], hints: ['AddEventHandler', 'EventHandler', 'types/events'] },
          { topic: 'message', modules: ['root', 'types'], hints: ['SendMessage', 'BuildReaction', 'MarkRead'] },
          { topic: 'group', modules: ['root', 'types'], hints: ['CreateGroup', 'GetGroupInfo', 'UpdateGroupParticipants'] },
          { topic: 'appstate', modules: ['root', 'appstate'], hints: ['FetchAppState', 'SendAppState', 'WAPatchName'] },
          { topic: 'media', modules: ['root'], hints: ['Upload', 'Download', 'MediaType'] },
          { topic: 'newsletter', modules: ['root', 'types'], hints: ['CreateNewsletter', 'GetNewsletterMessages', 'NewsletterSendReaction'] },
        ]

        let result = '# 🗺️ Mapa de Tópicos WhatsMeow\n\n'
        result += 'Use `whatsmeow_topicos({ topico: "..." })` para aprofundar em um domínio.\n\n'

        for (const item of topicGuide) {
          result += `## ${item.topic}\n`
          result += `- módulos: ${item.modules.join(', ')}\n`
          result += `- pistas: ${item.hints.join(', ')}\n\n`
        }

        result += 'Sugestão: combine com `whatsmeow_buscar_contexto` para localizar símbolos precisos por tópico.\n'
        return { content: [{ type: 'text' as const, text: result }] }
      }

      const ranked = parser.searchByContext(topico, 25)
      if (ranked.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `❌ Nenhum contexto encontrado para o tópico "${topico}".` }],
          isError: true,
        }
      }

      const byModule = new Map<string, number>()
      const byKind = new Map<ExtractedKind, number>()

      for (const entry of ranked) {
        byModule.set(entry.type.module, (byModule.get(entry.type.module) || 0) + 1)
        byKind.set(entry.type.kind, (byKind.get(entry.type.kind) || 0) + 1)
      }

      const modulesSorted = Array.from(byModule.entries()).sort((a, b) => b[1] - a[1])
      const kindsSorted = Array.from(byKind.entries()).sort((a, b) => b[1] - a[1])

      let result = `# 🔎 Exploração de Tópico: ${topico}\n\n`
      result += `**Resultados considerados:** ${ranked.length}\n\n`

      result += '## Módulos mais relevantes\n'
      for (const [moduleName, count] of modulesSorted.slice(0, 10)) {
        result += `- ${moduleName}: ${count}\n`
      }

      result += '\n## Categorias mais relevantes\n'
      for (const [kind, count] of kindsSorted) {
        result += `- ${CATEGORY_EMOJI[kind]} ${CATEGORY_LABELS[kind]}: ${count}\n`
      }

      result += '\n## Símbolos-chave\n\n'
      for (const entry of ranked.slice(0, 12)) {
        const type = entry.type
        result += `- ${CATEGORY_EMOJI[type.kind]} \`${type.name}\` (${type.module}) - score ${entry.score}\n`
      }

      result += '\nPróximo passo sugerido: `whatsmeow_buscar_contexto` com filtro de módulo/categoria para aprofundar.\n'

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )
}
