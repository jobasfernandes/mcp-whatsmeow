import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  EXAMPLES,
  EXAMPLE_CATEGORIES,
  getExamplesByCategory,
  getExampleById,
  searchExamples,
  type ExampleCategory,
} from '../knowledge/examples.js'

export function registerExampleTools(mcpServer: McpServer) {
  mcpServer.registerTool(
    'whatsmeow_examples',
    {
      description:
        'Production Go code examples extracted from API_WHATSMEOW. 40+ examples across 7 categories: senders (15 — text, image, video, audio, document, sticker, contact, location, buttons, list, poll, reaction, delete, edit, status), sessions (5 — init, QR, reconnect, keepalive, shutdown), events (8 — dispatcher, handler, message, receipt, call reject, logout, appstate), media (4 — download, upload, type mapping, reconstruct), groups (3 — CRUD, participants, invites), connection (2 — auto-reconnect, kill signal), advanced (4 — MarkRead, archive, JID parse, ContextInfo).',
      inputSchema: {
        category: z
          .enum(['senders', 'sessions', 'events', 'media', 'groups', 'connection', 'advanced', 'all'] as const)
          .optional()
          .describe('Filter by example category (default: all)'),
        id: z.string().optional().describe('Get a specific example by ID (e.g., "send-buttons", "session-qr")'),
        search: z.string().optional().describe('Search examples by keyword in title, description, or tags'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ category, id, search }) => {
      if (id) {
        const example = getExampleById(id)
        if (!example) {
          const available = EXAMPLES.map((e) => e.id).join(', ')
          return {
            content: [{
              type: 'text' as const,
              text: `**Error:** Example "${id}" not found.\n\n**Available IDs:** ${available}`,
            }],
            isError: true,
          }
        }

        let text = `# ${example.title}\n\n`
        text += `**Category:** ${example.category} | **Source:** \`${example.sourceFile}\`\n\n`
        text += `${example.description}\n\n`
        text += `**Tags:** ${example.tags.map((t) => `\`${t}\``).join(', ')}\n\n`
        text += `\`\`\`go\n${example.code}\n\`\`\`\n`

        return { content: [{ type: 'text' as const, text }] }
      }

      if (search) {
        const results = searchExamples(search)
        if (results.length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: `**No examples found for "${search}".**\n\nTry: ${EXAMPLES.slice(0, 5).map((e) => `\`${e.tags[0]}\``).join(', ')}`,
            }],
          }
        }

        let text = `# Examples matching "${search}" (${results.length})\n\n`
        for (const ex of results) {
          text += `### ${ex.title}\n`
          text += `**ID:** \`${ex.id}\` | **Category:** ${ex.category}\n\n`
          text += `${ex.description}\n\n`
          text += `\`\`\`go\n${ex.code}\n\`\`\`\n\n---\n\n`
        }

        return { content: [{ type: 'text' as const, text }] }
      }

      let examples = EXAMPLES
      const filterCategory = category && category !== 'all' ? category as ExampleCategory : undefined
      if (filterCategory) {
        examples = getExamplesByCategory(filterCategory)
      }

      if (filterCategory) {
        let text = `# ${filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)} Examples (${examples.length})\n\n`
        for (const ex of examples) {
          text += `### ${ex.title}\n`
          text += `**ID:** \`${ex.id}\` | **Source:** \`${ex.sourceFile}\`\n\n`
          text += `${ex.description}\n\n`
          text += `\`\`\`go\n${ex.code}\n\`\`\`\n\n---\n\n`
        }
        return { content: [{ type: 'text' as const, text }] }
      }

      let text = `# Production Code Examples (${EXAMPLES.length} total)\n\n`
      text += `Extracted from API_WHATSMEOW — a production Go WhatsApp API.\n\n`

      for (const cat of EXAMPLE_CATEGORIES) {
        const catExamples = getExamplesByCategory(cat)
        text += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${catExamples.length})\n\n`
        for (const ex of catExamples) {
          text += `- **${ex.title}** — \`${ex.id}\` — ${ex.description}\n`
        }
        text += '\n'
      }

      text += `\n> Use \`id\` parameter to get full code: \`whatsmeow_examples({ id: "send-buttons" })\`\n`
      text += `> Use \`search\` for keyword search: \`whatsmeow_examples({ search: "sticker" })\`\n`

      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
