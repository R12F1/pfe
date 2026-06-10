# Taxonomie des labels — Version 1

Cette taxonomie définit l'ensemble fermé de labels que le LLM pourra suggérer à partir de l'itération 2. Chaque label a une définition opérationnelle claire pour permettre une annotation cohérente lors de l'évaluation (itération 3).

## Labels supportés

### `bug`

Corrige un comportement incorrect dans le code existant.

**Exemples positifs** :
- Une PR titrée "Fix null pointer when user has no profile"
- Une PR qui modifie une condition incorrecte dans un calcul

**Exemples négatifs** :
- Une PR qui ajoute une nouvelle fonctionnalité (c'est `feature`)
- Une PR qui refactore sans changer de comportement (c'est `refactor`)

### `feature`

Ajoute une nouvelle fonctionnalité visible par l'utilisateur final.

**Exemples positifs** :
- Ajout d'un nouvel endpoint API
- Ajout d'une nouvelle commande CLI

**Exemples négatifs** :
- Restructuration interne qui ne change pas le comportement (c'est `refactor`)

### `refactor`

Modifie la structure interne du code sans changer le comportement attendu.

**Exemples positifs** :
- Extraction d'une fonction réutilisable
- Renommage de variables, suppression de duplication

**Exemples négatifs** :
- Changement de comportement même mineur (c'est `feature` ou `bug`)

### `documentation`

Modifie principalement la documentation (README, docs, commentaires explicatifs).

**Exemples positifs** :
- Mise à jour du README
- Ajout de JSDoc

**Exemples négatifs** :
- PR qui modifie du code et incidemment un commentaire (label principal = type du code)

### `tests`

Ajoute ou modifie principalement des tests.

**Exemples positifs** :
- PR qui ajoute uniquement de nouveaux tests unitaires
- PR qui refactore la suite de tests

**Exemples négatifs** :
- PR de fix de bug avec un test de régression : label principal = `bug`, pas `tests`

### `ci-cd`

Modifie les pipelines, GitHub Actions, build ou déploiement.

**Exemples positifs** :
- Ajout d'un workflow GitHub Actions
- Modification du Dockerfile

### `dependencies`

Modifie les dépendances, package manager ou fichiers lockfile.

**Exemples positifs** :
- Bump d'une version dans `package.json`
- Migration entre gestionnaires de paquets

### `performance`

Améliore la vitesse, la mémoire, ou optimise l'utilisation de ressources.

**Exemples positifs** :
- Remplacement d'un algorithme O(n²) par O(n log n)
- Mise en cache d'un calcul coûteux

### `security`

Touche à l'authentification, l'autorisation, les secrets, ou des vulnérabilités.

**Exemples positifs** :
- Patch d'une CVE
- Renforcement d'une validation de token

### `breaking-change`

Introduit un changement non rétrocompatible.

**Exemples positifs** :
- Suppression d'un endpoint d'API public
- Renommage d'une option de configuration

## Règles d'annotation pour l'évaluation

1. **Maximum 3 labels par PR** : prioriser l'intention principale.
2. **Si tests présents en support d'un bug fix** : label principal = `bug`, ne pas ajouter `tests` sauf si les tests sont une partie majeure du changement (> 30 % du diff).
3. **Si plusieurs intentions** : l'annotateur choisit selon le titre + description, puis confirme avec le diff.
4. **En cas de désaccord entre annotateurs** : discussion documentée, résolution par consensus.
5. **Si aucun label ne s'applique avec certitude** : ne pas annoter (cas valide).

## Évolution possible (post-MVP)

Les labels suivants pourraient être ajoutés selon les retours utilisateurs :
- `frontend`, `backend`, `api`, `database`, `infra`
- Niveaux de priorité : `priority/high`, `priority/medium`, `priority/low`
- Statuts : `needs-review`, `blocked`

Ces ajouts seront documentés dans `labels-taxonomy-v2.md` le cas échéant.
