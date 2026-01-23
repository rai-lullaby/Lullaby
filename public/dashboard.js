// =========================
// RECUPERA DADOS
// =========================
const token = localStorage.getItem('token');
const userRaw = localStorage.getItem('user');

// =========================
// FUNÇÕES DE SEGURANÇA
// =========================
function logout() {
  localStorage.clear();
  window.location.replace('/');
}

function protegerPagina() {
  if (!token || !userRaw) {
    logout();
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const agora = Math.floor(Date.now() / 1000);

    if (payload.exp < agora) {
      logout();
    }
  } catch (err) {
    logout();
  }
}

// =========================
// EXECUÇÃO IMEDIATA
// =========================
protegerPagina();

// Agora é seguro parsear o user
const user = JSON.parse(userRaw);

// =========================
// HEADER
// =========================
const titulo = document.getElementById('titulo');
if (titulo) {
  titulo.textContent = `Bem-vindo(a), ${user.nome}`;
}

// =========================
// LOGOUT
// =========================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// =========================
// CONTROLE POR PERFIL
// =========================
switch (user.perfil) {
  case 'ADMIN':
    document.getElementById('admin').hidden = false;
    carregarDashboardAdmin();
    break;

  case 'EDUCADOR':
    document.getElementById('educador').hidden = false;
    carregarAgendaEducador();
    break;

  case 'RESPONSAVEL':
    document.getElementById('responsavel').hidden = false;
    carregarAgendaResponsavel();
    break;

  default:
    logout();
}

// =========================
// FUNÇÕES (PLACEHOLDERS)
// =========================

async function carregarDashboardAdmin() {
  document.getElementById('totalUsuarios').textContent = '12';
  document.getElementById('totalCriancas').textContent = '5';
  document.getElementById('totalEventos').textContent = '48';
}

async function carregarAgendaEducador() {
  document.getElementById('agendaEducador').innerHTML =
    '<p>Agenda do educador (em construção)</p>';
}

async function carregarAgendaResponsavel() {
  document.getElementById('agendaResponsavel').innerHTML =
    '<p>Agenda do responsável (em construção)</p>';
}
