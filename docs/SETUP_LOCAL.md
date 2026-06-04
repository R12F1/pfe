# Setup local — étapes manuelles requises

Ces étapes doivent être faites par chaque membre de l'équipe sur sa propre machine.

## 1. Cloner le repo et installer

```bash
git clone https://github.com/<TON_USERNAME>/llm-pr-labeler.git
cd llm-pr-labeler
npm install
```

## 2. Wizard Probot interactif (au premier démarrage)

```bash
npm start
```

Au premier lancement, Probot ouvre `http://localhost:3000` avec un wizard qui :

1. Te guide pour créer la GitHub App dans ton compte GitHub
2. Génère automatiquement la clé privée (`.pem`)
3. Génère le webhook secret
4. Configure Smee.io pour recevoir les webhooks en local
5. Écrit le `.env` automatiquement

**Ne ferme pas la page web tant que le wizard n'a pas fini.**

## 3. Vérifier les permissions de la GitHub App

Va dans **Developer Settings → GitHub Apps → ton app → Permissions** et vérifie :

| Permission | Niveau |
|---|---|
| Metadata | Read |
| Pull requests | Read |
| Issues | Read and write |

**Events à activer** : `Pull request`

## 4. Installer l'app sur un repo de test

Depuis la page publique de ton app GitHub, clic **Install** → choisir un repo de test (que tu contrôles, où tu peux créer des PRs librement).

## 5. Tester en local

```bash
npm run dev
```

Ouvre une PR dans ton repo de test. Tu dois voir :

1. Dans les logs : "Processing pull request event"
2. Dans la PR sur GitHub : un commentaire automatique avec le marker `<!-- llm-pr-labeler -->`

## 6. Validation end-to-end

Vérifie ces 8 points :

- [ ] `npm run dev` démarre sans erreur
- [ ] `npm run build` compile sans erreur
- [ ] `npm test` passe (tous les tests verts)
- [ ] La GitHub App est installée sur le repo de test
- [ ] Ouvrir une PR sur le repo test → commentaire apparaît automatiquement
- [ ] Pousser un commit sur la PR → commentaire mis à jour, **pas dupliqué**
- [ ] Modifier le titre de la PR → commentaire mis à jour
- [ ] Le `.env` et les `*.pem` ne sont **jamais** commit dans Git
