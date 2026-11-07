export function formatCategoryName(value) {
  if (typeof value !== "string") return "";

  const normalized = value.normalize("NFC").trim().replace(/\s+/g, " ");

  return normalized
    .toLocaleLowerCase("tr-TR")
    .replace(
      /(^|[\s\-\/(])(\p{L})/gu,
      (match, separator, letter) =>
        separator + letter.toLocaleUpperCase("tr-TR"),
    );
}

export function createCategorySlug(value) {
  return formatCategoryName(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
