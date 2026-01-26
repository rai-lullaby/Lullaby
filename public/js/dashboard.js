// =====================================================
// DASHBOARD.JS — BOOTSTRAP
// Responsável apenas por:
// - validar sessão
// - identificar perfil
// - delegar lógica correta
// =====================================================

import { initDashboardAdmin } from './dashboardAdmin.js';
import { initDashboardCrianca } from './dashboardCrianca.js';

console.group('📊 Dashboard Init');

// =====================================================
// HELPERS
// =====================================================
function safeJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// =====================================================
// STORAGE
// =====================================================
const token = localStorage.getItem('token');
const user = safeJSONParse(localStorage.getItem('user'));

console.log('🔑 Token OK:', !!token);
console.log('👤 User:', user);

// =====================================================
// AUTH
// =====================================================
function logout() {
  localStorage.clear();
  window.location.replace('/');
}

function protegerPagina() {
  if (!token || !user) {
    logout();
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const agora = Math.floor(Date.now() / 1000);

    if (payload.exp < agora) {
      logout();
      return false;
    }
  } catch {
    logout();
    return false;
  }

  return true;
}

if (!protegerPagina()) {
  throw new Error('Acesso negado');
}

// =====================================================
// HEADER COMUM
// =====================================================
document.getElementById('logoutBtn')?.addEventListener('click', logout);

document.getElementById('nomeCreche') &&
  (document.getElementById('nomeCreche').textContent =
    user?.escola?.nome || 'Creche');

// =====================================================
// ROTEAMENTO POR PERFIL
// =====================================================
console.log('👥 Perfil detectado:', user.perfil);

switch (user.perfil) {
  case 'ADMIN':
    initDashboardAdmin({ user, token });
    break;

  case 'EDUCADOR':
  case 'RESPONSAVEL':
    initDashboardCrianca({ user, token });
    break;

  default:
    console.error('Perfil não suportado');
    logout();
}

console.groupEnd();
