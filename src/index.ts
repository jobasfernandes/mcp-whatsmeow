#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createRequire } from 'node:module'
import {
  ensureRepository,
  checkForUpdates,
  scheduleUpdateCheck,
  checkPackageUpdate,
  schedulePackageUpdateCheck,
} from './auto-updater.js'
import { registerAstTools } from './tools/ast-tools.js'
import { registerRepoTools, registerResources } from './tools/repo-tools.js'
import { registerContentTools } from './tools/content-tools.js'

const require = createRequire(import.meta.url)
const APP_VERSION = (require('../package.json') as { version?: string }).version ?? '0.0.0'

const AUTO_UPDATE_INTERVAL = parseInt(process.env.AUTO_UPDATE_INTERVAL || '3600000', 10)
const AUTO_UPDATE_ENABLED = process.env.AUTO_UPDATE_ENABLED !== 'false'

const mcpServer = new McpServer(
  {
    name: 'mcp-whatsmeow',
    version: APP_VERSION,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
)

async function main() {
  const repoResult = await ensureRepository()
  if (!repoResult.success) {
    console.error(`❌ ${repoResult.error}`)
    process.exit(1)
  }

  const repoPath = repoResult.path
  console.error(`📁 Usando WhatsMeow: ${repoPath}`)

  registerAstTools(mcpServer, repoPath)
  registerRepoTools(mcpServer, repoPath, APP_VERSION)
  registerContentTools(mcpServer, repoPath)
  registerResources(mcpServer, repoPath)

  const transport = new StdioServerTransport()
  await mcpServer.connect(transport)
  console.error(`MCP WhatsMeow server v${APP_VERSION} running on stdio`)

  if (AUTO_UPDATE_ENABLED) {
    const initialCheck = await checkForUpdates()
    if (initialCheck.hasUpdate) {
      console.error(`⚠️ Atualização do repositório disponível: ${initialCheck.latestCommit?.message}`)
    }
    scheduleUpdateCheck(AUTO_UPDATE_INTERVAL)
  }

  const packageCheck = await checkPackageUpdate(APP_VERSION)
  if (packageCheck.hasUpdate) {
    console.error(`\n⚠️  Nova versão do mcp-whatsmeow: v${packageCheck.latestVersion} (atual: v${APP_VERSION})`)
    console.error('   Atualize: npm install -g mcp-whatsmeow@latest\n')
  }
  schedulePackageUpdateCheck(APP_VERSION)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
