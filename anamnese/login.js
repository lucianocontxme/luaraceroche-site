const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtu7HYWC-GSdsgE7h2PTVY91Vffn_tjPoQ9WFXIGOA2jhORVYfGua_z5g3yLuWVMthyA/exec';

const emailInput = document.getElementById('email');
const btn = document.getElementById('btn-entrar');
const msgEl = document.getElementById('msg');

function showMsg(text, type) {
  msgEl.className = 'msg ' + type;
  msgEl.innerHTML = text;
  msgEl.style.display = 'block';
}

async function verificarEmail() {
  var email = emailInput.value.trim().toLowerCase();

  if (!email) {
    showMsg('Por favor, informe o seu e-mail.', 'error');
    emailInput.focus();
    return;
  }

  if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    showMsg('Por favor, informe um e-mail valido.', 'error');
    emailInput.focus();
    return;
  }

  btn.disabled = true;
  showMsg('<span class="spinner"></span>Verificando acesso...', 'loading');

  try {
    var url = APPS_SCRIPT_URL + '?action=checkEmail&email=' + encodeURIComponent(email);
    var resp = await fetch(url, { credentials: 'omit' });
    var data = await resp.json();

    if (data.authorized) {
      sessionStorage.setItem('anamnese_email', email);
      sessionStorage.setItem('anamnese_nome', data.nome || '');
      sessionStorage.removeItem('anamnese_lgpd');
      showMsg('Acesso liberado! Redirecionando...', 'loading');
      setTimeout(function() {
        window.location.href = '/anamnese/lgpd.html';
      }, 800);
    } else {
      showMsg(
        '<strong>E-mail nao encontrado.</strong><br>' +
        'Verifique se digitou corretamente ou entre em contato com a Luara.',
        'error'
      );
      btn.disabled = false;
      emailInput.focus();
    }
  } catch (err) {
    showMsg(
      '<strong>Erro de conexao.</strong><br>' +
      'Nao foi possivel verificar seu acesso. Tente novamente.',
      'error'
    );
    btn.disabled = false;
  }
}

emailInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') verificarEmail();
});

btn.addEventListener('click', verificarEmail);
