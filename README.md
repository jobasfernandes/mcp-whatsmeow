# MCP WhatsMeow Context

Servidor MCP (Model Context Protocol) para fornecer contexto completo da biblioteca [WhatsMeow](https://github.com/tulir/whatsmeow) (Go/WhatsApp) ao assistente de IA.

> O repositório `tulir/whatsmeow` é baixado automaticamente na primeira execução.

## Funcionalidades

Este servidor combina **análise de AST Go** com **knowledge base de domínio** para fornecer contexto completo sobre WhatsMeow/WhatsApp:

### Análise de AST (Go Parser)

- **Interfaces** - com campos e métodos
- **Structs** - com campos tipados e tags
- **Types** - type aliases e definições
- **Functions** - com parâmetros e retornos
- **Methods** - receivers e assinaturas
- **Constants** - iota, strings, erros comuns
- **Variables** - exportadas e configurações

### Domain Knowledge (v2.0)

- **16 knowledge bases** curadas com referência completa de tipos, métodos e padrões
- **waE2E Proto browser** para navegação dinâmica de 13.000+ tipos protobuf
- **40 code examples** de produção extraídos de API_WHATSMEOW
- **Guides** para media, groups, calls, chat e connection

## Ferramentas Disponíveis (38 tools)

### Ferramentas de AST

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_extrair_tipos` | Extrai declarações exportadas via AST |
| `whatsmeow_buscar_tipo` | Busca definição por nome exato |
| `whatsmeow_buscar_fuzzy` | Busca com correspondência aproximada |
| `whatsmeow_listar_exports` | Lista todos os exports agrupados por módulo e categoria |
| `whatsmeow_categorias` | Lista símbolos de uma categoria específica |
| `whatsmeow_constantes` | Lista constantes e variáveis exportadas |
| `whatsmeow_hierarquia` | Mostra relacionamentos de tipo (embedded/uso) |
| `whatsmeow_estatisticas` | Estatísticas detalhadas da biblioteca |
| `whatsmeow_dependencias` | Analisa dependências entre módulos/pacotes |
| `whatsmeow_interfaces` | Lista todas as interfaces exportadas |
| `whatsmeow_funcoes` | Lista funções e métodos exportados |

### Ferramentas de Conteúdo

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_buscar_contexto` | Busca semântica por tópico/domínio com ranking |
| `whatsmeow_resumo_modulo` | Resume um módulo com arquivos, categorias e símbolos-chave |
| `whatsmeow_topicos` | Mapa de tópicos práticos (pairing, events, message, media, etc.) |

### Ferramentas de Repositório

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_estrutura` | Lista a estrutura de arquivos da biblioteca |
| `whatsmeow_ler_arquivo` | Lê conteúdo de arquivo específico |
| `whatsmeow_check_updates` | Verifica atualizações no GitHub |
| `whatsmeow_update` | Atualiza o repositório local |
| `whatsmeow_status` | Mostra status atual do repositório |
| `whatsmeow_self_update` | Verifica/atualiza o pacote `mcp-whatsmeow` no npm |

### Ferramentas de Domínio

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_messages` | Referência completa de todos os tipos de mensagem (text, image, buttons, poll, etc.) com waE2E structs |
| `whatsmeow_interactive` | Estruturas de mensagens interativas (buttons, lists, templates) com AdditionalNodes e FutureProofMessage |
| `whatsmeow_jid` | Formatos JID/LID, JIDs especiais, funções utilitárias e migração `@lid` |
| `whatsmeow_events` | Sistema completo de 50+ eventos com Go struct types e categorias |

### Ferramentas de Referência

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_client_methods` | 60+ métodos do Client organizados por categoria (messaging, groups, media, etc.) |
| `whatsmeow_chat` | Operações de chat (presence, disappearing timers, broadcast, status) |
| `whatsmeow_connection` | Referência de conexão/autenticação (QR, PairPhone, Noise, reconnect, keepalive) |
| `whatsmeow_guides` | Guias completos para media, groups, calls e mappings |

### Ferramentas de Knowledge

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_newsletter` | Operações de newsletter/channel (14+ métodos, GraphQL IDs, tipos, enums) |
| `whatsmeow_privacy` | Configurações de privacidade, blocklist e disappearing timers |
| `whatsmeow_appstate` | App state sync (HKDF keys, patches, LTHash, builders, indices, conflitos) |
| `whatsmeow_media` | Handling de mídia (8 MediaTypes, E2E encryption, CDN, upload/download) |
| `whatsmeow_groups` | Gerenciamento de grupos (22+ métodos, communities, permissões) |
| `whatsmeow_store` | Store/persistência (11 interfaces, sqlstore, Signal protocol, Device) |
| `whatsmeow_history` | History sync (download, zlib, message parsing, push names) |

### Ferramentas waE2E Proto

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_proto` | Navega/busca tipos proto waE2E (13.000+ declarações em categorias) |
| `whatsmeow_proto_type` | Definição completa de um tipo proto (fields, docs, nested types) |

### Ferramentas de Examples

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_examples` | 40 code examples de produção (senders, sessions, events, media, groups, connection, advanced) |

## Categorias Suportadas

```
interface   - Interfaces Go
struct      - Structs Go
type        - Type aliases
function    - Funções exportadas
method      - Métodos com receivers
const       - Constantes (iota, valores)
variable    - Variáveis exportadas
```

## Instalação

### Opção 1: Via npx (recomendado)

```json
{
  "servers": {
    "whatsmeow-context": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-whatsmeow"]
    }
  }
}
```

### Opção 2: Instalação global

```bash
npm install -g mcp-whatsmeow
```

```json
{
  "servers": {
    "whatsmeow-context": {
      "type": "stdio",
      "command": "mcp-whatsmeow"
    }
  }
}
```

### Opção 3: Repositório local

```bash
git clone https://github.com/jobasfernandes/mcp-whatsmeow.git
cd mcp-whatsmeow
npm install
npm run build
```

```json
{
  "servers": {
    "whatsmeow-context": {
      "type": "stdio",
      "command": "node",
      "args": ["d:/caminho/para/mcp-whatsmeow/dist/index.js"]
    }
  }
}
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `WHATSMEOW_PATH` | Caminho para o repositório WhatsMeow (raiz com `go.mod`) | Auto-download em `~/.mcp-whatsmeow/` |
| `AUTO_UPDATE_ENABLED` | Habilita verificação automática de atualizações | `true` |
| `AUTO_UPDATE_INTERVAL` | Intervalo de verificação em ms | `3600000` (1 hora) |
| `GITHUB_TOKEN` | Token do GitHub para evitar rate limiting | - |

## Exemplos de Uso

### Extrair tipos de um módulo

```javascript
whatsmeow_extrair_tipos({ modulo: "types" })
whatsmeow_extrair_tipos({ modulo: "proto", apenas_kind: "struct" })
```

### Buscar tipo específico

```javascript
whatsmeow_buscar_tipo({ nome: "Client" })
whatsmeow_buscar_tipo({ nome: "SendMessageParams" })
```

### Busca fuzzy e semântica

```javascript
whatsmeow_buscar_fuzzy({ query: "send message" })
whatsmeow_buscar_contexto({ query: "qr pairing", limite: 10 })
```

### Resumo e tópicos

```javascript
whatsmeow_resumo_modulo({ modulo: "root", destaque: 15 })
whatsmeow_topicos({ topico: "newsletter" })
```

### Consultar tipos de mensagem

```javascript
whatsmeow_messages()
whatsmeow_messages({ type: "buttons" })
whatsmeow_messages({ category: "interactive" })
```

### Mensagens interativas

```javascript
whatsmeow_interactive()
whatsmeow_interactive({ type: "buttons" })
whatsmeow_interactive({ type: "list" })
```

### Sistema de eventos

```javascript
whatsmeow_events()
whatsmeow_events({ category: "appstate" })
whatsmeow_events({ event: "Message" })
```

### Referência JID/LID

```javascript
whatsmeow_jid()
whatsmeow_jid({ topic: "lid" })
whatsmeow_jid({ topic: "utilities" })
```

### Métodos do Client

```javascript
whatsmeow_client_methods()
whatsmeow_client_methods({ category: "messaging" })
whatsmeow_client_methods({ method: "SendMessage" })
```

### Guias de referência

```javascript
whatsmeow_guides({ topic: "media" })
whatsmeow_guides({ topic: "groups" })
whatsmeow_connection({ topic: "qr" })
whatsmeow_chat({ topic: "presence" })
```

### Knowledge especializado

```javascript
whatsmeow_newsletter()
whatsmeow_privacy({ topic: "blocklist" })
whatsmeow_appstate({ topic: "builders" })
whatsmeow_media({ topic: "encryption" })
whatsmeow_groups({ topic: "community" })
whatsmeow_store({ topic: "interfaces" })
whatsmeow_history({ topic: "download" })
```

### Navegar waE2E Proto

```javascript
whatsmeow_proto()
whatsmeow_proto({ category: "message" })
whatsmeow_proto({ search: "poll" })
whatsmeow_proto_type({ name: "InteractiveMessage" })
whatsmeow_proto_type({ name: "ImageMessage" })
```

### Code examples de produção

```javascript
whatsmeow_examples()
whatsmeow_examples({ category: "senders" })
whatsmeow_examples({ id: "send-buttons" })
whatsmeow_examples({ search: "sticker" })
```

### Estatísticas e análise

```javascript
whatsmeow_estatisticas()
whatsmeow_dependencias()
whatsmeow_hierarquia({ nome: "Client" })
```

## Recursos MCP

| URI | Descrição |
|-----|-----------|
| `whatsmeow://readme` | Documentação principal da biblioteca WhatsMeow |
| `whatsmeow://go-mod` | Arquivo go.mod do WhatsMeow |
| `whatsmeow://statistics` | Estatísticas completas da biblioteca |

## Tecnologias

- **@modelcontextprotocol/sdk** v1.26.0 - SDK oficial do MCP
- **Go AST Parser** - Parser regex-based para código Go
- **zod** v4.1.13 - Validação de schemas

## Desenvolvimento Local

```bash
npm install
npm run build
npm start
```
