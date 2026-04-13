# Plan : Migration Node.js → Bun

## Contexte

Le projet est une statusline pour Claude Code, exécutée fréquemment dans le terminal. Bun offre un démarrage ~4x plus rapide que Node et exécute TypeScript nativement, ce qui permet de supprimer le build step et de simplifier le workflow. Zéro dépendance runtime, toutes les APIs Node utilisées (fs, path, child_process, process) sont compatibles Bun.

---

## Phase 1 — Package manager et scripts

**`package.json`** :
- Scripts : remplacer `tsx` par `bun`, supprimer build/clean/watch/copy-configs
  - `"dev"` → `"bun src/index.ts"`
  - `"debug"` → `"SAVE_INPUT=1 bun run dev"`
  - `"typecheck"` → `"tsc --noEmit"` (garder tsc pour le type checking uniquement)
  - Supprimer `"build"`, `"copy-configs"`, `"clean"`, `"watch"`
- DevDeps : supprimer `tsx`, ajouter `@types/bun`
- Supprimer `"main": "index.js"`, `"engines"`, `"packageManager"`

**`tsconfig.json`** :
- Supprimer `outDir` et `rootDir` (plus de compilation)
- Ajouter `"types": ["bun-types"]`

**`.claude/settings.json`** :
- `"command"` → `"bun src/index.ts"`

**Supprimer** : `.nvmrc`, `pnpm-lock.yaml`
**Exécuter** : `bun install` pour générer `bun.lock`

---

## Phase 2 — Renommer node-version → runtime-version

Le plugin `node-version` utilise `process.version` qui retourne la version Bun sous Bun. Le renommer et détecter le runtime dynamiquement.

**`src/plugins/node-version/` → `src/plugins/runtime-version/`**

**`src/plugins/runtime-version/index.ts`** :
- Détecter le runtime via `typeof Bun !== 'undefined'`
- Bun : utiliser `Bun.version`, préfixe "Bun:"
- Node : utiliser `process.version`, préfixe "Node:"
- Renommer `name` → `'runtime-version'`

**`src/plugins/runtime-version/default.json`** :
- `"name"` → `"runtime-version"`, supprimer le prefix (généré dynamiquement)

**`config.json.example`** : mettre à jour la référence si elle existe

---

## Phase 3 — Cleanup

- Supprimer `dist/` entièrement (actuellement commité)
- Supprimer `scripts/copy-plugin-default-configs.js`
- **`.gitignore`** : ajouter `dist/`, supprimer le commentaire "dist/ is committed", ajouter `bun.lock` ou non selon préférence
- **`CLAUDE.md`** : mettre à jour les commandes et les notes de build

---

## Ce qui NE change PAS

- `src/index.ts` — stdin/process/fs APIs compatibles Bun
- `src/lib/plugin-manager.ts` — les imports dynamiques `.js` sont résolus vers `.ts` par Bun
- Tous les autres plugins (directory, git, claude-tokens, claude-version)
- `src/lib/constant.ts`, `src/lib/merge.ts`, `src/types/plugin.ts`

---

## Vérification

1. `bun install` — pas d'erreur
2. `echo '{}' | bun src/index.ts` — affiche la statusline
3. `bun run typecheck` — pas d'erreur TypeScript
4. Tester dans Claude Code : relancer une session et vérifier que la statusline s'affiche correctement
5. Vérifier que le plugin runtime-version affiche "Bun: x.x.x"

---

## Fichiers impactés (Option A)

| Action | Fichier |
|--------|---------|
| Modifier | `package.json` |
| Modifier | `tsconfig.json` |
| Modifier | `.claude/settings.json` |
| Modifier | `.gitignore` |
| Modifier | `CLAUDE.md` |
| Renommer + Modifier | `src/plugins/node-version/` → `src/plugins/runtime-version/` |
| Supprimer | `dist/` |
| Supprimer | `scripts/copy-plugin-default-configs.js` |
| Supprimer | `.nvmrc` |
| Supprimer | `pnpm-lock.yaml` |
| Générer | `bun.lock` |

---
---

# Option B — Migration légère (Bun comme runtime uniquement)

## Contexte

Approche moins invasive : garder le build `tsc` et `dist/` en place, simplement remplacer `node` par `bun` comme runtime. Le `dist/` compilé reste la version "stable" utilisée par la statusline, ce qui évite qu'une édition en cours dans `src/` casse la statusline en live.

**Gain** : startup ~4x plus rapide, suppression de `tsx` en dev.
**Conservé** : build pipeline, `dist/`, `scripts/copy-plugin-default-configs.js`.

---

## Changements

**`package.json`** :
- `"dev"` → `"bun src/index.ts"` (remplace `tsx`)
- `"debug"` → `"SAVE_INPUT=1 bun run dev"`
- `"build"` → inchangé (`tsc` + copy-configs)
- DevDeps : supprimer `tsx`, ajouter `@types/bun`
- Supprimer `"engines"`, `"packageManager"`

**`tsconfig.json`** :
- Ajouter `"types": ["bun-types"]`
- Garder `outDir` et `rootDir` (build toujours actif)

**`.claude/settings.json`** :
- `"command"` → `"bun dist/index.js"` (au lieu de `node dist/index.js`)

**`scripts/copy-plugin-default-configs.js`** :
- Inchangé (toujours nécessaire pour copier les `default.json` dans `dist/`)

**Supprimer** : `.nvmrc`, `pnpm-lock.yaml`
**Exécuter** : `bun install` pour générer `bun.lock`

**Phase 2 (node-version → runtime-version)** : identique à l'Option A.

---

## Fichiers impactés (Option B)

| Action | Fichier |
|--------|---------|
| Modifier | `package.json` |
| Modifier | `tsconfig.json` |
| Modifier | `.claude/settings.json` |
| Modifier | `CLAUDE.md` |
| Renommer + Modifier | `src/plugins/node-version/` → `src/plugins/runtime-version/` |
| Supprimer | `.nvmrc` |
| Supprimer | `pnpm-lock.yaml` |
| Générer | `bun.lock` |

**Non touché** : `dist/`, `scripts/`, `.gitignore`, build pipeline
