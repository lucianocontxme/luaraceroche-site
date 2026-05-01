// ⚠️ SUBSTITUA PELA URL DO SEU APPS SCRIPT APÓS IMPLANTAR
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtu7HYWC-GSdsgE7h2PTVY91Vffn_tjPoQ9WFXIGOA2jhORVYfGua_z5g3yLuWVMthyA/exec';

// ⚠️ Senha do painel — troque se quiser
const ADMIN_SENHA = 'Luara@2026';
const ADMIN_TOKEN = 'luara2026admin';

// ---- Estado ----
let anamnesesData = [];
let emailsData = [];

// ---- Login ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') fazerLogin();
  });

  // Auto-login se já estava logado
  if (sessionStorage.getItem('admin_logado') === '1') {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    carregarAnamneses();
    carregarEmails();
  }
});

function fazerLogin() {
  const senha = document.getElementById('senha').value;
  if (senha === ADMIN_SENHA) {
    sessionStorage.setItem('admin_logado', '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    carregarAnamneses();
    carregarEmails();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

function fazerLogout() {
  sessionStorage.removeItem('admin_logado');
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('senha').value = '';
}

// ---- Tabs ----
function trocarTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'anamneses') || (i === 1 && tab === 'emails'));
  });
  document.getElementById('tab-anamneses').style.display = tab === 'anamneses' ? 'block' : 'none';
  document.getElementById('tab-emails').style.display = tab === 'emails' ? 'block' : 'none';
}

// ---- Toast ----
function toast(msg, duration = 3000) {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ---- API call ----
async function api(params) {
  const url = APPS_SCRIPT_URL + '?' + new URLSearchParams({ ...params, token: ADMIN_TOKEN });
  const resp = await fetch(url, { credentials: 'omit' });
  return resp.json();
}

// ---- Formata timestamp ----
function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch { return str; }
}

// ---- Carrega anamneses ----
async function carregarAnamneses() {
  const tbody = document.getElementById('tabela-anamneses');
  tbody.innerHTML = '<tr class="loading-row"><td colspan="6"><span class="spinner" style="border-color:rgba(160,82,45,0.3);border-top-color:var(--terra)"></span>Carregando…</td></tr>';

  try {
    const result = await api({ action: 'listAnamneses' });
    if (!result.success) throw new Error(result.error);
    anamnesesData = result.data || [];
    document.getElementById('stat-total').textContent = anamnesesData.length;
    renderAnamneses(anamnesesData);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:30px;text-align:center;color:#8B3A1A">Erro ao carregar: ' + err.message + '</td></tr>';
  }
}

function renderAnamneses(data) {
  const tbody = document.getElementById('tabela-anamneses');
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="icon">📋</div>Nenhuma anamnese recebida ainda.</div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map((row, i) => `
    <tr onclick="abrirModal(${i})">
      <td>${formatDate(row['Timestamp'])}</td>
      <td><strong>${row['Nome Completo'] || '—'}</strong></td>
      <td>${row['Email'] || '—'}</td>
      <td>${row['WhatsApp'] || '—'}</td>
      <td>${truncate(row['Motivo da Consulta'], 50)}</td>
      <td><button style="background:var(--beige);border:1px solid var(--beige-dark);padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;color:var(--terra);font-family:DM Sans,sans-serif" onclick="event.stopPropagation();abrirModal(${i})">Ver →</button></td>
    </tr>
  `).join('');
}

function filtrarAnamneses() {
  const q = document.getElementById('search-anamnese').value.toLowerCase();
  if (!q) { renderAnamneses(anamnesesData); return; }
  const filtered = anamnesesData.filter(row =>
    (row['Nome Completo'] || '').toLowerCase().includes(q) ||
    (row['Email'] || '').toLowerCase().includes(q)
  );
  renderAnamneses(filtered);
}

function truncate(str, len) {
  if (!str) return '—';
  return str.length > len ? str.substring(0, len) + '…' : str;
}

// ---- Modal detalhes ----
function abrirModal(index) {
  const row = anamnesesData[index];
  if (!row) return;

  document.getElementById('modal-nome').textContent = row['Nome Completo'] || 'Detalhes';

  const sections = [
    { title: 'Dados Pessoais', fields: [
      ['E-mail', row['Email']],
      ['WhatsApp', row['WhatsApp']],
      ['Data de Nascimento', row['Data Nascimento']],
      ['Profissão', row['Profissão']],
      ['Estado Civil', row['Estado Civil']],
      ['Cidade/Estado', row['Cidade/Estado']],
      ['Moradia', row['Moradia']],
      ['Como Encontrou', row['Como Encontrou']],
    ]},
    { title: 'Saúde & Histórico', fields: [
      ['Histórico Familiar', row['Histórico Familiar']],
      ['Diagnóstico', row['Diagnóstico Clínico']],
      ['Medicamentos', row['Medicamentos/Suplementos']],
      ['Menstruação', row['Menstruação']],
      ['Intestino', row['Funcionamento Intestinal']],
      ['Fuma?', row['Fuma?']],
      ['Álcool?', row['Álcool?']],
      ['Sono', row['Sono']],
      ['Atividade Física', row['Atividade Física']],
    ]},
    { title: 'Motivo da Consulta', fields: [
      ['Motivo', row['Motivo da Consulta']],
      ['Fator de Vida', row['Fator de Vida']],
      ['Dificuldades', row['Dificuldades com Alimentação']],
      ['Expectativas', row['Expectativas']],
    ]},
    { title: 'Comportamento Alimentar', fields: [
      ['Refeições/Dia', row['Refeições por Dia']],
      ['Tempo/Refeição', row['Tempo por Refeição']],
      ['Água', row['Água por Dia']],
      ['Outros Líquidos', row['Outros Líquidos']],
      ['Come por Emoção', row['Come por Emoção']],
      ['Comportamentos', row['Comportamentos Alimentares']],
      ['Já Fez Dieta?', row['Já Fez Dieta?']],
      ['Tipos de Dieta', row['Tipos de Dieta']],
    ]},
    { title: 'Relação Emocional', fields: [
      ['Relação c/ Comida', row['Relação com a Comida']],
      ['Alimento Descontrolado', row['Alimento Descontrolado']],
      ['Após Proibido', row['Após Comer Proibido']],
      ['Frequência Pensamentos', row['Frequência de Pensamentos']],
      ['Experiência c/ Profissionais', row['Experiência com Profissionais']],
    ]},
    { title: 'Injeções Emagrecedoras', fields: [
      ['Usa Injeção?', row['Usa Injeção?']],
      ['Qual Injeção', row['Qual Injeção']],
      ['Efeitos', row['Efeitos da Injeção']],
      ['Emocional', row['Emocional — Injeção']],
    ]},
    { title: 'Histórico de Peso', fields: [
      ['Altura', row['Altura']],
      ['Peso Atual', row['Peso Atual']],
      ['Peso Máximo', row['Peso Máximo']],
      ['Peso Mínimo', row['Peso Mínimo']],
      ['Peso Desejado', row['Peso Desejado']],
      ['Frequência Pesagem', row['Frequência de Pesagem']],
      ['Perda Recente', row['Perda de Peso Recente']],
      ['Sensação no Corpo', row['Sensação no Corpo']],
    ]},
    { title: 'Motivação & Expectativas', fields: [
      ['Por Que Agora', row['Por Que Agora']],
      ['Escala Prontidão', row['Escala Prontidão (0-10)']],
      ['Escala Crença', row['Escala Crença (0-10)']],
      ['Observações Finais', row['Observações Finais']],
    ]},
  ];

  let html = '';
  sections.forEach(sec => {
    const fields = sec.fields.filter(([, v]) => v && v.trim());
    if (!fields.length) return;

    html += `<div class="modal-section">
      <div class="modal-section-title">${sec.title}</div>
      <div class="field-grid">
        ${fields.map(([label, val]) => `
          <div class="field-item">
            <label>${label}</label>
            <span>${val}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  });

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal(event) {
  if (event && event.target !== document.getElementById('modal-overlay') && !event.target.classList.contains('modal-close')) return;
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Carrega emails ----
async function carregarEmails() {
  const wrap = document.getElementById('lista-emails');
  wrap.innerHTML = '<div class="empty-state"><div class="spinner" style="width:20px;height:20px;border-color:rgba(160,82,45,0.3);border-top-color:var(--terra);display:block;margin:0 auto 12px"></div>Carregando…</div>';

  try {
    const result = await api({ action: 'listEmails' });
    if (!result.success) throw new Error(result.error);
    emailsData = result.data || [];
    document.getElementById('stat-emails').textContent = emailsData.filter(e => e.status !== 'Inativo').length;
    renderEmails(emailsData);
  } catch (err) {
    wrap.innerHTML = '<div class="empty-state" style="color:#8B3A1A">Erro: ' + err.message + '</div>';
  }
}

function renderEmails(data) {
  const wrap = document.getElementById('lista-emails');
  if (!data || data.length === 0) {
    wrap.innerHTML = '<div class="empty-state"><div class="icon">👤</div>Nenhuma paciente autorizada ainda.<br>Use o formulário acima para adicionar.</div>';
    return;
  }

  wrap.innerHTML = data.map(p => `
    <div class="email-list-item">
      <div class="email-info">
        <div class="nome">${p.nome || '(sem nome)'}</div>
        <div class="email">${p.email}</div>
      </div>
      <span class="status-badge ${p.status === 'Inativo' ? 'inativo' : 'ativo'}">${p.status || 'Ativo'}</span>
      ${p.status === 'Inativo'
        ? `<button class="btn-reactivate" onclick="reativarEmail('${p.email}', '${p.nome}')">Reativar</button>`
        : `<button class="btn-deactivate" onclick="desativarEmail('${p.email}')">Desativar</button>`
      }
    </div>
  `).join('');
}

function filtrarEmails() {
  const q = document.getElementById('search-email').value.toLowerCase();
  if (!q) { renderEmails(emailsData); return; }
  renderEmails(emailsData.filter(p =>
    p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  ));
}

async function adicionarEmail() {
  const email = document.getElementById('new-email').value.trim();
  const nome = document.getElementById('new-nome').value.trim();

  if (!email) { toast('Informe o e-mail da paciente.'); return; }

  try {
    const result = await api({ action: 'addEmail', email, nome });
    if (result.success) {
      toast('✓ ' + result.message);
      document.getElementById('new-email').value = '';
      document.getElementById('new-nome').value = '';
      await carregarEmails();
    } else {
      toast('Erro: ' + result.error);
    }
  } catch {
    toast('Erro de conexão.');
  }
}

async function desativarEmail(email) {
  if (!confirm('Desativar o acesso de ' + email + '?')) return;
  try {
    const result = await api({ action: 'removeEmail', email });
    if (result.success) {
      toast('✓ Acesso desativado.');
      await carregarEmails();
    } else {
      toast('Erro: ' + result.error);
    }
  } catch {
    toast('Erro de conexão.');
  }
}

async function reativarEmail(email, nome) {
  try {
    const result = await api({ action: 'addEmail', email, nome });
    if (result.success) {
      toast('✓ Acesso reativado.');
      await carregarEmails();
    } else {
      toast('Erro: ' + result.error);
    }
  } catch {
    toast('Erro de conexão.');
  }
}
