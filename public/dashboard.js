const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

if (!user || !token) {
  window.location.href = '/';
}

document.getElementById('titulo').textContent =
  `Bem-vindo(a), ${user.nome}`;

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

function logout() {
  localStorage.clear();
  window.location.href = '/';
}
