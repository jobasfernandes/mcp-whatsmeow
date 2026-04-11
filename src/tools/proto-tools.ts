import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { AstParser, ExtractedType } from '../ast-parser.js'
import { formatExtractedType } from '../formatters.js'

const PROTO_CATEGORIES: Record<string, (t: ExtractedType) => boolean> = {
  message: (t) => t.kind === 'struct' && /Message$/i.test(t.name),
  media: (t) => t.kind === 'struct' && /^(Image|Video|Audio|Document|Sticker|PTV)Message/i.test(t.name),
  interactive: (t) => t.kind === 'struct' && /(Interactive|Button|List|Template|NativeFlow)/i.test(t.name),
  system: (t) => t.kind === 'struct' && /(Protocol|SenderKey|Prekey|Receipt|Notification|Handshake)/i.test(t.name),
  group: (t) => t.kind === 'struct' && /(Group|Community|Participant)/i.test(t.name),
  enum: (t) => t.kind === 'const' || t.kind === 'type',
  struct: (t) => t.kind === 'struct',
}

function categorizeProtoType(t: ExtractedType): string {
  if (t.kind === 'const' || (t.kind === 'type' && !t.fullSignature)) return 'enum'
  if (t.kind === 'struct' && /Message$/i.test(t.name)) {
    if (/(Interactive|Button|List|Template|NativeFlow)/i.test(t.name)) return 'interactive'
    if (/^(Image|Video|Audio|Document|Sticker|PTV)Message/i.test(t.name)) return 'media'
    if (/(Protocol|SenderKey|Prekey|Receipt|Notification|Handshake)/i.test(t.name)) return 'system'
    return 'message'
  }
  if (t.kind === 'struct' && /(Group|Community|Participant)/i.test(t.name)) return 'group'
  if (t.kind === 'struct') return 'struct'
  return 'other'
}

export function registerProtoTools(mcpServer: McpServer, srcPath: string) {
  mcpServer.registerTool(
    'whatsmeow_proto',
    {
      description:
        'Browse waE2E protobuf types from whatsmeow. Lists message structs, enums, and nested types from the proto/waE2E package. Supports filtering by category (message, media, interactive, system, group, enum, struct) and search by name. Use whatsmeow_proto_type for detailed type info.',
      inputSchema: {
        category: z
          .enum(['message', 'media', 'interactive', 'system', 'group', 'enum', 'struct', 'all'] as const)
          .optional()
          .describe('Filter by proto type category (default: all)'),
        search: z.string().optional().describe('Search proto type names (fuzzy match)'),
        limit: z.number().optional().describe('Max results to return (default: 50, max: 200)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ category, search, limit }) => {
      const parser = new AstParser(srcPath)
      const maxResults = Math.min(limit ?? 50, 200)

      let types = parser.extractAllTypes().filter((t) => t.file.includes('waE2E'))

      if (types.length === 0) {
        return {
          content: [{
            type: 'text' as const,
            text: '**Error:** waE2E proto package not found. Run `whatsmeow_update` to ensure the repository is complete.',
          }],
          isError: true,
        }
      }

      if (search) {
        const results = parser.searchByContext(search, maxResults, { module: 'proto' })
        types = results
          .map((r) => r.type)
          .filter((t) => t.file.includes('waE2E'))
      }

      if (category && category !== 'all') {
        const filter = PROTO_CATEGORIES[category]
        if (filter) types = types.filter(filter)
      }

      types = types.slice(0, maxResults)

      const grouped: Record<string, ExtractedType[]> = {}
      for (const t of types) {
        const cat = categorizeProtoType(t)
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(t)
      }

      let text = `# waE2E Proto Types\n\n`
      text += `**Showing:** ${types.length} types`
      if (search) text += ` matching "${search}"`
      if (category && category !== 'all') text += ` in category "${category}"`

      const totalWaE2E = parser.extractAllTypes().filter((t) => t.file.includes('waE2E')).length
      text += ` (${totalWaE2E} total in waE2E)\n\n`

      const categoryOrder = ['message', 'media', 'interactive', 'system', 'group', 'struct', 'enum', 'other']
      const categoryLabels: Record<string, string> = {
        message: 'Message Types',
        media: 'Media Messages',
        interactive: 'Interactive Messages',
        system: 'System/Protocol Types',
        group: 'Group Types',
        struct: 'Other Structs',
        enum: 'Enums & Constants',
        other: 'Other',
      }

      for (const cat of categoryOrder) {
        const items = grouped[cat]
        if (!items || items.length === 0) continue
        text += `## ${categoryLabels[cat] ?? cat} (${items.length})\n\n`
        for (const t of items) {
          text += `- **${t.name}** (\`${t.kind}\`) — \`${t.file}:${t.lineNumber ?? ''}\`\n`
          if (t.docs) text += `  ${t.docs}\n`
        }
        text += '\n'
      }

      text += `\n> Use \`whatsmeow_proto_type\` with type name for full struct definition with fields.\n`

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_proto_type',
    {
      description:
        'Get detailed waE2E protobuf type definition including all fields, nested types, and documentation. Provide the exact type name (e.g., "InteractiveMessage", "ImageMessage", "Message").',
      inputSchema: {
        name: z.string().describe('Proto type name (e.g., InteractiveMessage, ImageMessage, Message)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const parser = new AstParser(srcPath)
      const found = parser.searchType(name)

      if (!found || !found.file.includes('waE2E')) {
        const allProto = parser.extractAllTypes().filter((t) => t.file.includes('waE2E'))
        const nameLower = name.toLowerCase()
        const suggestions = allProto
          .filter((t) => t.name.toLowerCase().includes(nameLower))
          .slice(0, 8)

        let text = `**Error:** Proto type "${name}" not found in waE2E package.\n\n`
        if (suggestions.length > 0) {
          text += `**Similar types:**\n`
          for (const s of suggestions) {
            text += `- \`${s.name}\` (${s.kind})\n`
          }
        }

        return { content: [{ type: 'text' as const, text }], isError: true }
      }

      let text = formatExtractedType(found, true)

      if (found.kind === 'struct' && found.properties) {
        const nestedNames = found.properties
          .map((p) => {
            const match = p.type.match(/^\*?(\w+Message\w*)$/)
            return match ? match[1] : null
          })
          .filter((n): n is string => n !== null)

        if (nestedNames.length > 0) {
          text += `\n### Nested Message Types\n\n`
          text += `These fields reference other proto types you can inspect:\n`
          for (const n of nestedNames) {
            text += `- \`${n}\` — use \`whatsmeow_proto_type({ name: "${n}" })\`\n`
          }
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
