const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtu7HYWC-GSdsgE7h2PTVY91Vffn_tjPoQ9WFXIGOA2jhORVYfGua_z5g3yLuWVMthyA/exec';

var _email = sessionStorage.getItem('anamnese_email');

if (!_email) {
  window.location.replace('/anamnese/login.html');
} else if (!sessionStorage.getItem('anamnese_lgpd')) {
  window.location.replace('/anamnese/lgpd.html');
}
