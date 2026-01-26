// =====================================================
// DASHBOARD — LULLABY
// =====================================================

import { buscarEventosPorData } from './services/eventService.js';
import { EVENT_TYPES } from './config/eventConfig.js';
import { formatDateISO } from './dateUtils.js';
import { initAgendaTurma } from './agendaTurma.js';

console.group('📊 Dashboard Init');

// =====================================================
// STORAGE
// =====================================================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

console.log('🔑 Token OK:', !!token);
console.log('👤 User:', user);

if (!token || !user) {
  window.location.replace('/');
  throw new Error('Sessão inválida');
}

// =====================================================
// DOM (somente o que existe)
// =====================================================
const agendaEl = document.getElementById('agenda');
const resumoEl = document.querySelector('.summary');

// =====================================================
// AGENDA
// =====================================================
async function carregarAgenda(date) {
  const dataISO = formatDateISO(date);
  if (!dataISO) return;

  console.group(`📅 Agenda ${dataISO}`);

  try {
    const eventos = await buscarEventosPorData(dataISO);

    console.log('📦 Eventos recebidos:', eventos);

    renderAgenda(eventos);
    renderResumo(eventos);

  } catch (err) {
    console.error('❌ Erro agenda:', err);
    renderAgenda([]);
    renderResumo([]);
  }

  console.groupEnd();
}

// =====================================================
// RENDER AGENDA
// =====================================================
function renderAgenda(eventos = []) {
  if (!agendaEl) return;

  agendaEl.innerHTML = '';

  if (!eventos.length) {
    agendaEl.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  eventos.forEach(ev => {
    agendaEl.appendChild(criarCard(ev));
  });
}

// =====================================================
// CARD
// =====================================================
function criarCard(evento) {
  const cfg = EVENT_TYPES[evento.tipo] || {};

  const hora = new Date(evento.data_hora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const card = document.createElement('article');
  card.className = `agenda-card ${cfg.class || ''}`;

  card.innerHTML = `
    <div class="agenda-icon">
      <i class="iconoir-${cfg.icon || 'calendar'}"></i>
    </div>
    <div class="agenda-content">
      <h4>${cfg.label || evento.tipo}</h4>
      <span>${hora}</span>
      <p>${evento.descricao || ''}</p>
    </div>
  `;

  return card;
}

// =====================================================
// RESUMO
// =====================================================
function renderResumo(eventos = []) {
  if (!resumoEl) return;

  resumoEl.innerHTML = '';

  const contagem = {};

  eventos.forEach(e => {
    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;
  });

  Object.entries(EVENT_TYPES).forEach(([tipo, cfg]) => {
    const card = document.createElement('div');
    card.className = `card ${cfg.class}`;

    card.innerHTML = `
      <i class="iconoir-${cfg.icon}"></i>
      <strong>${contagem[tipo] || 0}</strong>
      <span>${cfg.label}</span>
    `;

    resumoEl.appendChild(card);
  });
}

// =====================================================
// EVENTOS GLOBAIS
// =====================================================
document.addEventListener('calendar:dateSelected', (e) => {
  carregarAgenda(e.detail.date);
});

document.addEventListener('evento:turmaCriado', (e) => {
  console.log('🔄 Atualizando dashboard com novo evento');
  carregarAgenda(e.detail.data_hora);
});

// =====================================================
// ▶️ INIT — DASHBOARD
// =====================================================
(function initDashboard() {
  console.group('🚀 INIT Dashboard');

  // 1️⃣ Segurança
  if (!protegerPagina()) {
    console.error('⛔ Dashboard bloqueado');
    console.groupEnd();
    return;
  }

  console.log('🔐 Sessão válida');

  // 2️⃣ Header / usuário
  console.log('👤 Usuário carregado:', user);

  // 3️⃣ Módulos
  console.log('🧩 Inicializando módulos');
  initAgendaTurma(); // ← agora controlado, nunca duplica

  // 4️⃣ Agenda inicial
  const hoje = new Date();
  console.log('📅 Carregando agenda inicial:', hoje);
  carregarAgenda(hoje);

  console.log('✅ Dashboard pronto');
  console.groupEnd();
})();

