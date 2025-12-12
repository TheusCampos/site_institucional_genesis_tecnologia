// Formulário de contato (versão ESM para páginas que usam módulos)
import { postContactMessage } from '../api/client.js';
import { sanitize, isValidEmail } from '../utils/validation.js';

// Inicializa eventos e validações do formulário
function init() {
  const form = document.getElementById('contact-lead-form');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const phoneInput = document.getElementById('lf-phone');

  // Atualiza mensagem de status para o usuário
  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.classList.remove('status-error', 'status-success');
    if (type === 'error') statusEl.classList.add('status-error');
    if (type === 'success') statusEl.classList.add('status-success');
  }

  // Marca/Desmarca campo como inválido
  function applyError(input, on) {
    if (!input) return;
    input.classList.toggle('input-error', !!on);
  }

  // Aplica máscara de telefone (XX) XXXXX-XXXX
  function maskPhone(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    const parts = [];
    if (digits.length > 0) parts.push('(' + digits.slice(0, 2) + ') ');
    if (digits.length >= 7) {
      parts.push(digits.slice(2, 7) + '-' + digits.slice(7, 11));
    } else if (digits.length > 2) {
      parts.push(digits.slice(2));
    }
    return parts.join('');
  }

  phoneInput?.addEventListener('input', (e) => {
    const v = maskPhone(e.target.value);
    e.target.value = v;
  });

  // Envia formulário com validações
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = sanitize(document.getElementById('lf-name')?.value);
    const email = sanitize(document.getElementById('lf-email')?.value);
    const phoneRaw = sanitize(document.getElementById('lf-phone')?.value);
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    const phone = phoneRaw;
    const message = sanitize(document.getElementById('lf-message')?.value);
    const consent = !!document.getElementById('lf-consent')?.checked;

    let hasError = false;
    applyError(document.getElementById('lf-name'), false);
    applyError(document.getElementById('lf-email'), false);
    applyError(document.getElementById('lf-phone'), false);
    applyError(document.getElementById('lf-message'), false);

    if (!fullName || fullName.length < 3) { applyError(document.getElementById('lf-name'), true); hasError = true; }
    if (!email || !isValidEmail(email)) { applyError(document.getElementById('lf-email'), true); hasError = true; }
    if (!phoneDigits || phoneDigits.length !== 11) { applyError(document.getElementById('lf-phone'), true); hasError = true; }
    if (!message || message.length < 5) { applyError(document.getElementById('lf-message'), true); hasError = true; }
    if (!consent) { hasError = true; }

    if (hasError) { setStatus('Verifique os campos e aceite o consentimento.', 'error'); return; }

    submitBtn?.setAttribute('disabled', 'true');
    setStatus('Enviando...', '');

    try {
      const payload = { full_name: fullName, email, phone, message, consent };
      await postContactMessage(payload);
      setStatus('Mensagem enviada com sucesso!', 'success');
      form.reset();
    } catch (err) {
      setStatus('Falha ao enviar. Tente novamente.', 'error');
      console.error(err);
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
