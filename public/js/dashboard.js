// =========================
// HELPERS DE SEGURANÇA
// =========================
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

// =========================
// STORAGE
// =========================
const token = localStorage.getItem('token');
const user = safeJSONParse(localStorage.getItem('user'));

// =========================
// LOG DEBUG
// =========================
console.log('📦 Token:', token);
console.log('👤 User:', user);

// =========================
// 🔒 PROTEÇÃO DA PÁGINA
// =========================
function protegerPagina() {
  if (!token || !user) {
    console.warn('🔒 Não autenticado, redirecionando...');
    window.location.replace('/');
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const agora = Math.floor(Date.now() / 1000);

    if (payload.exp < agora) {
      console.warn('⏰ Token expirado');
      logout();
      return false;
    }
  } catch (err) {
    console.error('❌ Token inválido', err);
    logout();
    return false;
  }

  return true;
}

function logout() {
  console.warn('🚪 Logout executado');
  localStorage.clear();
  window.location.replace('/');
}

// Executa proteção
if (!protegerPagina()) {
  throw new Error('Página protegida — execução interrompida');
}

// =========================
// HEADER
// =========================
const titulo = el('titulo');
if (titulo && user?.nome) {
  titulo.textContent = `Bem-vindo(a), ${user.nome}`;
}

// =========================
// LOGOUT
// =========================
const logoutBtn = el('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// =========================
// CONTROLE POR PERFIL
// =========================
console.log('🎭 Perfil:', user.perfil);

if (user.perfil === 'ADMIN') {
  const admin = el('admin');
  if (admin) {
    admin.hidden = false;
    carregarDashboardAdmin();
  }
}

if (user.perfil === 'EDUCADOR') {
  const educador = el('educador');
  if (educador) {
    educador.hidden = false;
    carregarAgendaEducador();
  }
}

if (user.perfil === 'RESPONSAVEL') {
  const responsavel = el('responsavel');
  if (responsavel) {
    responsavel.hidden = false;
    carregarAgendaResponsavel();
  }
}

// =========================
// FUNÇÕES (PLACEHOLDERS)
// =========================
async function carregarDashboardAdmin() {
  console.log('📊 Carregando dashboard ADMIN');

  const totalUsuarios = el('totalUsuarios');
  const totalCriancas = el('totalCriancas');
  const totalEventos = el('totalEventos');

  if (totalUsuarios) totalUsuarios.textContent = '12';
  if (totalCriancas) totalCriancas.textContent = '5';
  if (totalEventos) totalEventos.textContent = '48';
}

async function carregarAgendaEducador() {
  console.log('📅 Carregando agenda do EDUCADOR');

  const agenda = el('agendaEducador');
  if (agenda) {
    agenda.innerHTML = '<p>Agenda do educador (em construção)</p>';
  }
}

async function carregarAgendaResponsavel() {
  console.log('👶 Carregando agenda do RESPONSÁVEL');

  const agenda = el('agendaResponsavel');
  if (agenda) {
    agenda.innerHTML = '<p>Agenda do responsável (em construção)</p>';
  }
}
