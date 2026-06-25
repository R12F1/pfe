# Guide de contribution

Bienvenue dans l'équipe ! Ce document explique comment contribuer au projet `llm-pr-labeler`.

## Démarrer en local

### Prérequis

- Node.js 20+
- npm 10+
- Git
- Un compte GitHub avec accès au repo

### Installation

```bash
git clone https://github.com/<USERNAME>/llm-pr-labeler.git
cd llm-pr-labeler
npm install
```

### Premier démarrage : créer ta propre GitHub App de dev

Chaque membre de l'équipe doit créer sa **propre GitHub App** pour le développement (on ne partage pas les credentials).

```bash
npm start
```

Au premier lancement, Probot ouvre `http://localhost:3000` avec un wizard qui te guide pour :

1. Créer ta GitHub App dans ton compte personnel
2. Générer la clé privée (`.pem`)
3. Configurer Smee.io pour recevoir les webhooks en local
4. Écrire automatiquement le `.env`

**Ne ferme pas la fenêtre du navigateur** tant que le wizard n'a pas fini.

Une fois la GitHub App créée, va dans **Developer Settings → GitHub Apps → ton app → Permissions** et configure :

- `Metadata` : Read
- `Pull requests` : Read
- `Issues` : Read and write
- Events : `Pull request`

Puis installe ton app sur un repo de test (un repo perso où tu peux créer des PRs librement).

## Commandes utiles

| Commande | Action |
|---|---|
| `npm run dev` | Lance en mode watch (rechargement automatique sur changements TS) |
| `npm start` | Lance la version compilée |
| `npm run build` | Compile TypeScript vers `lib/` |
| `npm test` | Lance les tests Vitest |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run format` | Formate le code avec Prettier |

## Workflow de contribution

### 1. Créer une branche

Convention : `<type>/<courte-description>` ou `<type>/<ticket-id>-<description>`.

Exemples :
- `feature/llm-gemini-integration`
- `bug/upsert-comment-pagination`
- `refactor/extract-prompt-builder`

```bash
git checkout -b feature/ma-feature
```

### 2. Coder + tester

- Suis la structure existante : un fichier par responsabilité dans `src/`.
- Écris au moins **un test** par nouveau module ou fonction publique.
- Vérifie en local avant de pousser :

```bash
npm run lint && npm run build && npm test
```

### 3. Ouvrir une PR

- Utilise le template de PR (rempli automatiquement)
- Lie l'issue si pertinent (`Closes #X`)
- Demande une review à au moins **un autre membre** de l'équipe

### 4. Code review

- Le reviewer commente, l'auteur répond/corrige
- Pas de self-merge sans review

### 5. Merge

- Squash and merge sur `main`
- Supprimer la branche après merge

## Standards de code

### TypeScript

- Mode `strict` activé → pas de `any` implicite, pas de `null`/`undefined` non gérés
- Tous les exports doivent être typés explicitement
- Pas de variables inutilisées (ESLint level error)

### Tests

- Suite Vitest, fichiers en `test/`
- Chaque test doit avoir un nom explicite en français qui décrit le comportement attendu
- Utiliser `describe` / `it` / `expect`
- Mock Octokit avec `vi.fn()` pour les tests qui touchent l'API GitHub

### Commits

Convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

Types autorisés : `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `perf`, `style`.

Exemples :
- `feat(llm): add Gemini provider with structured output`
- `fix(commenter): handle paginated listComments response`
- `chore(deps): bump zod from 3.22.0 to 3.23.0`

## Architecture

Lire `docs/architecture-v1.md` pour comprendre les choix techniques et la roadmap.

## Sécurité

- **Ne JAMAIS** commit de secrets (`.env`, `*.pem`, clés API)
- En cas de fuite accidentelle : prévenir l'équipe immédiatement, révoquer le secret côté GitHub/fournisseur, puis nettoyer l'historique git si nécessaire
- Les permissions GitHub App suivent le principe de moindre privilège

## Questions ?

- Discussions techniques : ouvrir une issue avec le label `question`
- Bugs : utiliser le template "Bug report"
- Nouvelles features : utiliser le template "Feature request"
