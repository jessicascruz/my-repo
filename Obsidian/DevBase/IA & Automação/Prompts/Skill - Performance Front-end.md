# Performance Front-end

---

## name: app-performance-analyzer
description: >
Analyze Next.js + MUI frontend app performance — bundle size, SSR/CSR boundaries,
MUI tree-shaking, render bottlenecks, image optimization, and Core Web Vitals risks.
Use this skill whenever the user asks to analyze, audit, review, or improve the
performance of a Next.js or React app. Trigger on phrases like "analisa a performance",
"audita o app", "meu app está lento", "revisa o frontend", "otimiza o bundle",
"verifica o next.js", or any request involving performance, loading speed, bundle
weight, or frontend efficiency. Also trigger when the user asks Claude to run on a
Next.js project folder, even without explicitly mentioning performance.

# App Performance Analyzer — Next.js + MUI

Analyzes Next.js projects with Material UI for performance issues affecting bundle
size, server rendering, hydration, and Core Web Vitals (LCP, CLS, INP).

---

## Workflow

### 1. Discover the project structure

```bash
# Top-level layout
find . -maxdepth 3 \\( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \\
  -o -name "next.config.*" -o -name "package.json" -o -name "tsconfig.json" \\) \\
  ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" | sort

# File sizes (source files only)
find . -maxdepth 4 \\( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \\) \\
  ! -path "*/node_modules/*" ! -path "*/.next/*" \\
  -exec du -sh {} \\; | sort -rh | head -30
```

### 2. Read key files

Always read these if they exist:

- `package.json` — dependency versions, scripts
- `next.config.js` / `next.config.ts` — bundle config, image domains, experimental flags
- `_app.tsx` / `app/layout.tsx` — global providers, MUI theme setup
- Any `theme.ts` or `theme/` directory — MUI theme configuration

Then read the **5–10 largest source files** identified in step 1.

### 3. Check for `.next/` build output

```bash
# If a production build exists, check bundle sizes
ls .next/static/chunks/ 2>/dev/null | head -20
du -sh .next/static/chunks/*.js 2>/dev/null | sort -rh | head -10
```

If no build exists, note it and proceed with static analysis only.

### 4. Apply checks (see below) and produce the report.

---

## Checks

### Next.js configuration checks

- **`next.config` optimizations**: check for `swcMinify`, `reactStrictMode`,
`images.formats` (webp/avif), `compress: true`. Flag any missing.
- **Bundle analyzer**: check if `@next/bundle-analyzer` is in devDependencies. If not,
recommend adding it — it's the primary tool for finding bloat.
- **`experimental` flags**: flag deprecated or unstable flags that may affect build.
- **`output: 'export'`**: if set, SSR/ISR are disabled — flag any `getServerSideProps`
usage as incompatible.

### MUI-specific checks (highest impact)

- **Import style** — this is the #1 MUI performance issue:
    
    ```tsx
    // ❌ Barrel import — pulls entire MUI package into bundle
    import { Button, TextField } from '@mui/material'
    
    // ✅ Path import — only loads what's needed
    import Button from '@mui/material/Button'
    import TextField from '@mui/material/TextField'
    ```
    
    Scan all files for `from '@mui/material'` barrel imports. Count how many components
    are imported this way. Each barrel import can add 300–500 KB to the bundle.
    
- **`modularizeImports` in next.config**: check if it's configured to auto-convert
MUI barrel imports:
    
    ```jsx
    modularizeImports: {
      '@mui/material': { transform: '@mui/material/{{member}}' },
      '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
    }
    ```
    
    If absent and barrel imports exist, this is a 🔴 critical fix.
    
- **MUI Icons barrel imports**: `@mui/icons-material` is even heavier than
`@mui/material`. Flag any `from '@mui/icons-material'` that doesn't use path imports.
- **Theme in `_app` / `layout`**: check that `ThemeProvider` wraps the app only once
at the root, not inside individual pages or components.
- **`CssBaseline` placement**: should be inside `ThemeProvider`, not outside.
- **`sx` prop overuse**: `sx` props are evaluated at runtime. Extremely heavy use of
`sx` on list items rendered in large loops is a render bottleneck. Flag if found.
- **MUI version**: check `package.json` for `@mui/material` version. v5+ has better
tree-shaking than v4. Flag if on v4.

### Next.js rendering strategy checks

- **`'use client'` overuse (App Router)**: scan for `'use client'` at the top of files.
Each client boundary increases JS sent to browser. Flag components that don't use
hooks or browser APIs but are marked as client components.
- **`getServerSideProps` vs `getStaticProps`**: flag pages using `getServerSideProps`
that could use `getStaticProps` + ISR instead (better caching, lower TTFB).
- **Missing `Suspense` boundaries**: large client components without `<Suspense>` delay
the entire page render. Flag if absent around heavy components.
- **`next/dynamic` usage**: check if heavy components (charts, editors, modals) use
`dynamic(() => import(...), { ssr: false })`. If not, flag them.
- **`next/image` usage**: flag any `<img>` tags that should be `<Image>` from
`next/image` (automatic WebP, lazy loading, CLS prevention).
- **`next/font`**: check if Google Fonts are loaded via `next/font` (zero layout shift,
self-hosted). Flag if fonts are loaded via `<link>` in `_document` or via CSS instead.

### React performance checks

- **Missing `memo` / `useMemo` / `useCallback`**: in components that receive object or
array props and are rendered in lists, check for memoization. Flag components in
`.map()` calls that lack `React.memo`.
- **State updates in loops**: flag `setState` calls inside `forEach`/`map` — causes
multiple re-renders.
- **Context causing full re-renders**: if a large Context value holds an object that
changes frequently (e.g., theme + auth + data in one context), every consumer
re-renders. Flag monolithic context providers.
- **Key prop in lists**: flag `.map()` calls that use array index as key (`key={i}`).

### Bundle / dependency checks

From `package.json`:

- **Duplicate utility libraries**: e.g., both `lodash` and `lodash-es`, or both
`date-fns` and `moment`. Flag duplicates.
- **`moment.js`**: notoriously heavy (67 KB gzipped). Flag and recommend `date-fns` or
`dayjs`.
- **Unoptimized large dependencies**: check for `@emotion/react`, `@emotion/styled`
(required by MUI v5 — OK), but flag if both `styled-components` AND emotion are
present.
- **Dev dependencies in `dependencies`**: things like `eslint`, `prettier`, `jest`
should be in `devDependencies`.

---

## Report Format

Output the report in **Portuguese** using this structure:

```
# 📊 Análise de Performance — [Nome do Projeto]
**Stack:** Next.js [version] + MUI [version]

## Resumo Executivo
[2–3 frases sobre o estado geral e o maior risco de performance]

## 🔴 Problemas Críticos
[Direct bundle bloat, broken SSR, or paint-blocking issues]
- **[título]**: [descrição] → **Localização:** `arquivo:linha` → **Impacto:** [estimativa]

## 🟡 Melhorias Recomendadas
- **[título]**: [descrição] → **Localização:** `arquivo` → **Impacto esperado:** [estimativa]

## 🟢 Boas Práticas Encontradas
- ...

## 📦 Dependências Notáveis
| Pacote | Versão | Peso estimado | Status |
|--------|--------|---------------|--------|

## 📋 Maiores Arquivos Fonte
| Arquivo | Tamanho | Observação |
|---------|---------|------------|

## ✅ Próximos Passos Priorizados
1. [Highest impact fix — always start with MUI import style if relevant]
2. ...

## 🛠️ Comandos Úteis
[Relevant commands to run after fixes, e.g. bundle analyzer, build check]
```

---

## Scoring guide

| Severidade | Critério |
| --- | --- |
| 🔴 Crítico | Adiciona centenas de KB ao bundle, bloqueia o primeiro paint, ou quebra SSR |
| 🟡 Recomendado | Degrada LCP/INP/CLS mas não quebra a experiência |
| 🟢 OK | Segue boas práticas para o stack |

---

## Quick reference: MUI import fix

If barrel imports are found, always include this actionable fix in the report:

**Option A — Refactor imports manually** (most explicit):

```tsx
// Before
import { Button, TextField, Box } from '@mui/material'

// After
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
```

**Option B — Add `modularizeImports` to `next.config.js`** (automatic, zero refactor):

```jsx
/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
}
module.exports = nextConfig
```