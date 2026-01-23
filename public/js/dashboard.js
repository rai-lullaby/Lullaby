// ======================================================
// 🧩 HELPERS
// ======================================================
function el(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`⚠️ Elemento #${id} não encontrado`);
  }
  return element;
}

function safeJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ======================================================
// 🔐 STORAGE
// ======================================================
const storage = {
  token: () => localStorage.getItem('token'),
  user: () => safeJSONParse(localStorage.getItem('user')),
  clear: () => localStorage.clear()
};

const token = storage.token();
const user = storage.user();

console.log('📦 Token carregado:', !!token);
console.log('👤 User:', user);

// ======================================================
// 🔒 AUTENTICAÇÃO
// ======================================================
function isTokenValido(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const agora = Math.floor(Date.now() / 1000);
    return payload.exp > agora;
  } catch {
    return false;
  }
}

function logout() {
  console.warn('🚪 Logout executado');
  storage.clear();
  window.location.replace('/');
}

function protegerPagina() {
  if (!token || !user) {
    console.warn('🔒 Não autenticado');
    logout();
    return false;
  }

  if (!isTokenValido(token)) {
    console.warn('⏰ Token expirado ou inválido');
    logout();
    return false;
  }

  return true;
}

// ⛔ trava execução se não autenticado
if (!protegerPagina()) {
  throw new Error('Execução interrompida — página protegida');
}

// ======================================================
// 🧠 HEADER — CRECHE + TURMA
// ======================================================
const nomeCrecheEl = el('nomeCreche');
const nomeTurmaEl = el('nomeTurma');

// 🔧 mock temporário (API depois)
const CRECHE_PADRAO = 'Ambiente Tia Bia';
const TURMA_PADRAO = 'Turma das Estrelas';

if (nomeCrecheEl) {
  nomeCrecheEl.textContent = user?.creche?.nome || CRECHE_PADRAO;
}

if (nomeTurmaEl) {
  nomeTurmaEl.textContent = user?.turma?.nome || TURMA_PADRAO;
}

// ======================================================
// 🚪 LOGOUT
// ======================================================
const logoutBtn = el('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// ======================================================
// 🎭 CONTROLE POR PERFIL
// ======================================================
console.log('🎭 Perfil do usuário:', user.perfil);

const perfilHandlers = {
  ADMIN: carregarDashboardAdmin,
  EDUCADOR: carregarAgendaEducador,
  RESPONSAVEL: carregarAgendaResponsavel
};

function ativarPerfil(perfil) {
  const section = el(perfil.toLowerCase());
  if (section) section.hidden = false;

  const handler = perfilHandlers[perfil];
  if (handler) handler();
}

ativarPerfil(user.perfil);

// ======================================================
// 📊 DASHBOARD ADMIN
// ======================================================
async function carregarDashboardAdmin() {
  console.log('📊 Carregando dashboard ADMIN');

  const totalUsuarios = el('totalUsuarios');
  const totalCriancas = el('totalCriancas');
  const totalEventos = el('totalEventos');

  // 🔧 depois ligar com API real
  if (totalUsuarios) totalUsuarios.textContent = '12';
  if (totalCriancas) totalCriancas.textContent = '5';
  if (totalEventos) totalEventos.textContent = '48';
}

// ======================================================
// 📅 AGENDA — EDUCADOR
// ======================================================
async function carregarAgendaEducador() {
  console.log('📅 Carregando agenda do EDUCADOR');

  const agenda = el('agendaEducador');
  if (agenda) {
    agenda.innerHTML = '<p>Agenda do educador (em construção)</p>';
  }
}

// ======================================================
// 👶 AGENDA — RESPONSÁVEL
// ======================================================
async function carregarAgendaResponsavel() {
  console.log('👶 Carregando agenda do RESPONSÁVEL');

  const agenda = el('agendaResponsavel');
  if (agenda) {
    agenda.innerHTML = '<p>Agenda do responsável (em construção)</p>';
  }
}

// ======================================================
// 📆 INTEGRAÇÃO COM CALENDÁRIO
// ======================================================
document.addEventListener('calendar:dateSelected', async (e) => {
  const { date } = e.detail;
  console.log('📌 Dashboard recebeu data:', date);
  await carregarAgendaPorData(date);
});

// ======================================================
// 📌 TRATAR FORMATO DA DATA RECEBIDA (API)
// ======================================================
function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ======================================================
// 📡 BUSCAR EVENTOS POR DATA (API)
// ======================================================
async function carregarAgendaPorData(date) {
  try {
    const dataObj = date instanceof Date ? date : new Date(date);
    const dataISO = formatDateISO(dataObj);

    console.log('📡 Buscando eventos para:', dataISO);

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');

    const res = await fetch(`/api/eventos?data=${dataISO}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Erro ao buscar eventos');
    }

    const eventos = await res.json();
    console.log('🗓️ Eventos recebidos:', eventos);

    renderAgenda(eventos);

  } catch (err) {
    console.error('❌ Erro ao carregar agenda:', err);
  }
}

// ======================================================
// 🧩 RENDERIZAÇÃO DA AGENDA
// ======================================================
function renderAgenda(eventos = []) {
  // 🔧 aqui depois você conecta com o HTML real da agenda
  console.log('🧱 Render agenda:', eventos);
}

