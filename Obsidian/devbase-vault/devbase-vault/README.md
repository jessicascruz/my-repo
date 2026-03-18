# DevBase Vault

Base de conhecimento técnica pessoal no Obsidian.

## Estrutura

| Pasta | O que guardar |
|-------|---------------|
| `Erros & Soluções` | Bugs resolvidos, erros de configuração, problemas de ambiente |
| `Arquiteturas & Decisões` | ADRs, escolhas de stack, decisões de design |
| `IA & Automação` | Prompts úteis, fluxos com IA, experimentos |
| `Snippets` | Trechos de código reutilizáveis |
| `Workflows` | Processos repetitivos documentados |
| `Diário Técnico` | Entradas diárias livres |
| `_templates` | Templates — não editar diretamente |
| `_inbox` | Entrada rápida sem categoria — organizar depois |

## Plugins recomendados

- **Templater** — ativa os templates com data automática
- **Dataview** — consultas nas notas via frontmatter
- **Omnisearch** — busca semântica avançada
- **QuickAdd** — cria entradas com atalho de teclado

## Consultas Dataview úteis

### Erros não resolvidos
```dataview
TABLE tecnologia, ambiente, data
FROM "Erros & Soluções"
WHERE resolvido = false
SORT data DESC
```

### Prompts de IA que funcionam bem
```dataview
TABLE modelo, tarefa, data
FROM "IA & Automação"
WHERE categoria = "ia" AND funciona-bem = true
SORT data DESC
```

### Entradas desta semana
```dataview
TABLE categoria, file.folder
WHERE date(data) >= date(today) - dur(7 days)
SORT data DESC
```

### Snippets por linguagem
```dataview
TABLE linguagem, data
FROM "Snippets"
SORT linguagem ASC
```
