const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// 🔒 Protege acesso direto
if (!user || !token) {
  window.location.href = '/';
}

document.getElementById('titulo').textContent =
  `Bem-vindo(a), ${user.nome}`;

// Exibe dashboard por perfil
if (user.perfil === 'ADMIN') {
  document.getElementById('admin').hidden = false;
}

if (user.perfil === 'EDUCADOR') {
  document.getElementById('educador').hidden = false;
}

if (user.perfil === 'RESPONSAVEL') {
  document.getElementById('responsavel').hidden = false;
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}
