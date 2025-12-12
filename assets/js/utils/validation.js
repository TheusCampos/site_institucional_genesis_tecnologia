// Remove espaços e garante string
export function sanitize(str) {
  return String(str || '').trim();
}

// Validação simples de e-mail
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
