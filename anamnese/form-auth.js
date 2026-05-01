// ⚠️ SUBSTITUA PELA URL DO SEU APPS SCRIPT APÓS IMPLANTAR
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtu7HYWC-GSdsgE7h2PTVY91Vffn_tjPoQ9WFXIGOA2jhORVYfGua_z5g3yLuWVMthyA/exec';

// Verifica se há email na sessão
const _email = sessionStorage.getItem('anamnese_email');
const _nome  = sessionStorage.getItem('anamnese_nome');

if (!_email) {
  // Sem email na sessão → redireciona para login
  window.location.replace('/anamnese/login.html');
}
