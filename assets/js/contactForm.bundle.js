// Script do formulário de contato (bundle clássico)
// Responsável por validar, mascarar e enviar dados para a API
(function(){
  // Remove espaços e garante string
  function sanitize(str){return String(str||'').trim();}
  // Validação simples de e-mail
  function isValidEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);}
  // Monta URL base da API com fallback
  function resolveUrl(path){
    var base=(window.__ENV&&window.__ENV.API_BASE_URL)||'http://localhost:9000';
    var normBase=base.replace(/\/$/,'');
    return normBase+path;
  }
  // Envia dados do formulário para endpoint da API
  async function postContactMessage(payload){
    var url = resolveUrl('/contact/messages');
    console.debug('POST', url);
    var res;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var timeoutId;
    if(controller){ timeoutId = setTimeout(function(){ controller.abort(); }, 10000); }
    try{
      res = await fetch(url, {
        method: 'POST',
        headers: {'Accept':'application/json','Content-Type':'application/json'},
        body: JSON.stringify(payload),
        signal: signal
      });
    }catch(err){
      if(err && err.name === 'AbortError'){
        console.error('Request aborted (timeout)');
        throw new Error('Request timed out');
      }
      console.error('Network error', err);
      throw new Error('Network error');
    }finally{
      if(timeoutId) clearTimeout(timeoutId);
    }
    console.debug('Response status', res.status);
    var contentType = (res && res.headers && res.headers.get) ? (res.headers.get('content-type') || '') : '';
    var text = '';
    try{ text = await res.text(); }catch(_){ text = ''; }
    if(!res.ok){
      var errMsg = text || res.statusText || ('HTTP ' + res.status);
      if(contentType.indexOf('application/json') !== -1){
        try{ var parsedErr = JSON.parse(text); if(parsedErr && parsedErr.message) errMsg = parsedErr.message; }catch(_){ }
      }
      throw new Error(errMsg);
    }
    if(contentType.indexOf('application/json') !== -1){
      try{return JSON.parse(text);}catch(_){return null;}
    }
    return text || null;
  }
  // Inicializa eventos e validações do formulário
  function init(){
    var form=document.getElementById('contact-lead-form');
    if(!form) return;
    var statusEl=form.querySelector('.form-status');
    var submitBtn=form.querySelector('button[type="submit"]');
    var phoneInput=document.getElementById('lf-phone');
    // Atualiza mensagem de status (erro/sucesso)
    function setStatus(message,type){
      if(!statusEl) return;
      statusEl.textContent=message||'';
      statusEl.classList.remove('status-error','status-success');
      if(type==='error') statusEl.classList.add('status-error');
      if(type==='success') statusEl.classList.add('status-success');
    }
    // Aplica estilo de erro no campo
    function applyError(input,on){if(!input) return; input.classList.toggle('input-error',!!on);}    
    // Máscara para telefone no padrão (XX) XXXXX-XXXX
    function maskPhone(value){
      var digits=String(value||'').replace(/\D/g,'').slice(0,11);
      var parts=[];
      if(digits.length>0) parts.push('('+digits.slice(0,2)+') ');
      if(digits.length>=7){parts.push(digits.slice(2,7)+'-'+digits.slice(7,11));}
      else if(digits.length>2){parts.push(digits.slice(2));}
      return parts.join('');
    }
    phoneInput&&phoneInput.addEventListener('input',function(e){var v=maskPhone(e.target.value); e.target.value=v;});
    // Envio do formulário com validação
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      var fullName=sanitize(document.getElementById('lf-name')&&document.getElementById('lf-name').value);
      var email=sanitize(document.getElementById('lf-email')&&document.getElementById('lf-email').value);
      var phoneRaw=sanitize(document.getElementById('lf-phone')&&document.getElementById('lf-phone').value);
      var phoneDigits=phoneRaw.replace(/\D/g,'');
      var phone=phoneRaw;
      var message=sanitize(document.getElementById('lf-message')&&document.getElementById('lf-message').value);
      var consent=!!(document.getElementById('lf-consent')&&document.getElementById('lf-consent').checked);
      var hasError=false;
      applyError(document.getElementById('lf-name'),false);
      applyError(document.getElementById('lf-email'),false);
      applyError(document.getElementById('lf-phone'),false);
      applyError(document.getElementById('lf-message'),false);
      if(!fullName||fullName.length<3){applyError(document.getElementById('lf-name'),true); hasError=true;}
      if(!email||!isValidEmail(email)){applyError(document.getElementById('lf-email'),true); hasError=true;}
      if(!phoneDigits||phoneDigits.length!==11){applyError(document.getElementById('lf-phone'),true); hasError=true;}
      if(!message||message.length<5){applyError(document.getElementById('lf-message'),true); hasError=true;}
      if(!consent){hasError=true;}
      if(hasError){setStatus('Verifique os campos e aceite o consentimento.','error'); return;}
      submitBtn&&submitBtn.setAttribute('disabled','true');
      setStatus('Enviando...','');
      try{
        var payload={full_name:fullName,email:email,phone:phone,message:message,consent:consent};
        await postContactMessage(payload);
        setStatus('Mensagem enviada com sucesso!','success');
        form.reset();
      }catch(err){
        setStatus('Falha ao enviar. Tente novamente.','error');
        console.error(err);
      }finally{
        submitBtn&&submitBtn.removeAttribute('disabled');
      }
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);} else {init();}
})();
