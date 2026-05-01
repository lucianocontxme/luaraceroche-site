var _emailLgpd = sessionStorage.getItem('anamnese_email');

if (!_emailLgpd) {
  window.location.replace('/anamnese/login.html');
}

document.addEventListener('DOMContentLoaded', function() {
  var chk = document.getElementById('check-lgpd');
  var btn = document.getElementById('btn-aceitar');
  if (chk && btn) {
    chk.addEventListener('change', function() {
      btn.disabled = !this.checked;
    });
  }
});

function aceitar() {
  sessionStorage.setItem('anamnese_lgpd', '1');
  window.location.href = '/anamnese/';
}
