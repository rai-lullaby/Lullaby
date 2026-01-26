// =====================================================
// DASHBOARD — LULLABY
// =====================================================
import { formatDateISO } from './dateUtils.js';
import { getEventConfig, EVENT_TYPES } from './config/eventConfig.js';
import { getEventosPorData } from './services/eventService.js';

console.group('📊 Dashboard Init');

// =====================================================
// HELPERS
// =====================================================
function el(id) {
  return document.getElementById(id);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// =====================================================
// AUTH
// =====================================================
const token = localStorage.getItem('token');
const user = getUser();

if (!token || !user) {
  console.error('❌ Sessão inválida');
  window.location.replace('/');
  throw new Error('Sem sessão');
}

console.log('🔑 Token OK');
console.log('👤 User:', user);

// =====================================================
// HEADER
// =====================================================
el('nomeCreche') &&
  (el('nomeCreche').textContent = user?.escola?.nome || 'Ambiente Tia Bia');

el('nomeTurma') &&
  (el('nomeTurma').textContent = user?.turma?.nome || 'Turma');

el('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('/');
});

// =====================================================
// AGENDA
// =====================================================
let dataAtual = new Date();

async function carregarAgenda() {
  const dataISO = formatDateISO(dataAtual);
  console.group(`📅 Agenda ${dataISO}`);

  try {
    const eventos = await getEventosPorData(dataISO);
    console.log('📦 Eventos recebidos:', eventos);

    renderAgenda(eventos);
    atualizarResumo(eventos);

  } catch (err) {
    console.error('❌ Erro agenda:', err);
    renderAgenda([]);
    atualizarResumo([]);
  }

  console.groupEnd();
}

// =====================================================
// RENDER AGENDA
// =====================================================
function renderAgenda(eventos) {
  const container = el('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  eventos.forEach(evento => {
    container.appendChild(criarEventoCard(evento));
  });
}

// =====================================================
// CARD
// =====================================================
function criarEventoCard(evento) {
  const cfg = getEventConfig(evento.tipo);

  const card = document.createElement('article');
  card.className = `agenda-card ${cfg.class}`;
  card.dataset.id = evento.id;

  card.innerHTML = `
    <div class="agenda-icon">
      <i class="iconoir-${cfg.icon}"></i>
    </div>
    <div class="agenda-content">
      <h4>${cfg.label}</h4>
      <span>
        ${new Date(evento.data_hora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
      <p>${evento.descricao}</p>
    </div>
  `;

  card.addEventListener('click', () => {
    document.dispatchEvent(
      new CustomEvent('agenda:editEvent', {
        detail: evento
      })
    );
  });

  return card;
}

// =====================================================
// RESUMO
// =====================================================
function atualizarResumo(eventos) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

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

    container.appendChild(card);
  });
}

// =====================================================
// EVENTOS GLOBAIS
// =====================================================
document.addEventListener('calendar:dateSelected', e => {
  dataAtual = new Date(e.detail.date || e.detail.dateObj);
  carregarAgenda();
});

document.addEventListener('agenda:eventCreated', () => {
  console.log('🔄 Evento criado → recarregar agenda');
  carregarAgenda();
});

document.addEventListener('agenda:eventUpdated', () => {
  console.log('✏️ Evento atualizado → recarregar agenda');
  carregarAgenda();
});

// =====================================================
// INIT
// =====================================================
carregarAgenda();
console.groupEnd();
