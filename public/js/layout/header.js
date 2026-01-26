export async function carregarHeader(user) {
  const container = document.getElementById('app-header');
  if (!container) return;

  const res = await fetch('/partials/header.html');
  container.innerHTML = await res.text();

  preencherDados(user);
  montarMenuPorPerfil(user.perfil);
  bindLogout();
}

function preencherDados(user) {
  document.getElementById('nomeCreche').textContent =
    user?.escola?.nome || 'Creche';

  document.getElementById('nomeTurma').textContent =
    user?.turma?.nome || 'Turma';
}

function montarMenuPorPerfil(perfil) {
  const menu = document.getElementById('menuPrincipal');
  if (!menu) return;

  menu.innerHTML = '';

  const menus = {
    ADMIN: [
      ['Agenda', '/dashboard.html'],
      ['Crianças', '/criancas.html'],
      ['Usuários', '/usuarios.html']
    ],
    EDUCADOR: [
      ['Agenda', '/dashboard.html'],
      ['Turma', '/dashboard-crianca.html']
    ],
    RESPONSAVEL: [
      ['Agenda', '/dashboard-crianca.html'],
      ['Recados', '/recados.html']
    ]
  };

  menus[perfil]?.forEach(([label, link]) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.onclick = () => (window.location.href = link);
    menu.appendChild(btn);
  });
}

function bindLogout() {
  document
    .getElementById('logoutBtn')
    ?.addEventListener('click', () => {
      localStorage.clear();
      window.location.replace('/');
    });
}
