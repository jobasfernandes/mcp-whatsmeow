# MCP WhatsMeow Context

Servidor MCP (Model Context Protocol) para fornecer contexto completo da biblioteca [WhatsMeow](https://github.com/tulir/whatsmeow) (Go/WhatsApp).

> O repositório `tulir/whatsmeow` é baixado automaticamente na primeira execução.

## Funcionalidades

Este servidor implementa extração e indexação de código Go para mapear símbolos exportados, incluindo:

- **Interfaces**
- **Structs**
- **Types**
- **Functions**
- **Methods**
- **Constants**
- **Variables**

Também inclui busca semântica contextual, resumo por módulo, mapa de tópicos, estatísticas e ferramentas de atualização.

## Ferramentas Disponíveis

### Ferramentas Básicas

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_estrutura` | Lista a estrutura de arquivos do projeto |
| `whatsmeow_ler_arquivo` | Lê conteúdo de arquivo específico |
| `whatsmeow_extrair_tipos` | Extrai declarações exportadas |
| `whatsmeow_buscar_tipo` | Busca definição por nome exato |
| `whatsmeow_buscar_fuzzy` | Busca com correspondência aproximada |
| `whatsmeow_buscar_contexto` | Busca semântica por tópico/domínio com ranking |
| `whatsmeow_listar_exports` | Lista todos os exports agrupados |
| `whatsmeow_resumo_modulo` | Resume um módulo com arquivos, categorias e símbolos-chave |
| `whatsmeow_topicos` | Mapa de tópicos práticos (pairing, events, message, media, etc.) |

### Ferramentas por Categoria

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_categorias` | Lista declarações de categoria específica |
| `whatsmeow_interfaces` | Lista todas as interfaces |
| `whatsmeow_funcoes` | Lista funções e métodos |
| `whatsmeow_constantes` | Lista constantes e variáveis |

### Ferramentas de Análise

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_estatisticas` | Estatísticas detalhadas da biblioteca |
| `whatsmeow_hierarquia` | Mostra relacionamentos de tipo |
| `whatsmeow_dependencias` | Analisa imports/exports entre módulos |

### Ferramentas de Auto-Update

| Ferramenta | Descrição |
|------------|-----------|
| `whatsmeow_check_updates` | Verifica atualizações no GitHub |
| `whatsmeow_update` | Atualiza o repositório local |
| `whatsmeow_status` | Mostra status atual do repositório |
| `whatsmeow_self_update` | Verifica/atualiza o pacote `mcp-whatsmeow` no npm |

## Categorias Suportadas

```
interface
struct
type
function
method
const
variable
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

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `WHATSMEOW_PATH` | Caminho para o repositório WhatsMeow (raiz com `go.mod`) | Auto-download em `~/.mcp-whatsmeow/` |
| `AUTO_UPDATE_ENABLED` | Habilita verificação automática de atualizações | `true` |
| `AUTO_UPDATE_INTERVAL` | Intervalo de verificação em ms | `3600000` (1 hora) |
| `GITHUB_TOKEN` | Token do GitHub para evitar rate limiting | - |

## Exemplos de Uso

```javascript
whatsmeow_extrair_tipos({ modulo: "types" })
whatsmeow_buscar_tipo({ nome: "Client" })
whatsmeow_buscar_fuzzy({ query: "send message" })
whatsmeow_buscar_contexto({ query: "qr pairing", limite: 10 })
whatsmeow_resumo_modulo({ modulo: "root", destaque: 15 })
whatsmeow_topicos({ topico: "newsletter" })
```

## Desenvolvimento Local

```bash
npm install
npm run build
npm start
```
