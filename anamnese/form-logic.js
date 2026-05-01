// ---- Escala de 0 a 10 ----
let scaleProntidao = null;
let scaleCrenca = null;

function criarEscala(containerId, varRef) {
  const container = document.getElementById(containerId);
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scale-btn';
    btn.textContent = i;
    btn.dataset.value = i;
    btn.addEventListener('click', function() {
      container.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
    container.appendChild(btn);
  }
}

function getScaleValue(containerId) {
  const selected = document.querySelector('#' + containerId + ' .scale-btn.selected');
  return selected ? selected.dataset.value : '';
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked'))
    .map(el => el.value).join(', ');
}

function getCheckboxValues(ids) {
  return ids.filter(id => {
    const el = document.getElementById(id);
    return el && el.checked;
  }).map(id => document.getElementById(id).value).join(', ');
}

function showToast(text, type) {
  const t = document.getElementById('toast');
  t.className = 'toast ' + type;
  t.innerHTML = text;
  t.style.display = 'block';
  t.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- Pre-fill email e saudação ----
document.addEventListener('DOMContentLoaded', () => {
  criarEscala('scale-prontidao');
  criarEscala('scale-crenca');

  const email = sessionStorage.getItem('anamnese_email') || '';
  const nome = sessionStorage.getItem('anamnese_nome') || '';

  document.getElementById('email_display').value = email;

  if (nome) {
    document.getElementById('intro-nome').textContent = ', ' + nome.split(' ')[0];
    document.getElementById('nome-sucesso').textContent = nome.split(' ')[0];
  } else {
    document.getElementById('nome-sucesso').textContent = '';
  }
});

// ---- Envio do formulário ----
async function enviarFormulario() {
  const btn = document.getElementById('btn-submit');

  // Validações obrigatórias
  const nome = document.getElementById('nome_completo').value.trim();
  const dataNasc = document.getElementById('data_nascimento').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const motivo = document.getElementById('motivo_consulta').value.trim();
  const dificuldades = document.getElementById('dificuldades').value.trim();

  if (!nome) { showToast('Por favor, informe seu <strong>nome completo</strong>.', 'error'); document.getElementById('nome_completo').focus(); return; }
  if (!dataNasc) { showToast('Por favor, informe sua <strong>data de nascimento</strong>.', 'error'); document.getElementById('data_nascimento').focus(); return; }
  if (!whatsapp) { showToast('Por favor, informe seu <strong>WhatsApp</strong>.', 'error'); document.getElementById('whatsapp').focus(); return; }
  if (!motivo) { showToast('Por favor, preencha o <strong>motivo da consulta</strong>.', 'error'); document.getElementById('motivo_consulta').focus(); return; }
  if (!dificuldades) { showToast('Por favor, preencha o campo <strong>maiores dificuldades</strong>.', 'error'); document.getElementById('dificuldades').focus(); return; }

  btn.disabled = true;
  showToast('<span class="spinner"></span>Enviando seu formulário…', 'loading');

  const dados = {
    action: 'submitAnamnese',
    email: sessionStorage.getItem('anamnese_email') || '',
    nome_completo: nome,
    data_nascimento: dataNasc,
    whatsapp: whatsapp,
    profissao: document.getElementById('profissao').value.trim(),
    estado_civil: document.getElementById('estado_civil').value,
    cidade_estado: document.getElementById('cidade_estado').value.trim(),
    moradia: getCheckedValues('moradia'),
    como_encontrou: getCheckedValues('encontrou'),
    historico_familiar: getCheckboxValues(['d1','d2','d3','d4','d5','d6']),
    diagnostico: document.getElementById('diagnostico').value.trim(),
    medicamentos: document.getElementById('medicamentos').value.trim(),
    menstruacao: document.getElementById('menstruacao').value.trim(),
    intestino: getCheckedValues('intestino'),
    fuma: getCheckedValues('fuma'),
    alcool: getCheckedValues('alcool'),
    sono: document.getElementById('sono').value.trim(),
    atividade_fisica: document.getElementById('atividade_fisica').value.trim(),
    motivo_consulta: motivo,
    fator_vida: document.getElementById('fator_vida').value.trim(),
    dificuldades: dificuldades,
    expectativas: document.getElementById('expectativas').value.trim(),
    refeicoes_dia: document.getElementById('refeicoes_dia').value,
    tempo_refeicao: document.getElementById('tempo_refeicao').value,
    agua: getCheckedValues('agua'),
    liquidos: getCheckboxValues(['liq1','liq2','liq3','liq4','liq5','liq6']),
    come_por_emocao: getCheckboxValues(['em1','em2','em3','em4','em5','em6','em7','em8','em9']),
    comportamentos: getCheckboxValues(['c1','c2','c3','c4','c5','c6','c7','c8']),
    ja_fez_dieta: getCheckedValues('ja_fez_dieta'),
    tipos_dieta: getCheckboxValues(['tp1','tp2','tp3','tp4','tp5','tp6']),
    relacao_comida: document.getElementById('relacao_comida').value.trim(),
    alimento_descontrolado: document.getElementById('alimento_descontrolado').value.trim(),
    apos_proibido: getCheckboxValues(['ap1','ap2','ap3','ap4','ap5']),
    frequencia_pensamentos: getCheckedValues('pensamento'),
    experiencia_profissionais: document.getElementById('experiencia_profissionais').value.trim(),
    usa_injecao: getCheckedValues('usa_injecao'),
    qual_injecao: document.getElementById('qual_injecao').value.trim(),
    efeitos_injecao: getCheckboxValues(['ef1','ef2','ef3','ef4','ef5','ef6','ef7']),
    emocional_injecao: document.getElementById('emocional_injecao').value.trim(),
    altura_atual: document.getElementById('altura_atual').value.trim(),
    peso_atual: document.getElementById('peso_atual').value.trim(),
    peso_maximo: document.getElementById('peso_maximo').value.trim(),
    peso_minimo: document.getElementById('peso_minimo').value.trim(),
    peso_desejado: document.getElementById('peso_desejado').value.trim(),
    frequencia_peso: document.getElementById('frequencia_peso').value,
    perda_peso_recente: document.getElementById('perda_peso_recente').value.trim(),
    sensacao_corpo: document.getElementById('sensacao_corpo').value.trim(),
    por_que_agora: document.getElementById('por_que_agora').value.trim(),
    escala_prontidao: getScaleValue('scale-prontidao'),
    escala_crenca: getScaleValue('scale-crenca'),
    observacoes_finais: document.getElementById('observacoes_finais').value.trim()
  };

  try {
    const params = new URLSearchParams(dados);
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'omit'
    });
    const result = await resp.json();

    if (result.success) {
      // Exibe tela de sucesso
      document.getElementById('form-content').style.display = 'none';
      const s = document.getElementById('success-screen');
      s.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      sessionStorage.removeItem('anamnese_email');
      sessionStorage.removeItem('anamnese_nome');
    } else {
      showToast('Erro: ' + (result.error || 'Erro ao enviar. Tente novamente.'), 'error');
      btn.disabled = false;
    }
  } catch (err) {
    showToast('Erro de conexao. Verifique sua internet e tente novamente.', 'error');
    btn.disabled = false;
  }
}
