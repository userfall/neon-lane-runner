export function isMobile() {
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

export function sanitizeKey(s) {
  if (!s) return "anon";
  return String(s).replace(/[.#$\[\]\/]/g, "_");
}

export function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR");
}
