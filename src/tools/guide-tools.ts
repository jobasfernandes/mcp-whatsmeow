import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  CLIENT_METHODS,
  getMethodsByCategory,
  getMethodByName,
  searchMethods,
  getMethodCategories,
  type ClientMethodCategory,
} from '../knowledge/client-methods.js'
import { CHAT_REFERENCE, getChatTopic } from '../knowledge/chat.js'
import { CONNECTION_REFERENCE, getConnectionTopic } from '../knowledge/connection.js'
import { GUIDES, getGuide, getGuideNames } from '../knowledge/guides.js'

const CATEGORY_EMOJI: Record<string, string> = {
  connection: '\u{1F50C}',
  messaging: '\u{1F4E8}',
  groups: '\u{1F465}',
  newsletter: '\u{1F4F0}',
  user: '\u{1F464}',
  presence: '\u{1F7E2}',
  privacy: '\u{1F512}',
  media_download: '\u{2B07}',
  media_upload: '\u{2B06}',
  media_retry: '\u{1F504}',
  appstate: '\u{1F4BE}',
  calls: '\u{1F4DE}',
  broadcast: '\u{1F4E2}',
  push: '\u{1F514}',
}

export function registerGuideTools(mcpServer: McpServer) {
  mcpServer.registerTool(
    'whatsmeow_client_methods',
    {
      description:
        'WhatsApp Client struct public methods reference for whatsmeow (Go). Lists all 120+ public methods with signatures, organized by category (connection, messaging, groups, newsletter, user, presence, privacy, media, appstate, calls). Use without parameters for overview, or filter by name/category.',
      inputSchema: {
        method: z
          .string()
          .optional()
          .describe('Method name to look up (e.g., "SendMessage", "CreateGroup", "Upload")'),
        category: z
          .enum([
            'connection', 'messaging', 'groups', 'newsletter', 'user',
            'presence', 'privacy', 'media_download', 'media_upload',
            'media_retry', 'appstate', 'calls', 'broadcast', 'push',
          ] as const)
          .optional()
          .describe('Filter by method category'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ method, category }) => {
      if (method) {
        const m = getMethodByName(method)
        if (m) {
          let text = `# ${CATEGORY_EMOJI[m.category] ?? ''} ${m.name}\n\n`
          text += `**Category:** ${m.category}\n`
          text += `**Signature:**\n\`\`\`go\n${m.signature}\n\`\`\`\n\n`
          text += `${m.description}\n`
          return { content: [{ type: 'text' as const, text }] }
        }

        const suggestions = searchMethods(method)
        if (suggestions.length > 0) {
          let text = `Method "${method}" not found. Did you mean:\n\n`
          text += suggestions
            .slice(0, 8)
            .map((s) => `- **${s.name}** (${s.category}) — ${s.description}`)
            .join('\n')
          return { content: [{ type: 'text' as const, text }], isError: true }
        }
        return {
          content: [{ type: 'text' as const, text: `Method "${method}" not found. Use without parameters to see all methods.` }],
          isError: true,
        }
      }

      const categories = category
        ? [category]
        : getMethodCategories().map((c) => c.category)

      let text = `# WhatsApp Client Methods (whatsmeow)\n\n`
      text += `Total: ${CLIENT_METHODS.length} public methods\n\n`

      for (const cat of categories) {
        const methods = getMethodsByCategory(cat as ClientMethodCategory)
        if (methods.length === 0) continue
        const emoji = CATEGORY_EMOJI[cat] ?? ''
        text += `## ${emoji} ${cat} (${methods.length})\n\n`
        text += `| Method | Description |\n`
        text += `|--------|-------------|\n`
        for (const m of methods) {
          text += `| ${m.name} | ${m.description} |\n`
        }
        text += '\n'
      }

      text += `---\n*Use \`whatsmeow_client_methods\` with \`method\` parameter for full signature and details.*`
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_chat',
    {
      description:
        'Chat operations reference for whatsmeow: presence types (online/offline, typing/recording), disappearing message timers, status/broadcast privacy settings, and receipt types. Use topic parameter to focus on a specific area.',
      inputSchema: {
        topic: z
          .enum(['presence', 'disappearing', 'status', 'receipts', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getChatTopic(topic ?? 'all')
      let text = `# Chat Operations Reference (whatsmeow)\n\n`

      if (data.presenceTypes) {
        text += `## \u{1F7E2} Presence Types\n\n`
        for (const pt of data.presenceTypes) {
          text += `### ${pt.name} (\`${pt.goType}\`)\n`
          text += `| Constant | Value | Description |\n`
          text += `|----------|-------|-------------|\n`
          for (const c of pt.constants) {
            text += `| ${c.name} | \`${c.value}\` | ${c.description} |\n`
          }
          text += '\n'
        }
        text += `**Usage:**\n\`\`\`go\ncli.SendPresence(ctx, types.PresenceAvailable)\ncli.SendChatPresence(ctx, chatJID, types.ChatPresenceComposing, types.ChatPresenceMediaText)\n\`\`\`\n\n`
      }

      if (data.disappearingTimers) {
        text += `## \u{23F3} Disappearing Timers\n\n`
        text += `| Name | Constant | Value | Description |\n`
        text += `|------|----------|-------|-------------|\n`
        for (const t of data.disappearingTimers) {
          text += `| ${t.name} | ${t.constant} | \`${t.value}\` | ${t.description} |\n`
        }
        text += '\n'
      }

      if (data.disappearingParser) {
        text += `### Parser\n`
        text += `\`\`\`go\n${data.disappearingParser.signature}\n\`\`\`\n`
        text += `${data.disappearingParser.description}\n\n`
        text += `Accepted strings:\n`
        for (const s of data.disappearingParser.acceptedStrings) {
          text += `- ${s}\n`
        }
        text += '\n'
      }

      if (data.statusPrivacy) {
        text += `## \u{1F4E2} Status/Broadcast Privacy\n\n`
        text += `\`\`\`go\n${data.statusPrivacy.getMethod}\n\`\`\`\n\n`
        text += `Default: \`${data.statusPrivacy.defaultConstant}\`\n\n`
        text += `| Type | Value | Description |\n`
        text += `|------|-------|-------------|\n`
        for (const t of data.statusPrivacy.types) {
          text += `| ${t.name} | \`${t.value}\` | ${t.description} |\n`
        }
        text += '\n'
      }

      if (data.receiptTypes) {
        text += `## \u{2705} Receipt Types\n\n`
        text += `| Constant | Value | Description |\n`
        text += `|----------|-------|-------------|\n`
        for (const r of data.receiptTypes) {
          text += `| ${r.name} | \`${r.value}\` | ${r.description} |\n`
        }
        text += '\n'
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_connection',
    {
      description:
        'Connection and authentication reference for whatsmeow: QR code flow, PairPhone code pairing, Noise protocol handshake, auto-reconnect with backoff, keepalive ping mechanism, and proxy configuration. Use topic parameter to focus on a specific area.',
      inputSchema: {
        topic: z
          .enum(['qr', 'pairphone', 'noise', 'reconnect', 'keepalive', 'proxy', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getConnectionTopic(topic ?? 'all')
      let text = `# Connection & Auth Reference (whatsmeow)\n\n`

      if (data.qrFlow) {
        text += `## \u{1F4F1} QR Code Pairing\n\n`
        text += `\`\`\`go\n${data.qrFlow.getQRChannel.signature}\n\`\`\`\n\n`
        text += `${data.qrFlow.getQRChannel.description}\n\n`
        text += `**Timing:** ${data.qrFlow.getQRChannel.timing}\n\n`
        text += `### Channel Events\n`
        text += `| Event | Description |\n`
        text += `|-------|-------------|\n`
        for (const e of data.qrFlow.getQRChannel.channelEvents) {
          text += `| ${e.name} | ${e.description} |\n`
        }
        text += '\n'
        text += `### QRChannelItem Struct\n`
        text += `| Field | Type | Description |\n`
        text += `|-------|------|-------------|\n`
        for (const f of data.qrFlow.qrChannelItem.fields) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
        text += `### Complete Pattern\n\`\`\`go\n${data.qrFlow.codePattern}\n\`\`\`\n\n`
      }

      if (data.pairPhone) {
        text += `## \u{1F4F2} Phone Code Pairing\n\n`
        text += `\`\`\`go\n${data.pairPhone.signature}\n\`\`\`\n\n`
        text += `${data.pairPhone.description}\n\n`
        text += `- **Code format:** ${data.pairPhone.codeFormat}\n`
        text += `- **Timeout:** ${data.pairPhone.timeout}\n\n`
        text += `### Crypto\n`
        for (const c of data.pairPhone.crypto) {
          text += `- ${c}\n`
        }
        text += '\n'
        text += `### PairClientType\n`
        text += `| Name | Value | Description |\n`
        text += `|------|-------|-------------|\n`
        for (const ct of data.pairPhone.clientTypes) {
          text += `| ${ct.name} | ${ct.value} | ${ct.description} |\n`
        }
        text += '\n'
      }

      if (data.noise) {
        text += `## \u{1F510} Noise Protocol Handshake\n\n`
        text += `**Protocol:** \`${data.noise.protocol}\`\n\n`
        text += `${data.noise.description}\n\n`
        text += `- Handshake timeout: ${data.noise.handshakeTimeout}\n`
        text += `- Server cert verification: ${data.noise.certKey}\n\n`
        text += `### Steps\n`
        for (const s of data.noise.steps) {
          text += `${s}\n`
        }
        text += '\n'
      }

      if (data.reconnect) {
        text += `## \u{1F504} Auto-Reconnect\n\n`
        text += `| Field | Type | Description |\n`
        text += `|-------|------|-------------|\n`
        for (const f of data.reconnect.fields) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
        text += `### Stream Error Handling\n`
        text += `| Code | Action |\n`
        text += `|------|--------|\n`
        for (const se of data.reconnect.streamErrors) {
          text += `| ${se.code} | ${se.action} |\n`
        }
        text += '\n'
        text += `**Backoff:** ${data.reconnect.backoffStrategy}\n\n`
      }

      if (data.keepalive) {
        text += `## \u{1F493} Keepalive\n\n`
        text += `| Constant | Value | Description |\n`
        text += `|----------|-------|-------------|\n`
        for (const c of data.keepalive.constants) {
          text += `| ${c.name} | \`${c.value}\` | ${c.description} |\n`
        }
        text += '\n'
        text += `### Behavior\n`
        for (const b of data.keepalive.behavior) {
          text += `- ${b}\n`
        }
        text += '\n'
      }

      if (data.proxy) {
        text += `## \u{1F310} Proxy Configuration\n\n`
        text += `### Proxy Methods\n`
        for (const m of data.proxy.methods) {
          text += `- \`${m.signature}\`\n  ${m.description}\n`
        }
        text += '\n'
        text += `### SetProxyOptions\n`
        text += `| Option | Type | Description |\n`
        text += `|--------|------|-------------|\n`
        for (const o of data.proxy.options) {
          text += `| ${o.name} | \`${o.type}\` | ${o.description} |\n`
        }
        text += '\n'
        text += `### HTTP Client Overrides\n`
        for (const h of data.proxy.httpClients) {
          text += `- \`${h.signature}\`\n  ${h.description}\n`
        }
        text += '\n'
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_guides',
    {
      description:
        'Practical guides for whatsmeow development: media handling (upload/download/encryption/stickers), groups & communities (creation/management/invites), calls (events/rejection), and utility mappings (type detection/error sentinels). Use guide parameter to select a specific guide.',
      inputSchema: {
        guide: z
          .enum(['media', 'groups', 'calls', 'mappings'] as const)
          .optional()
          .describe('Guide name (media, groups, calls, mappings). Omit for overview.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ guide: guideName }) => {
      if (guideName) {
        const g = getGuide(guideName)
        if (g) {
          let text = `# ${g.title}\n\n`
          text += `${g.description}\n\n`
          for (const section of g.sections) {
            text += `## ${section.title}\n\n${section.content}\n\n`
          }
          return { content: [{ type: 'text' as const, text }] }
        }
        return {
          content: [{ type: 'text' as const, text: `Guide "${guideName}" not found. Available: ${getGuideNames().join(', ')}` }],
          isError: true,
        }
      }

      let text = `# whatsmeow Development Guides\n\n`
      text += `| Guide | Description |\n`
      text += `|-------|-------------|\n`
      for (const g of GUIDES) {
        text += `| ${g.name} | ${g.description} |\n`
      }
      text += `\n---\n*Use \`whatsmeow_guides\` with \`guide\` parameter for full guide content.*`
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
