const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// 🔒 Proteção da página
function protegerPagina() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    window.location.replace('/');
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const agora = Math.floor(Date.now() / 1000);

    if (payload.exp < agora) {
      logout();
    }
  } catch {
    logout();
  }
}

function logout() {
  localStorage.clear();
  window.location.replace('/');
}

// 🔒 executa imediatamente
protegerPagina();


// Header
document.getElementById('titulo').textContent =
  `Bem-vindo(a), ${user.nome}`;

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('/');
});

// Controle por perfil
if (user.perfil === 'ADMIN') {
  document.getElementById('admin').hidden = false;
  carregarDashboardAdmin();
}

if (user.perfil === 'EDUCADOR') {
  document.getElementById('educador').hidden = false;
  carregarAgendaEducador();
}

if (user.perfil === 'RESPONSAVEL') {
  document.getElementById('responsavel').hidden = false;
  carregarAgendaResponsavel();
}

// =========================
// FUNÇÕES (placeholders)
// =========================

async function carregarDashboardAdmin() {
  // 🔧 depois ligamos com a API
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

