export const BOT_COMMENT_MARKER = "<!-- llm-pr-labeler -->";
export const MAX_FILES_IN_COMMENT = 20;

// Nombre maximum de fichiers (les mieux scorés) dont le diff est envoyé au LLM.
// Valeur conservative pour respecter la limite TPM du tier gratuit Groq (6 000 tokens/min).
export const MAX_FILES_FOR_LLM = 6;

// Nombre maximum de lignes conservées par patch avant troncature.
export const MAX_PATCH_LINES_PER_FILE = 40;

// Taille maximale du résumé de tous les fichiers inclus dans le contexte.
export const MAX_ALL_FILES_SUMMARY = 100;
