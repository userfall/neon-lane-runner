// Vérifie si mobile
export function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Nettoie clé pseudo
export function sanitizeKey(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "_");
}
