// Calcule, à partir des labels suggérés, des labels cochés et des labels
// actuellement présents sur la PR, ceux à ajouter et ceux à retirer.
//
// Règle (symétrique, limitée au périmètre des labels suggérés) :
// - ajouter   : un label coché qui n'est pas encore sur la PR
// - retirer   : un label suggéré NON coché qui est présent sur la PR
//   (on ne retire jamais un label hors de la liste suggérée, pour ne pas
//    toucher aux labels posés manuellement par un humain)
export function computeLabelChanges(
  suggested: string[],
  checked: string[],
  current: string[],
): { toAdd: string[]; toRemove: string[] } {
  const checkedSet = new Set(checked.map((l) => l.toLowerCase()));
  const currentSet = new Set(current.map((l) => l.toLowerCase()));
  const suggestedSet = new Set(suggested.map((l) => l.toLowerCase()));

  const toAdd = checked.filter((l) => !currentSet.has(l.toLowerCase()));

  const toRemove = current.filter(
    (l) =>
      suggestedSet.has(l.toLowerCase()) && !checkedSet.has(l.toLowerCase()),
  );

  return { toAdd, toRemove };
}
