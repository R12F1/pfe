Set-Location "c:\Users\mehdi\OneDrive\Desktop\pfe"
$ErrorActionPreference = "Continue"

$MEHDI   = "Mehdi"
$MEHDI_M = "mehdi.yassin.1@ens.etsmtl.ca"
$TALIP   = "Talip Koyluoglu"
$TALIP_M = "talip.koyluoglu.1@ens.etsmtl.ca"
$SRC     = "backup-avant-reecriture"

Write-Host "=== Branche orphan ===" -ForegroundColor Cyan
git branch -D new-clean-history 2>$null
git checkout --orphan new-clean-history
git rm -rf . --quiet 2>$null
Write-Host "ok"

function Commit-Step {
    param(
        [string]$authorName,
        [string]$authorEmail,
        [string]$coName,
        [string]$coEmail,
        [string]$title,
        [string]$refs,
        [string[]]$paths
    )
    Write-Host ("  -> " + $title) -ForegroundColor Yellow
    foreach ($p in $paths) {
        git checkout $SRC -- $p 2>$null
    }
    git add -A
    $env:GIT_AUTHOR_NAME     = $authorName
    $env:GIT_AUTHOR_EMAIL    = $authorEmail
    $env:GIT_COMMITTER_NAME  = $authorName
    $env:GIT_COMMITTER_EMAIL = $authorEmail
    $co = "Co-authored-by: " + $coName + " <" + $coEmail + ">"
    if ($refs) {
        git commit -m $title -m $refs -m $co
    } else {
        git commit -m $title -m $co
    }
}

Write-Host "=== Commit 1 ===" -ForegroundColor Cyan
Commit-Step $MEHDI $MEHDI_M $TALIP $TALIP_M `
    "chore: setup initial du projet et configuration" "Refs #10" `
    @("package.json","tsconfig.json","vitest.config.ts",".gitignore",".env.example","README.md")

Write-Host "=== Commit 2 ===" -ForegroundColor Cyan
Commit-Step $TALIP $TALIP_M $MEHDI $MEHDI_M `
    "feat: configurer le point d entree et les evenements GitHub App" "Refs #11" `
    @("src/index.ts","src/server.ts","app.yml")

Write-Host "=== Commit 3 ===" -ForegroundColor Cyan
Commit-Step $MEHDI $MEHDI_M $TALIP $TALIP_M `
    "feat: implementer la lecture des donnees PR avec Octokit" "Refs #12" `
    @("src/github/pr-reader.ts","src/github/pr-fetcher.ts","src/domain")

Write-Host "=== Commit 4 ===" -ForegroundColor Cyan
Commit-Step $TALIP $TALIP_M $MEHDI $MEHDI_M `
    "feat: publier et mettre a jour le commentaire automatique de PR" "Refs #13" `
    @("src/github/pr-commenter.ts","src/comments")

Write-Host "=== Commit 5 ===" -ForegroundColor Cyan
Commit-Step $MEHDI $MEHDI_M $TALIP $TALIP_M `
    "feat: integrer le LLM Groq avec selection intelligente des fichiers" "Refs #16" `
    @("src/llm")

Write-Host "=== Commit 6 ===" -ForegroundColor Cyan
Commit-Step $TALIP $TALIP_M $MEHDI $MEHDI_M `
    "feat: orchestrer le handler principal des evenements PR" "Refs #17" `
    @("src/handlers/pull-request-handler.ts")

Write-Host "=== Commit 7 ===" -ForegroundColor Cyan
Commit-Step $MEHDI $MEHDI_M $TALIP $TALIP_M `
    "feat: implementer la logique des labels et les modes d application" "Refs #18" `
    @("src/labels")

Write-Host "=== Commit 8 ===" -ForegroundColor Cyan
Commit-Step $TALIP $TALIP_M $MEHDI $MEHDI_M `
    "feat: ajouter le Check Run interactif avec boutons d action" "Refs #19" `
    @("src/github/check-run.ts","src/handlers/check-run-handler.ts")

Write-Host "=== Commit 9 ===" -ForegroundColor Cyan
Commit-Step $MEHDI $MEHDI_M $TALIP $TALIP_M `
    "test: ajouter la suite complete de tests unitaires" "Refs #14" `
    @("test")

Write-Host "=== Commit 10 ===" -ForegroundColor Cyan
Commit-Step $TALIP $TALIP_M $MEHDI $MEHDI_M `
    "feat: gerer les cases a cocher et finaliser la documentation" "Refs #19" `
    @("src/handlers/comment-handler.ts","src/utils","scripts","docs")

Write-Host "=== Commit 11 ===" -ForegroundColor Cyan
Commit-Step $MEHDI $MEHDI_M $TALIP $TALIP_M `
    "chore: ajouter CI, templates GitHub et fichiers projet" "" `
    @("package-lock.json","eslint.config.js","LICENSE","CONTRIBUTING.md","CODE_OF_CONDUCT.md",".github")

Write-Host ""
Write-Host "=== Historique ===" -ForegroundColor Green
git log --pretty=format:"%h | %an | %s"

Write-Host ""
Write-Host ""
Write-Host "=== DIFF vs backup ===" -ForegroundColor Green
$diff = git diff $SRC HEAD
if ($diff) {
    Write-Host "DIFF NON VIDE — FICHIERS MANQUANTS :" -ForegroundColor Red
    Write-Host $diff
    exit 1
} else {
    Write-Host "Diff vide — OK pour Phase 4" -ForegroundColor Green
}
