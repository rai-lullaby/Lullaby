const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// 🔒 Proteção da página
if (!user || !token) {
  window.location.replace('/');
}

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
