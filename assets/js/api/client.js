// Monta URL completa com base no .env e fallback
function resolveUrl(path) {
  const base = (window.__ENV && window.__ENV.API_BASE_URL) || 'http://localhost:9000';
  const normBase = base.replace(/\/$/, '');
  return `${normBase}${path}`;
}

// Envia a mensagem de contato para a API
export async function postContactMessage(payload) {
  console.debug('POST /contact/messages', payload);
  const res = await fetch(resolveUrl('/contact/messages'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  console.debug('Response status', res.status);
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
