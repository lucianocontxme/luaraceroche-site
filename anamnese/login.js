const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtu7HYWC-GSdsgE7h2PTVY91Vffn_tjPoQ9WFXIGOA2jhORVYfGua_z5g3yLuWVMthyA/exec';

const emailInput = document.getElementById('email');
const btn = document.getElementById('btn-entrar');
const msgEl = document.getElementById('msg');

function showMsg(text, type) {
  msgEl.className = 'msg ' + type;
  msgEl.innerHTML = text;
  msgEl.style.display = 'block';
}

function hideMsg() {
  msgEl.style.display = 'none';
}

async function verificarEmail() {
  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    showMsg('Por favor, informe o seu e-mail.', 'error');
    emailInput.focus();
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showMsg('Por favor, informe um e-mail válido.', 'error');
    emailInput.focus();
    return;
  }

  btn.disabled = true;
  showMsg('<span class="spinner"></span>Verificando acesso…', 'loading');

  try {
    const url = APPS_SCRIPT_URL + '?action=checkEmail&email=' + encodeURIComponent(email);
    const resp = await fetch(url, { credentials: 'omit' });
    const data = await resp.json();

    if (data.authorized) {
      sessionStorage.setItem('anamnese_email', email);
      sessionStorage.setItem('anamnese_nome', data.nome || '');
      showMsg('✓ Acesso liberado! Redirecionando…', 'loading');
      setTimeout(() => {
        window.location.href = '/anamnese/';
      }, 800);
    } else {
      showMsg(
        '<strong>E-mail não encontrado.</strong><br>' +
        'Verifique se digitou corretamente ou entre em contato com a Luara para solicitar seu acesso.',
        'error'
      );
      btn.disabled = false;
      emailInput.focus();
    }
  } catch (err) {
    showMsg(
      '<strong>Erro de conexão.</strong><br>' +
      'Não foi possível verificar seu acesso. Por favor, tente novamente.',
      'error'
    );
    btn.disabled = false;
  }
}

emailInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') verificarEmail();
});

btn.addEventListener('click', verificarEmail);
