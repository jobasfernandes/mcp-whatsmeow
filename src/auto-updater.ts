import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GITHUB_REPO = 'tulir/whatsmeow'
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`

function getDefaultWhatsmeowDir(): string {
  if (process.env.WHATSMEOW_PATH) {
    const customPath = path.resolve(process.env.WHATSMEOW_PATH)
    if (fs.existsSync(path.join(customPath, 'go.mod'))) return customPath
    return path.resolve(customPath, '..')
  }

  const localPath = path.resolve(__dirname, '../whatsmeow')
  if (fs.existsSync(path.join(localPath, 'go.mod'))) {
    return localPath
  }

  return path.join(os.homedir(), '.mcp-whatsmeow', 'whatsmeow')
}

const WHATSMEOW_DIR = getDefaultWhatsmeowDir()
const CACHE_DIR = path.join(os.homedir(), '.mcp-whatsmeow')
const CACHE_FILE = path.join(CACHE_DIR, '.last-commit-sha')

export function getWhatsmeowRepoPath(): string {
  return WHATSMEOW_DIR
}

export interface UpdateResult {
  updated: boolean
  previousSha?: string
  currentSha?: string
  commitMessage?: string
  commitDate?: string
  error?: string
}

export interface CommitInfo {
  sha: string
  message: string
  date: string
  author: string
}

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export function getLastSavedSha(): string | null {
  try {
    if (fs.existsSync(CACHE_FILE)) return fs.readFileSync(CACHE_FILE, 'utf-8').trim()
  } catch {
    return null
  }
  return null
}

export function saveSha(sha: string): void {
  try {
    ensureCacheDir()
    fs.writeFileSync(CACHE_FILE, sha, 'utf-8')
  } catch {
    // noop
  }
}

export async function fetchLatestCommit(): Promise<CommitInfo | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'mcp-whatsmeow-updater',
    }

    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`

    const response = await fetch(GITHUB_API_URL, { headers })
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)

    const commits = (await response.json()) as Array<{
      sha: string
      commit: { message: string; committer: { date: string }; author: { name: string } }
    }>

    if (!commits.length) return null

    return {
      sha: commits[0].sha,
      message: commits[0].commit.message.split('\n')[0],
      date: commits[0].commit.committer.date,
      author: commits[0].commit.author.name,
    }
  } catch {
    return null
  }
}

export function isGitRepository(): boolean {
  return fs.existsSync(path.join(WHATSMEOW_DIR, '.git'))
}

export function hasWhatsmeowRepo(): boolean {
  return fs.existsSync(path.join(WHATSMEOW_DIR, 'go.mod'))
}

export function cloneRepository(): boolean {
  try {
    const parent = path.dirname(WHATSMEOW_DIR)
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true })

    if (!fs.existsSync(WHATSMEOW_DIR)) {
      console.error('📥 Baixando repositório whatsmeow...')
      execSync(`git clone --depth 1 https://github.com/${GITHUB_REPO}.git "${WHATSMEOW_DIR}"`, {
        stdio: 'pipe',
      })
      console.error('✅ Repositório baixado com sucesso!')
      return true
    }

    return false
  } catch {
    return false
  }
}

export function pullRepository(): { success: boolean; output: string } {
  try {
    const output = execSync('git pull origin main', {
      cwd: WHATSMEOW_DIR,
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return { success: true, output }
  } catch (error) {
    return { success: false, output: error instanceof Error ? error.message : String(error) }
  }
}

export function getLocalCommitSha(): string | null {
  try {
    const sha = execSync('git rev-parse HEAD', {
      cwd: WHATSMEOW_DIR,
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return sha.trim()
  } catch {
    return null
  }
}

export async function ensureRepository(): Promise<{ success: boolean; path: string; error?: string }> {
  const repoPath = getWhatsmeowRepoPath()

  if (hasWhatsmeowRepo()) return { success: true, path: repoPath }

  console.error('🔍 Repositório whatsmeow não encontrado. Iniciando download...')
  const cloned = cloneRepository()

  if (cloned && hasWhatsmeowRepo()) {
    const sha = getLocalCommitSha()
    if (sha) saveSha(sha)
    return { success: true, path: repoPath }
  }

  return {
    success: false,
    path: repoPath,
    error: 'Falha ao baixar repositório. Verifique sua conexão e se o git está instalado.',
  }
}

export async function checkAndUpdate(): Promise<UpdateResult> {
  const repoStatus = await ensureRepository()
  if (!repoStatus.success) return { updated: false, error: repoStatus.error }
  if (!isGitRepository()) return { updated: false, error: 'Diretório não é um repositório git válido' }

  const latestCommit = await fetchLatestCommit()
  if (!latestCommit) return { updated: false, error: 'Não foi possível obter informações do GitHub' }

  const localSha = getLocalCommitSha()
  if (latestCommit.sha !== localSha) {
    const pull = pullRepository()
    if (!pull.success) return { updated: false, error: pull.output }

    saveSha(latestCommit.sha)
    return {
      updated: true,
      previousSha: localSha || getLastSavedSha() || undefined,
      currentSha: latestCommit.sha,
      commitMessage: latestCommit.message,
      commitDate: latestCommit.date,
    }
  }

  return {
    updated: false,
    currentSha: latestCommit.sha,
    commitMessage: 'Repositório já está atualizado',
  }
}

export async function checkForUpdates(): Promise<{ hasUpdate: boolean; currentSha?: string; latestSha?: string; latestCommit?: CommitInfo }> {
  const latestCommit = await fetchLatestCommit()
  const localSha = getLocalCommitSha()
  if (!latestCommit) return { hasUpdate: false }

  return {
    hasUpdate: latestCommit.sha !== localSha,
    currentSha: localSha || undefined,
    latestSha: latestCommit.sha,
    latestCommit,
  }
}

export function scheduleUpdateCheck(intervalMs = 60 * 60 * 1000, onUpdate?: (result: UpdateResult) => void): NodeJS.Timeout {
  return setInterval(async () => {
    const result = await checkAndUpdate()
    if (result.updated) onUpdate?.(result)
  }, intervalMs)
}

export async function getRepositoryStatus(): Promise<{
  isValid: boolean
  localSha?: string
  remoteSha?: string
  hasUpdates: boolean
  lastCheck: string
  repoPath: string
}> {
  const localSha = getLocalCommitSha()
  const latestCommit = await fetchLatestCommit()

  return {
    isValid: isGitRepository(),
    localSha: localSha || undefined,
    remoteSha: latestCommit?.sha,
    hasUpdates: latestCommit ? latestCommit.sha !== localSha : false,
    lastCheck: new Date().toISOString(),
    repoPath: WHATSMEOW_DIR,
  }
}

const NPM_REGISTRY_URL = 'https://registry.npmjs.org/mcp-whatsmeow/latest'

export interface PackageUpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  error?: string
}

export interface SelfUpdateResult {
  success: boolean
  previousVersion: string
  newVersion?: string
  method?: 'global' | 'npx-cache'
  error?: string
}

export async function checkPackageUpdate(currentVersion: string): Promise<PackageUpdateInfo> {
  try {
    const response = await fetch(NPM_REGISTRY_URL, {
      headers: { Accept: 'application/json', 'User-Agent': 'mcp-whatsmeow-updater' },
    })

    if (!response.ok) {
      return { hasUpdate: false, currentVersion, error: `npm registry error: ${response.status}` }
    }

    const data = (await response.json()) as { version: string }
    const latestVersion = data.version
    const isNewer = compareVersions(latestVersion, currentVersion) > 0

    return { hasUpdate: isNewer, currentVersion, latestVersion }
  } catch (error) {
    return {
      hasUpdate: false,
      currentVersion,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let index = 0; index < Math.max(pa.length, pb.length); index++) {
    const na = pa[index] || 0
    const nb = pb[index] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

function detectInstallMethod(): 'global' | 'npx' | 'local' {
  const execPath = process.argv[1] || ''
  if (execPath.includes('.npm/_npx') || execPath.includes('npx-')) return 'npx'
  if (execPath.includes('node_modules/.bin') || execPath.includes('npm/bin')) return 'global'
  return 'local'
}

export async function selfUpdate(currentVersion: string): Promise<SelfUpdateResult> {
  const check = await checkPackageUpdate(currentVersion)
  if (!check.hasUpdate) {
    return {
      success: true,
      previousVersion: currentVersion,
      newVersion: currentVersion,
      error: 'Já está na versão mais recente.',
    }
  }

  const method = detectInstallMethod()
  if (method === 'global') {
    try {
      execSync('npm install -g mcp-whatsmeow@latest', { stdio: 'pipe', timeout: 60000 })
      return {
        success: true,
        previousVersion: currentVersion,
        newVersion: check.latestVersion,
        method: 'global',
      }
    } catch (error) {
      return {
        success: false,
        previousVersion: currentVersion,
        error: `Falha ao atualizar globalmente: ${error instanceof Error ? error.message : String(error)}.`,
      }
    }
  }

  try {
    execSync('npx --yes clear-npx-cache 2>/dev/null || true', { stdio: 'pipe', timeout: 30000 })
  } catch {
    // noop
  }

  return {
    success: true,
    previousVersion: currentVersion,
    newVersion: check.latestVersion,
    method: 'npx-cache',
  }
}

export function schedulePackageUpdateCheck(currentVersion: string, intervalMs = 24 * 60 * 60 * 1000): NodeJS.Timeout {
  return setInterval(async () => {
    const check = await checkPackageUpdate(currentVersion)
    if (check.hasUpdate) {
      console.error(`\n⚠️  Nova versão do mcp-whatsmeow: v${check.latestVersion} (atual: v${check.currentVersion})`)
      console.error('   Atualize com: npm install -g mcp-whatsmeow@latest')
      console.error('   Ou use: npx mcp-whatsmeow@latest\n')
    }
  }, intervalMs)
}
