export const dedupe = <T>(list: readonly T[], id: (t: T) => string) => {
  const seen = new Set<string>();

  return list.filter((l) => {
    const i = id(l);
    if (seen.has(i)) {
      return false;
    } else {
      seen.add(i);
      return true;
    }
  });
};
