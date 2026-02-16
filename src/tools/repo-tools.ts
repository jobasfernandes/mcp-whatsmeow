import { z } from 'zod'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { AstParser } from '../ast-parser.js'
import {
  checkAndUpdate,
  checkForUpdates,
  getRepositoryStatus,
  checkPackageUpdate,
  selfUpdate,
} from '../auto-updater.js'
import { getDirectoryTree, formatStatistics } from '../formatters.js'

export function registerRepoTools(mcpServer: McpServer, repoPath: string, appVersion: string) {
  mcpServer.registerTool(
    'whatsmeow_estrutura',
    {
      description: 'Lista a estrutura de arquivos da biblioteca WhatsMeow (Go).',
      inputSchema: {
        subpasta: z.string().optional().describe('Subpasta específica (ex: types, store, socket).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ subpasta }) => {
      const targetPath = subpasta ? path.join(repoPath, subpasta) : repoPath

      if (!fs.existsSync(targetPath)) {
        return {
          content: [{ type: 'text' as const, text: `❌ Pasta não encontrada: ${subpasta || 'root'}` }],
          isError: true,
        }
      }

      const tree = getDirectoryTree(targetPath)
      return {
        content: [{
          type: 'text' as const,
          text: `# 📁 Estrutura de ${subpasta || 'whatsmeow'}\n\n\`\`\`\n${tree}\`\`\``,
        }],
      }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_ler_arquivo',
    {
      description: 'Lê o conteúdo de um arquivo específico da biblioteca WhatsMeow.',
      inputSchema: {
        caminho: z.string().describe('Caminho relativo dentro do repositório (ex: client.go, types/events.go).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ caminho }) => {
      const fullPath = path.join(repoPath, caminho)

      if (!fs.existsSync(fullPath)) {
        return {
          content: [{ type: 'text' as const, text: `❌ Arquivo não encontrado: ${caminho}` }],
          isError: true,
        }
      }

      const content = fs.readFileSync(fullPath, 'utf-8')
      return {
        content: [{
          type: 'text' as const,
          text: `# 📄 ${caminho}\n\n\`\`\`go\n${content}\n\`\`\``,
        }],
      }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_check_updates',
    {
      description: 'Verifica se há atualizações disponíveis no repositório oficial do WhatsMeow (GitHub).',
      annotations: { readOnlyHint: true },
    },
    async () => {
      const updateInfo = await checkForUpdates()

      let result = '# 🔍 Verificação de Atualizações\n\n'

      if (updateInfo.hasUpdate) {
        result += '⚠️ **Atualização disponível!**\n\n'
        result += `**Commit local:** \`${updateInfo.currentSha?.substring(0, 7) || 'N/A'}\`\n`
        result += `**Commit remoto:** \`${updateInfo.latestSha?.substring(0, 7) || 'N/A'}\`\n\n`

        if (updateInfo.latestCommit) {
          result += '**Último commit:**\n'
          result += `- Mensagem: ${updateInfo.latestCommit.message}\n`
          result += `- Autor: ${updateInfo.latestCommit.author}\n`
          result += `- Data: ${updateInfo.latestCommit.date}\n\n`
        }

        result += '> Use `whatsmeow_update` para atualizar o repositório.\n'
      } else {
        result += '✅ **Repositório está atualizado!**\n\n'
        result += `**Commit atual:** \`${updateInfo.currentSha?.substring(0, 7) || 'N/A'}\`\n`
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_update',
    {
      description: 'Atualiza o repositório local do WhatsMeow para a versão mais recente do GitHub.',
      annotations: { readOnlyHint: false, idempotentHint: true },
    },
    async () => {
      const updateResult = await checkAndUpdate()

      let result = '# 🔄 Atualização do Repositório\n\n'

      if (updateResult.updated) {
        result += '✅ **Repositório atualizado com sucesso!**\n\n'
        if (updateResult.previousSha) result += `**De:** \`${updateResult.previousSha.substring(0, 7)}\`\n`
        result += `**Para:** \`${updateResult.currentSha?.substring(0, 7) || 'N/A'}\`\n\n`

        if (updateResult.commitMessage) result += `**Commit:** ${updateResult.commitMessage}\n`
        if (updateResult.commitDate) result += `**Data:** ${updateResult.commitDate}\n`
      } else if (updateResult.error) {
        result += '❌ **Erro ao atualizar:**\n\n'
        result += `\`\`\`\n${updateResult.error}\n\`\`\`\n`
      } else {
        result += '✅ **Já está na versão mais recente!**\n\n'
        result += `**Commit atual:** \`${updateResult.currentSha?.substring(0, 7) || 'N/A'}\`\n`
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_status',
    {
      description: 'Mostra o status atual do repositório local: SHA, sincronização e caminho.',
      annotations: { readOnlyHint: true },
    },
    async () => {
      const status = await getRepositoryStatus()

      let result = '# 📊 Status do Repositório WhatsMeow\n\n'
      result += `**Repositório válido:** ${status.isValid ? '✅ Sim' : '❌ Não'}\n`
      result += `**Caminho:** \`${status.repoPath}\`\n\n`
      result += `**Commit local:** \`${status.localSha?.substring(0, 7) || 'N/A'}\`\n`
      result += `**Commit remoto:** \`${status.remoteSha?.substring(0, 7) || 'N/A'}\`\n\n`

      if (status.hasUpdates) {
        result += '⚠️ **Há atualizações disponíveis!**\n\n'
        result += '> Use `whatsmeow_update` para atualizar.\n'
      } else {
        result += '✅ **Repositório está sincronizado com o GitHub.**\n'
      }

      result += `\n**Última verificação:** ${status.lastCheck}\n`

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  mcpServer.registerTool(
    'whatsmeow_self_update',
    {
      description: 'Verifica e atualiza o próprio pacote mcp-whatsmeow para a versão mais recente do npm.',
      annotations: { readOnlyHint: false, idempotentHint: true },
    },
    async () => {
      const check = await checkPackageUpdate(appVersion)

      if (!check.hasUpdate) {
        return {
          content: [{
            type: 'text' as const,
            text: `# ✅ mcp-whatsmeow está atualizado!\n\n**Versão atual:** v${appVersion}\n**Última versão no npm:** v${check.latestVersion || appVersion}\n`,
          }],
        }
      }

      let result = '# 🔄 Atualizando mcp-whatsmeow\n\n'
      result += `**Versão atual:** v${appVersion}\n`
      result += `**Nova versão:** v${check.latestVersion}\n\n`

      const updateResult = await selfUpdate(appVersion)

      if (updateResult.success && updateResult.method === 'global') {
        result += '✅ **Atualizado com sucesso!**\n\n'
        result += `O pacote foi atualizado de v${updateResult.previousVersion} para v${updateResult.newVersion}.\n`
        result += '\n> ⚠️ Reinicie o MCP server para usar a nova versão.\n'
      } else if (updateResult.success && updateResult.method === 'npx-cache') {
        result += '✅ **Cache do npx limpo!**\n\n'
        result += `Na próxima execução via \`npx mcp-whatsmeow\`, a versão v${updateResult.newVersion} será baixada automaticamente.\n`
        result += '\n> 💡 Para garantir, use: `npx mcp-whatsmeow@latest`\n'
      } else {
        result += '❌ **Erro ao atualizar:**\n\n'
        result += `\`\`\`\n${updateResult.error}\n\`\`\`\n\n`
        result += '**Atualize manualmente:**\n'
        result += '- Global: `npm install -g mcp-whatsmeow@latest`\n'
        result += '- NPX: `npx mcp-whatsmeow@latest`\n'
      }

      return { content: [{ type: 'text' as const, text: result }] }
    },
  )
}

export function registerResources(mcpServer: McpServer, repoPath: string) {
  mcpServer.registerResource(
    'WhatsMeow README',
    'whatsmeow://readme',
    { description: 'Documentação principal da biblioteca WhatsMeow', mimeType: 'text/markdown' },
    async (uri) => {
      const readmePath = path.join(repoPath, 'README.md')
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8')
        return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: content }] }
      }
      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'README not found' }] }
    },
  )

  mcpServer.registerResource(
    'Go Mod',
    'whatsmeow://go-mod',
    { description: 'Arquivo go.mod do WhatsMeow', mimeType: 'text/plain' },
    async (uri) => {
      const goModPath = path.join(repoPath, 'go.mod')
      if (fs.existsSync(goModPath)) {
        const content = fs.readFileSync(goModPath, 'utf-8')
        return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: content }] }
      }
      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'go.mod not found' }] }
    },
  )

  mcpServer.registerResource(
    'Library Statistics',
    'whatsmeow://statistics',
    { description: 'Estatísticas completas da biblioteca', mimeType: 'text/markdown' },
    async (uri) => {
      const parser = new AstParser(repoPath)
      const stats = parser.getStatistics()
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: formatStatistics(stats) }] }
    },
  )
}
