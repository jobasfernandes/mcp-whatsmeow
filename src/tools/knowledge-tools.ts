import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NEWSLETTER_REFERENCE, getNewsletterTopic } from '../knowledge/newsletter.js'
import { PRIVACY_REFERENCE, getPrivacyTopic } from '../knowledge/privacy.js'
import { APPSTATE_REFERENCE, getAppStateTopic } from '../knowledge/appstate.js'
import { MEDIA_REFERENCE, getMediaTopic } from '../knowledge/media.js'
import { GROUPS_REFERENCE, getGroupsTopic } from '../knowledge/groups.js'
import { STORE_REFERENCE, getStoreTopic } from '../knowledge/store.js'
import { HISTORY_REFERENCE, getHistoryTopic } from '../knowledge/history.js'

export function registerKnowledgeTools(mcpServer: McpServer) {
  mcpServer.registerTool(
    'whatsmeow_newsletter',
    {
      description:
        'Newsletter/Channels reference for whatsmeow: 14 methods (create, follow, unfollow, get info, messages, reactions, mute, live updates), types (NewsletterMetadata, NewsletterMessage), enums (role, mute, state, reactions), and 4 events. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['methods', 'types', 'events', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getNewsletterTopic(topic ?? 'all')
      let text = `# Newsletter/Channels Reference (whatsmeow)\n\n`
      text += `${NEWSLETTER_REFERENCE.overview}\n\n`
      text += `**Link prefix:** \`${NEWSLETTER_REFERENCE.linkPrefix}\`\n\n`

      if (data.methods) {
        text += `## Methods (${data.methods.length})\n\n`
        for (const m of data.methods) {
          text += `### ${m.name}\n\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
        }
      }

      if (data.paramStructs) {
        text += `## Parameter Structs\n\n`
        for (const ps of data.paramStructs) {
          text += `### ${ps.name}\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of ps.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.types) {
        text += `## Types\n\n`
        for (const t of data.types) {
          text += `### ${t.name} (\`${t.goType}\`)\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of t.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.enums) {
        text += `## Enums\n\n`
        for (const e of data.enums) {
          text += `### ${e.name} (\`${e.goType}\`)\n| Constant | Value | Description |\n|----------|-------|-------------|\n`
          for (const v of e.values) {
            text += `| ${v.name} | \`${v.value}\` | ${v.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.events) {
        text += `## Events\n\n`
        for (const ev of data.events) {
          text += `### ${ev.name}\n${ev.description}\n\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of ev.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_privacy',
    {
      description:
        'Privacy settings reference for whatsmeow: 10 setting types (groupadd, last seen, status, profile, readreceipts, online, calladd, defense, messages, stickers), 10 setting values, blocklist management, and related events. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['settings', 'methods', 'blocklist', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getPrivacyTopic(topic ?? 'all')
      let text = `# Privacy Settings Reference (whatsmeow)\n\n`
      text += `${PRIVACY_REFERENCE.overview}\n\n`

      if (data.settingTypes) {
        text += `## Setting Types (${data.settingTypes.length})\n\n`
        text += `| Constant | Value | Description |\n|----------|-------|-------------|\n`
        for (const st of data.settingTypes) {
          text += `| ${st.name} | \`${st.value}\` | ${st.description} |\n`
        }
        text += '\n'
      }

      if (data.settingValues) {
        text += `## Setting Values (${data.settingValues.length})\n\n`
        text += `| Constant | Value | Description |\n|----------|-------|-------------|\n`
        for (const sv of data.settingValues) {
          text += `| ${sv.name} | \`${sv.value}\` | ${sv.description} |\n`
        }
        text += '\n'
      }

      if (data.settingsStruct) {
        text += `## PrivacySettings Struct (\`${data.settingsStruct.goType}\`)\n\n`
        text += `| Field | Type | Description |\n|-------|------|-------------|\n`
        for (const f of data.settingsStruct.fields) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
      }

      if (data.methods) {
        text += `## Methods\n\n`
        for (const m of data.methods) {
          text += `### ${m.name}\n\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
        }
      }

      if (data.blocklist) {
        text += `## Blocklist\n\n`
        for (const m of data.blocklist.methods) {
          text += `### ${m.name}\n\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
        }
        text += `### Actions\n| Constant | Value | Description |\n|----------|-------|-------------|\n`
        for (const a of data.blocklist.actions) {
          text += `| ${a.name} | \`${a.value}\` | ${a.description} |\n`
        }
        text += '\n'
        text += `### Events\n`
        for (const ev of data.blocklist.events) {
          text += `**${ev.name}** — ${ev.description}\n\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of ev.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_appstate',
    {
      description:
        'App State sync reference for whatsmeow: 5 patch collections, LTHash integrity (128-byte), HKDF key derivation, 11 builder functions (mute, pin, archive, star, labels, push name, delete chat), 17+ index constants, encoding/decoding, conflict handling (409), and error sentinels. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['collections', 'hkdf', 'builders', 'indices', 'encoding', 'decoding', 'errors', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getAppStateTopic(topic ?? 'all')
      let text = `# App State Sync Reference (whatsmeow)\n\n`
      text += `${APPSTATE_REFERENCE.overview}\n\n`

      if (data.collections) {
        text += `## Collections (${data.collections.length})\n\n`
        text += `| Name | Constant | Value | Description |\n|------|----------|-------|-------------|\n`
        for (const c of data.collections) {
          text += `| ${c.name} | ${c.constant} | \`${c.value}\` | ${c.description} |\n`
        }
        text += '\n'
      }

      if (data.allPatchNamesOrder) {
        text += `**Sync order:** ${data.allPatchNamesOrder.join(' → ')}\n\n`
      }

      if (data.hkdf) {
        text += `## LTHash & Integrity\n\n`
        text += `\`${data.hkdf.integrity}\`\n\n${data.hkdf.description}\n\n`
      }

      if (data.encoding) {
        text += `## Encoding\n\n`
        text += `\`\`\`go\n${data.encoding.encodePatch}\n\`\`\`\n\n`
        text += `### PatchInfo\n| Field | Type | Description |\n|-------|------|-------------|\n`
        for (const f of data.encoding.patchInfoStruct) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
      }

      if (data.decoding) {
        text += `## Decoding\n\n`
        text += `\`\`\`go\n${data.decoding.parsePatchList}\n\n${data.decoding.decodePatches}\n\`\`\`\n\n`
        text += `${data.decoding.description}\n\n`
      }

      if (data.builders) {
        text += `## Builder Functions (${data.builders.length})\n\n`
        for (const b of data.builders) {
          text += `### ${b.name}\n\`\`\`go\n${b.signature}\n\`\`\`\n${b.description}\n\n`
        }
      }

      if (data.indices) {
        text += `## Index Constants (${data.indices.length})\n\n`
        text += `| Constant | Value |\n|----------|-------|\n`
        for (const i of data.indices) {
          text += `| ${i.name} | \`${i.value}\` |\n`
        }
        text += '\n'
      }

      if (data.errors) {
        text += `## Error Sentinels\n\n`
        text += `| Error | Description |\n|-------|-------------|\n`
        for (const e of data.errors) {
          text += `| ${e.name} | ${e.description} |\n`
        }
        text += '\n'
      }

      if (data.conflictHandling) {
        text += `## Conflict Handling (409)\n\n${data.conflictHandling}\n\n`
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_media',
    {
      description:
        'Media handling reference for whatsmeow: 8 MediaType constants, E2E encryption flow (HKDF + AES-256-CBC), download methods (5), upload methods (4), UploadResponse fields, media retry flow (404/410), sticker specs, CDN info, and newsletter media differences. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['types', 'encryption', 'download', 'upload', 'sticker', 'cdn', 'thumbnails', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getMediaTopic(topic ?? 'all')
      let text = `# Media Handling Reference (whatsmeow)\n\n`
      text += `${MEDIA_REFERENCE.overview}\n\n`

      if (data.mediaTypes) {
        text += `## Media Types (${data.mediaTypes.length})\n\n`
        text += `| Constant | HKDF Info | Usage |\n|----------|-----------|-------|\n`
        for (const mt of data.mediaTypes) {
          text += `| ${mt.constant} | \`${mt.hkdfInfo}\` | ${mt.usage} |\n`
        }
        text += '\n'
      }

      if (data.encryption) {
        text += `## E2E Encryption\n\n`
        for (const s of data.encryption.steps) {
          text += `**${s.step}. ${s.description}:** ${s.detail}\n\n`
        }
        text += `### DownloadableMessage Interface\n| Method | Type | Description |\n|--------|------|-------------|\n`
        for (const f of data.encryption.downloadableInterface) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
      }

      if (data.download) {
        text += `## Download Methods (${data.download.methods.length})\n\n`
        for (const m of data.download.methods) {
          text += `### ${m.name}\n\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
        }
        text += `### Retry Flow\n${data.download.retryFlow}\n\n`
        text += `### Error Codes\n| Code | Meaning | Action |\n|------|---------|--------|\n`
        for (const ec of data.download.errorCodes) {
          text += `| ${ec.code} | ${ec.meaning} | ${ec.action} |\n`
        }
        text += '\n'
      }

      if (data.upload) {
        text += `## Upload Methods (${data.upload.methods.length})\n\n`
        for (const m of data.upload.methods) {
          text += `### ${m.name}\n\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
        }
        text += `### UploadResponse Fields\n| Field | Type | Description |\n|-------|------|-------------|\n`
        for (const f of data.upload.responseFields) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
        text += `### Newsletter Media Differences\n`
        for (const d of data.upload.newsletterDifferences) {
          text += `- ${d}\n`
        }
        text += '\n'
      }

      if (data.sticker) {
        text += `## Sticker Specs\n\n`
        text += `- **Format:** ${data.sticker.format}\n`
        text += `- **Max size (static):** ${data.sticker.maxSizeStatic}\n`
        text += `- **Max size (animated):** ${data.sticker.maxSizeAnimated}\n`
        text += `- **Dimensions:** ${data.sticker.dimensions}\n`
        text += `- **MIME type:** ${data.sticker.mimeType}\n\n`
      }

      if (data.thumbnails) {
        text += `## Thumbnails\n\n${data.thumbnails.generation}\n\n`
        for (const m of data.thumbnails.methods) {
          text += `\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
        }
      }

      if (data.cdn) {
        text += `## CDN\n\n`
        text += `- **Hosts:** ${data.cdn.hosts.join(', ')}\n`
        text += `- **Path format:** \`${data.cdn.pathFormat}\`\n`
        text += `- **Auth:** ${data.cdn.authParams}\n\n`
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_groups',
    {
      description:
        'Groups & Communities reference for whatsmeow: creation (group, community, sub-group), info retrieval, settings management (name, topic, announce, locked, photo, disappearing, member add mode), participant operations (add/remove/promote/demote), invite links, community operations (sub-groups, link/unlink), types (GroupInfo, GroupParticipant, ReqCreateGroup), and events. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['methods', 'types', 'events', 'community', 'participants', 'invites', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getGroupsTopic(topic ?? 'all')
      let text = `# Groups & Communities Reference (whatsmeow)\n\n`
      text += `${GROUPS_REFERENCE.overview}\n\n`

      if (data.methods) {
        const sections = [
          { key: 'creation' as const, title: 'Creation' },
          { key: 'info' as const, title: 'Info' },
          { key: 'settings' as const, title: 'Settings' },
          { key: 'participants' as const, title: 'Participants' },
          { key: 'invites' as const, title: 'Invites' },
          { key: 'community' as const, title: 'Community' },
        ]
        for (const sec of sections) {
          const methods = data.methods[sec.key]
          if (methods && methods.length > 0) {
            text += `## ${sec.title} Methods (${methods.length})\n\n`
            for (const m of methods) {
              text += `### ${m.name}\n\`\`\`go\n${m.signature}\n\`\`\`\n${m.description}\n\n`
            }
          }
        }
      }

      if (data.types) {
        text += `## Types\n\n`
        for (const t of data.types) {
          text += `### ${t.name} (\`${t.goType}\`)\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of t.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.participantChanges) {
        text += `## Participant Changes\n\n`
        text += `| Constant | Value | Description |\n|----------|-------|-------------|\n`
        for (const pc of data.participantChanges) {
          text += `| ${pc.name} | \`${pc.value}\` | ${pc.description} |\n`
        }
        text += '\n'
      }

      if (data.memberAddModes) {
        text += `## Member Add Modes\n\n`
        text += `| Constant | Value | Description |\n|----------|-------|-------------|\n`
        for (const m of data.memberAddModes) {
          text += `| ${m.name} | \`${m.value}\` | ${m.description} |\n`
        }
        text += '\n'
      }

      if (data.events) {
        text += `## Events\n\n`
        for (const ev of data.events) {
          text += `### ${ev.name}\n${ev.description}\n\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of ev.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.communityNotes) {
        text += `## Community Notes\n\n`
        for (const n of data.communityNotes) {
          text += `- ${n}\n`
        }
        text += '\n'
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_store',
    {
      description:
        'Store layer reference for whatsmeow: 11 store interfaces (IdentityStore, SessionStore, PreKeyStore, SenderKeyStore, AppStateSyncKeyStore, AppStateStore, ContactStore, ChatSettingsStore, MsgSecretStore, PrivacyTokenStore, LIDStore), aggregate interfaces, Device struct, SQLStore (SQLite/Postgres), and Signal protocol integration. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['interfaces', 'aggregates', 'device', 'sqlstore', 'signal', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getStoreTopic(topic ?? 'all')
      let text = `# Store Layer Reference (whatsmeow)\n\n`
      text += `${STORE_REFERENCE.overview}\n\n`

      if (data.interfaces) {
        text += `## Store Interfaces (${data.interfaces.length})\n\n`
        for (const iface of data.interfaces) {
          text += `### ${iface.name} (\`${iface.goType}\`)\n${iface.description}\n\n`
          text += `| Method | Signature | Description |\n|--------|-----------|-------------|\n`
          for (const m of iface.methods) {
            text += `| ${m.name} | \`${m.signature}\` | ${m.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.aggregates) {
        text += `## Aggregate Interfaces\n\n`
        for (const agg of data.aggregates) {
          text += `### ${agg.name}\n${agg.description}\n\nIncludes: ${agg.includes.join(', ')}\n\n`
        }
      }

      if (data.device) {
        text += `## Device Struct (\`${data.device.goType}\`)\n\n`
        text += `| Field | Type | Description |\n|-------|------|-------------|\n`
        for (const f of data.device.fields) {
          text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
        }
        text += '\n'
      }

      if (data.sqlstore) {
        text += `## SQLStore\n\n${data.sqlstore.description}\n\n`
        text += `**Constructor:** \`${data.sqlstore.constructor}\`\n\n`
        text += `**Supported dialects:**\n`
        for (const d of data.sqlstore.dialects) {
          text += `- ${d}\n`
        }
        text += `\n${data.sqlstore.upgradePattern}\n\n`
      }

      if (data.signalProtocol) {
        text += `## Signal Protocol\n\n${data.signalProtocol.description}\n\n`
        for (const s of data.signalProtocol.stores) {
          text += `- ${s}\n`
        }
        text += '\n'
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_history',
    {
      description:
        'History sync reference for whatsmeow: download flow (CDN → decrypt → zlib → protobuf), ParseWebMessage, BuildHistorySyncRequest, push name resolution, manual download mode, 7 history sync types (INITIAL_BOOTSTRAP, RECENT, FULL, ON_DEMAND, etc.), and HistorySync event. Use topic parameter to focus.',
      inputSchema: {
        topic: z
          .enum(['download', 'request', 'parsing', 'pushnames', 'types', 'events', 'manual', 'examples', 'all'] as const)
          .optional()
          .describe('Topic to focus on (default: all)'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => {
      const data = getHistoryTopic(topic ?? 'all')
      let text = `# History Sync Reference (whatsmeow)\n\n`
      text += `${HISTORY_REFERENCE.overview}\n\n`

      if (data.downloadFlow) {
        text += `## Download Flow\n\n`
        for (const s of data.downloadFlow.steps) {
          text += `**${s.step}.** ${s.description} — ${s.detail}\n\n`
        }
        text += `### Method\n\`\`\`go\n${data.downloadFlow.method.signature}\n\`\`\`\n${data.downloadFlow.method.description}\n\n`
      }

      if (data.requestFlow) {
        text += `## Request Flow\n\n`
        text += `\`\`\`go\n${data.requestFlow.method.signature}\n\`\`\`\n${data.requestFlow.method.description}\n\n`
        text += `${data.requestFlow.description}\n\n`
      }

      if (data.parsing) {
        text += `## Parsing\n\n`
        text += `\`\`\`go\n${data.parsing.method.signature}\n\`\`\`\n${data.parsing.method.description}\n\n`
        text += `${data.parsing.description}\n\n`
      }

      if (data.pushNames) {
        text += `## Push Names\n\n`
        text += `\`\`\`go\n${data.pushNames.method.signature}\n\`\`\`\n${data.pushNames.method.description}\n\n`
        text += `${data.pushNames.description}\n\n`
      }

      if (data.historySyncTypes) {
        text += `## History Sync Types\n\n`
        text += `| Type | Description |\n|------|-------------|\n`
        for (const t of data.historySyncTypes) {
          text += `| ${t.name} | ${t.description} |\n`
        }
        text += '\n'
      }

      if (data.events) {
        text += `## Events\n\n`
        for (const ev of data.events) {
          text += `### ${ev.name}\n${ev.description}\n\n| Field | Type | Description |\n|-------|------|-------------|\n`
          for (const f of ev.fields) {
            text += `| ${f.name} | \`${f.type}\` | ${f.description} |\n`
          }
          text += '\n'
        }
      }

      if (data.manualMode) {
        text += `## Manual Download Mode\n\n`
        text += `**Field:** \`${data.manualMode.field}\`\n\n${data.manualMode.description}\n\n`
      }

      if (data.loopHandler) {
        text += `## Loop Handler\n\n`
        text += `\`\`\`go\n${data.loopHandler.method.signature}\n\`\`\`\n${data.loopHandler.method.description}\n\n`
        text += `${data.loopHandler.description}\n\n`
      }

      if (data.codeExamples) {
        text += `## Code Examples\n\n`
        for (const ex of data.codeExamples) {
          text += `### ${ex.title}\n\`\`\`go\n${ex.code}\n\`\`\`\n\n`
        }
      }

      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
