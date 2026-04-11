import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  MESSAGE_TYPES,
  getMessageByName,
  getMessagesByCategory,
  searchMessages,
  type MessageCategory,
} from '../knowledge/messages.js'
import {
  INTERACTIVE_TYPES,
  ADDITIONAL_NODES_PATTERN,
  FUTURE_PROOF_PATTERN,
  getInteractiveByName,
} from '../knowledge/interactive.js'
import { JID_REFERENCE, getJidTopic } from '../knowledge/jid.js'
import {
  EVENTS,
  getEventByName,
  getEventsByCategory,
  searchEvents,
  type EventCategory,
} from '../knowledge/events.js'

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    basic: '\u{1F4DD}',
    media: '\u{1F3AC}',
    interactive: '\u{1F3AE}',
    advanced: '\u{2728}',
    system: '\u{2699}',
    connection: '\u{1F50C}',
    message: '\u{1F4E8}',
    group: '\u{1F465}',
    call: '\u{1F4DE}',
    appstate: '\u{1F504}',
    newsletter: '\u{1F4F0}',
    presence: '\u{1F7E2}',
    privacy: '\u{1F512}',
    misc: '\u{1F4CB}',
  }
  return map[category] ?? ''
}

export function registerDomainTools(mcpServer: McpServer) {
  mcpServer.registerTool(
    'whatsmeow_messages',
    {
      description:
        'WhatsApp message content types reference for whatsmeow (Go). Lists all message types with waE2E protobuf struct names, required fields, and Go code sending patterns. Use without parameters to see all types, or filter by name/category.',
      inputSchema: {
        type: z
          .string()
          .optional()
          .describe(
            'Message type name to look up (e.g., "text", "image", "buttons", "poll", "sticker")',
          ),
        category: z
          .enum(['basic', 'media', 'interactive', 'advanced', 'system'] as const)
          .optional()
          .describe('Filter by category'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ type, category }) => {
      if (type) {
        const msg = getMessageByName(type)
        if (msg) {
          let text = `# ${getCategoryEmoji(msg.category)} ${msg.name} (${msg.waE2EStruct})\n\n`
          text += `**Category:** ${msg.category}\n`
          text += `**Proto field:** #${msg.protoFieldNumber}\n`
          text += `**Go type:** \`${msg.goType}\`\n\n`
          text += `${msg.description}\n\n`
          text += `## Required Fields\n\`\`\`go\n${msg.requiredFields.join('\n')}\n\`\`\`\n\n`
          if (msg.optionalFields.length > 0) {
            text += `## Optional Fields\n\`\`\`go\n${msg.optionalFields.join('\n')}\n\`\`\`\n\n`
          }
          if (msg.sendPattern) {
            text += `## Sending Pattern\n\`\`\`go\n${msg.sendPattern}\n\`\`\`\n\n`
          }
          if (msg.notes.length > 0) {
            text += `## Notes\n${msg.notes.map((n) => `- ${n}`).join('\n')}\n`
          }
          return { content: [{ type: 'text' as const, text }] }
        }

        const suggestions = searchMessages(type)
        if (suggestions.length > 0) {
          let text = `Message type "${type}" not found. Did you mean:\n\n`
          text += suggestions
            .slice(0, 5)
            .map((s) => `- **${s.name}** (${s.waE2EStruct}) — ${s.description}`)
            .join('\n')
          return { content: [{ type: 'text' as const, text }], isError: true }
        }
        return {
          content: [{ type: 'text' as const, text: `Message type "${type}" not found. Use without parameters to see all available types.` }],
          isError: true,
        }
      }

      const categories: MessageCategory[] = category
        ? [category]
        : ['basic', 'media', 'interactive', 'advanced', 'system']

      let text = `# WhatsApp Message Types (whatsmeow/waE2E)\n\n`
      text += `Total: ${MESSAGE_TYPES.length} message types\n\n`

      for (const cat of categories) {
        const msgs = getMessagesByCategory(cat)
        if (msgs.length === 0) continue
        text += `## ${getCategoryEmoji(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${msgs.length})\n\n`
        text += `| Name | waE2E Struct | Proto # | Description |\n`
        text += `|------|-------------|---------|-------------|\n`
        for (const m of msgs) {
          text += `| ${m.name} | ${m.waE2EStruct} | ${m.protoFieldNumber} | ${m.description} |\n`
        }
        text += '\n'
      }

      text += `\n---\n*Use \`whatsmeow_messages\` with \`type\` parameter for detailed info and sending patterns.*`
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_interactive',
    {
      description:
        'Interactive message structures for whatsmeow (buttons, lists, templates, native flow). Includes the CRITICAL AdditionalNodes and FutureProofMessage patterns required for interactive messages to work. Use without parameters for overview, or specify a type for full structure.',
      inputSchema: {
        type: z
          .enum(['buttons', 'list', 'template', 'nativeFlow'] as const)
          .optional()
          .describe('Interactive type to look up'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ type }) => {
      if (type) {
        const info = getInteractiveByName(type)
        if (info) {
          let text = `# ${info.name} (${info.protoName})\n\n`
          text += `${info.description}\n\n`
          text += `**AdditionalNodes required:** ${info.additionalNodesRequired ? 'YES' : 'No'}\n`
          text += `**FutureProofMessage wrapped:** ${info.futureProofWrapped ? 'YES' : 'No'}\n`
          if (info.headerTypes) {
            text += `**Header types:** ${info.headerTypes.join(', ')}\n`
          }
          text += `\n## Go Struct Definition\n\`\`\`go\n${info.structure}\n\`\`\`\n\n`
          text += `## Complete Sending Pattern\n\`\`\`go\n${info.sendingPattern}\n\`\`\`\n\n`
          if (info.notes.length > 0) {
            text += `## Notes\n${info.notes.map((n) => `- ${n}`).join('\n')}\n`
          }
          return { content: [{ type: 'text' as const, text }] }
        }
        const available = INTERACTIVE_TYPES.map((t) => t.name).join(', ')
        return {
          content: [{ type: 'text' as const, text: `Interactive type "${type}" not found. Available: ${available}` }],
          isError: true,
        }
      }

      let text = `# Interactive Messages (whatsmeow)\n\n`
      text += `Interactive messages in whatsmeow require special handling compared to regular messages.\n\n`
      text += `## Types Overview\n\n`
      text += `| Type | Proto Name | AdditionalNodes | FutureProof |\n`
      text += `|------|-----------|----------------|-------------|\n`
      for (const t of INTERACTIVE_TYPES) {
        text += `| ${t.name} | ${t.protoName} | ${t.additionalNodesRequired ? 'REQUIRED' : 'No'} | ${t.futureProofWrapped ? 'YES' : 'No'} |\n`
      }
      text += `\n## AdditionalNodes Pattern (CRITICAL)\n\n`
      text += `Buttons and list messages **silently fail** without AdditionalNodes in SendRequestExtra:\n\n`
      text += `\`\`\`go\n${ADDITIONAL_NODES_PATTERN}\n\`\`\`\n\n`
      text += `## FutureProofMessage Pattern\n\n`
      text += `Some message types require FutureProofMessage wrapping for forward compatibility:\n\n`
      text += `\`\`\`go\n${FUTURE_PROOF_PATTERN}\n\`\`\`\n\n`
      text += `---\n*Use \`whatsmeow_interactive\` with \`type\` parameter for full struct definition and sending pattern.*`
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_jid',
    {
      description:
        'JID (Jabber ID) and LID (Linked Identity) reference for whatsmeow. Covers JID struct, server types (@s.whatsapp.net, @g.us, @lid, @newsletter, etc.), special JIDs, utility functions, and LID migration.',
      inputSchema: {
        topic: z
          .enum(['formats', 'utilities', 'special', 'lid', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getJidTopic(topic ?? 'all')
      let text = `# JID/LID Reference (whatsmeow)\n\n`

      if (data.struct) {
        text += `## JID Struct (types.JID)\n\`\`\`go\ntype JID struct {\n`
        for (const f of data.struct.fields) {
          text += `    ${f.name.padEnd(12)} ${f.type.padEnd(10)} // ${f.description}\n`
        }
        text += `}\n\`\`\`\n\n`
      }

      if (data.servers) {
        text += `## Server Types (${data.servers.length})\n\n`
        text += `| Constant | Value | Description |\n`
        text += `|----------|-------|-------------|\n`
        for (const s of data.servers) {
          text += `| ${s.constant} | \`${s.value}\` | ${s.description} |\n`
        }
        text += '\n'
      }

      if (data.domainTypes) {
        text += `## Domain Types\n\n`
        text += `| Name | Value | Description |\n`
        text += `|------|-------|-------------|\n`
        for (const d of data.domainTypes) {
          text += `| ${d.name} | \`${d.value}\` | ${d.description} |\n`
        }
        text += '\n'
      }

      if (data.specialJids) {
        text += `## Special JIDs (${data.specialJids.length})\n\n`
        text += `| Name | User | Server | Description |\n`
        text += `|------|------|--------|-------------|\n`
        for (const j of data.specialJids) {
          text += `| ${j.constant} | \`${j.user || '""'}\` | \`${j.server || '""'}\` | ${j.description} |\n`
        }
        text += '\n'
      }

      if (data.utilities) {
        text += `## Utility Functions & Methods (${data.utilities.length})\n\n`
        const funcs = data.utilities.filter((u) => !u.isMethod)
        const methods = data.utilities.filter((u) => u.isMethod)

        if (funcs.length > 0) {
          text += `### Constructors / Functions\n`
          for (const f of funcs) {
            text += `- \`${f.signature}\`\n  ${f.description}\n`
          }
          text += '\n'
        }
        if (methods.length > 0) {
          text += `### JID Methods\n`
          for (const m of methods) {
            text += `- \`${m.signature}\`\n  ${m.description}\n`
          }
          text += '\n'
        }
      }

      if (data.lidMigration) {
        text += `## LID Migration\n\n`
        text += `The LID (Linked Identity) system replaces phone-number-based addressing for privacy.\n\n`
        text += `| Field | Type | Description |\n`
        text += `|-------|------|-------------|\n`
        for (const l of data.lidMigration) {
          text += `| ${l.field} | \`${l.type}\` | ${l.description} |\n`
        }
        text += '\n'
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_events',
    {
      description:
        'WhatsApp event system reference for whatsmeow. Lists all 50+ events with Go struct types, fields, and categories (connection, message, group, call, appstate, newsletter, presence, privacy). Use without parameters to see all events, or filter by name/category.',
      inputSchema: {
        event: z
          .string()
          .optional()
          .describe('Event name to look up (e.g., "Message", "Connected", "CallOffer")'),
        category: z
          .enum([
            'connection',
            'message',
            'group',
            'call',
            'appstate',
            'newsletter',
            'presence',
            'privacy',
            'misc',
          ] as const)
          .optional()
          .describe('Filter by event category'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ event, category }) => {
      if (event) {
        const ev = getEventByName(event)
        if (ev) {
          let text = `# ${getCategoryEmoji(ev.category)} ${ev.name} (${ev.goStruct})\n\n`
          text += `**Category:** ${ev.category}\n\n`
          text += `${ev.description}\n\n`
          if (ev.fields.length > 0) {
            text += `## Fields\n\`\`\`go\n${ev.fields.join('\n')}\n\`\`\`\n\n`
          } else {
            text += `*Empty struct — no fields*\n\n`
          }
          text += `## Handler Example\n\`\`\`go\ncli.AddEventHandler(func(evt *${ev.goStruct}) {\n`
          if (ev.fields.length > 0) {
            text += `    // Access: evt.${ev.fields[0].split(' ')[0]}\n`
          }
          text += `})\n\`\`\`\n\n`
          if (ev.notes.length > 0) {
            text += `## Notes\n${ev.notes.map((n) => `- ${n}`).join('\n')}\n`
          }
          return { content: [{ type: 'text' as const, text }] }
        }

        const suggestions = searchEvents(event)
        if (suggestions.length > 0) {
          let text = `Event "${event}" not found. Did you mean:\n\n`
          text += suggestions
            .slice(0, 5)
            .map((s) => `- **${s.name}** (${s.goStruct}) — ${s.description}`)
            .join('\n')
          return { content: [{ type: 'text' as const, text }], isError: true }
        }
        return {
          content: [{ type: 'text' as const, text: `Event "${event}" not found. Use without parameters to see all events.` }],
          isError: true,
        }
      }

      const categories: EventCategory[] = category
        ? [category]
        : ['connection', 'message', 'group', 'call', 'appstate', 'newsletter', 'presence', 'privacy', 'misc']

      let text = `# WhatsApp Events (whatsmeow)\n\n`
      text += `Total: ${EVENTS.length} events\n\n`

      for (const cat of categories) {
        const evts = getEventsByCategory(cat)
        if (evts.length === 0) continue
        text += `## ${getCategoryEmoji(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)} Events (${evts.length})\n\n`
        text += `| Event | Go Struct | Description |\n`
        text += `|-------|----------|-------------|\n`
        for (const e of evts) {
          text += `| ${e.name} | ${e.goStruct} | ${e.description} |\n`
        }
        text += '\n'
      }

      text += `## Handler Pattern\n\`\`\`go\ncli.AddEventHandler(func(evt interface{}) {\n    switch v := evt.(type) {\n    case *events.Message:\n        // handle message\n    case *events.Connected:\n        // handle connected\n    }\n})\n\`\`\`\n\n`
      text += `---\n*Use \`whatsmeow_events\` with \`event\` parameter for detailed event info.*`
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
