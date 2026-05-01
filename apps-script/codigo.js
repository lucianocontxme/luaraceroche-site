// ============================================================
// GOOGLE APPS SCRIPT — Luara Ceroche · Sistema de Anamnese
// Spreadsheet ID: 1B6-4mWZo_6xwyy9zk_tvbGaXrRVWPFBTwiM2kzXQLmA
//
// INSTRUÇÕES DE IMPLANTAÇÃO:
// 1. Abra a planilha: https://docs.google.com/spreadsheets/d/1B6-4mWZo_6xwyy9zk_tvbGaXrRVWPFBTwiM2kzXQLmA
// 2. No menu superior: Extensões → Apps Script
// 3. Apague o código padrão e cole TODO este arquivo
// 4. Clique em "Salvar" (ícone de disquete)
// 5. Clique em "Implantar" → "Nova implantação"
// 6. Tipo: "App da Web"
// 7. Descrição: "Anamnese Luara v1"
// 8. Executar como: "Eu (seu email Google)"
// 9. Quem tem acesso: "Qualquer pessoa"
// 10. Clique em "Implantar"
// 11. Copie a URL gerada (começa com https://script.google.com/macros/s/...)
// 12. Cole essa URL no lugar de APPS_SCRIPT_URL nos 3 arquivos HTML
// ============================================================

const SPREADSHEET_ID = '1B6-4mWZo_6xwyy9zk_tvbGaXrRVWPFBTwiM2kzXQLmA';
const ADMIN_TOKEN = 'luara2026admin'; // Mude para algo secreto se quiser

// ---- Utilitário: pega ou cria aba com cabeçalho ----
function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#3D1F0D');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ---- Ponto de entrada GET ----
function doGet(e) {
  return handleRequest(e);
}

// ---- Ponto de entrada POST ----
function doPost(e) {
  return handleRequest(e);
}

// ---- Roteador de ações ----
function handleRequest(e) {
  const params = e.parameter || {};
  const action = params.action;
  let result;

  try {
    switch (action) {
      case 'checkEmail':
        result = checkEmail(params.email);
        break;
      case 'submitAnamnese':
        result = submitAnamnese(params);
        break;
      case 'listAnamneses':
        if (params.token !== ADMIN_TOKEN) throw new Error('Não autorizado');
        result = listAnamneses();
        break;
      case 'listEmails':
        if (params.token !== ADMIN_TOKEN) throw new Error('Não autorizado');
        result = listEmails();
        break;
      case 'addEmail':
        if (params.token !== ADMIN_TOKEN) throw new Error('Não autorizado');
        result = addEmail(params.email, params.nome);
        break;
      case 'removeEmail':
        if (params.token !== ADMIN_TOKEN) throw new Error('Não autorizado');
        result = removeEmail(params.email);
        break;
      default:
        result = { success: false, error: 'Ação inválida: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  const output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ---- Verifica se email está autorizado ----
function checkEmail(email) {
  if (!email) return { success: false, authorized: false, error: 'Email não informado' };

  const sheet = getOrCreateSheet('pacientes_autorizados',
    ['Email', 'Nome', 'Data Autorização', 'Status']);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowEmail = (data[i][0] || '').toString().toLowerCase().trim();
    if (rowEmail === email.toLowerCase().trim()) {
      const status = (data[i][3] || 'Ativo').toString();
      if (status !== 'Inativo') {
        return { success: true, authorized: true, nome: data[i][1] || '' };
      } else {
        return { success: true, authorized: false, motivo: 'inativo' };
      }
    }
  }
  return { success: true, authorized: false };
}

// ---- Salva anamnese na aba "anamneses" ----
function submitAnamnese(params) {
  const check = checkEmail(params.email);
  if (!check.authorized) return { success: false, error: 'Email não autorizado' };

  const headers = [
    'Timestamp', 'Email', 'Nome Completo', 'Data Nascimento', 'WhatsApp',
    'Profissão', 'Estado Civil', 'Cidade/Estado', 'Moradia', 'Como Encontrou',
    'Histórico Familiar', 'Diagnóstico Clínico', 'Medicamentos/Suplementos', 'Menstruação',
    'Funcionamento Intestinal', 'Fuma?', 'Álcool?', 'Sono', 'Atividade Física',
    'Motivo da Consulta', 'Fator de Vida', 'Dificuldades com Alimentação', 'Expectativas',
    'Refeições por Dia', 'Tempo por Refeição', 'Água por Dia', 'Outros Líquidos', 'Come por Emoção',
    'Comportamentos Alimentares', 'Já Fez Dieta?', 'Tipos de Dieta', 'Relação com a Comida',
    'Alimento Descontrolado', 'Após Comer Proibido', 'Frequência de Pensamentos',
    'Experiência com Profissionais', 'Usa Injeção?', 'Qual Injeção', 'Efeitos da Injeção',
    'Emocional — Injeção', 'Altura', 'Peso Atual', 'Peso Máximo', 'Peso Mínimo',
    'Peso Desejado', 'Frequência de Pesagem', 'Perda de Peso Recente', 'Sensação no Corpo',
    'Por Que Agora', 'Escala Prontidão (0-10)', 'Escala Crença (0-10)', 'Observações Finais'
  ];

  const sheet = getOrCreateSheet('anamneses', headers);

  const row = [
    new Date(),
    params.email || '', params.nome_completo || '', params.data_nascimento || '', params.whatsapp || '',
    params.profissao || '', params.estado_civil || '', params.cidade_estado || '',
    params.moradia || '', params.como_encontrou || '',
    params.historico_familiar || '', params.diagnostico || '', params.medicamentos || '', params.menstruacao || '',
    params.intestino || '', params.fuma || '', params.alcool || '', params.sono || '', params.atividade_fisica || '',
    params.motivo_consulta || '', params.fator_vida || '', params.dificuldades || '', params.expectativas || '',
    params.refeicoes_dia || '', params.tempo_refeicao || '', params.agua || '', params.liquidos || '',
    params.come_por_emocao || '', params.comportamentos || '', params.ja_fez_dieta || '', params.tipos_dieta || '',
    params.relacao_comida || '', params.alimento_descontrolado || '', params.apos_proibido || '',
    params.frequencia_pensamentos || '', params.experiencia_profissionais || '',
    params.usa_injecao || '', params.qual_injecao || '', params.efeitos_injecao || '', params.emocional_injecao || '',
    params.altura_atual || '', params.peso_atual || '', params.peso_maximo || '', params.peso_minimo || '',
    params.peso_desejado || '', params.frequencia_peso || '', params.perda_peso_recente || '', params.sensacao_corpo || '',
    params.por_que_agora || '', params.escala_prontidao || '', params.escala_crenca || '', params.observacoes_finais || ''
  ];

  sheet.appendRow(row);
  return { success: true, message: 'Anamnese salva com sucesso! Luara entrará em contato em breve. 🌿' };
}

// ---- Lista todas as anamneses (admin) ----
function listAnamneses() {
  const sheet = getOrCreateSheet('anamneses', ['Timestamp']);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  const headers = data[0].map(h => h.toString());
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i].toString() : ''; });
    return obj;
  });
  rows.reverse(); // mais recentes primeiro
  return { success: true, data: rows };
}

// ---- Lista emails autorizados (admin) ----
function listEmails() {
  const sheet = getOrCreateSheet('pacientes_autorizados',
    ['Email', 'Nome', 'Data Autorização', 'Status']);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  const rows = data.slice(1).map(row => ({
    email: (row[0] || '').toString(),
    nome: (row[1] || '').toString(),
    data: row[2] ? row[2].toString() : '',
    status: (row[3] || 'Ativo').toString()
  }));
  return { success: true, data: rows };
}

// ---- Adiciona ou reativa email autorizado (admin) ----
function addEmail(email, nome) {
  if (!email) return { success: false, error: 'Email não informado' };

  const sheet = getOrCreateSheet('pacientes_autorizados',
    ['Email', 'Nome', 'Data Autorização', 'Status']);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toString().toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, 4).setValue('Ativo');
      if (nome) sheet.getRange(i + 1, 2).setValue(nome);
      return { success: true, message: 'Email reativado com sucesso' };
    }
  }

  sheet.appendRow([email.toLowerCase().trim(), nome || '', new Date(), 'Ativo']);
  return { success: true, message: 'Email autorizado com sucesso' };
}

// ---- Desativa email autorizado (admin) ----
function removeEmail(email) {
  if (!email) return { success: false, error: 'Email não informado' };

  const sheet = getOrCreateSheet('pacientes_autorizados',
    ['Email', 'Nome', 'Data Autorização', 'Status']);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toString().toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, 4).setValue('Inativo');
      return { success: true, message: 'Email desativado com sucesso' };
    }
  }
  return { success: false, error: 'Email não encontrado' };
}
