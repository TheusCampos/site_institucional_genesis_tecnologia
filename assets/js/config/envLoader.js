// Parser simples de arquivo .env
function parseEnv(text) {
  const out = {};
  text.split(/\r?\n/).forEach((line) => {
    const l = line.trim();
    if (!l || l.startsWith('#')) return;
    const idx = l.indexOf('=');
    if (idx === -1) return;
    const key = l.slice(0, idx).trim();
    const val = l.slice(idx + 1).trim();
    out[key] = val;
  });
  return out;
}

// Evita fetch sob file:// e aplica fallback
const isFileProtocol = window.location.protocol === 'file:';
if (isFileProtocol) {
  window.__ENV = Object.assign({}, window.__ENV || {}, { API_BASE_URL: 'http://localhost:9000' });
} else {
  const envUrl = new URL('../../../.env', import.meta.url).href;
  fetch(envUrl, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : ''))
    .then((txt) => {
      const env = parseEnv(txt);
      window.__ENV = Object.assign({}, window.__ENV || {}, env);
    })
    .catch(() => {});
}
