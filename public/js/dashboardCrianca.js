// =====================================================
// DASHBOARD CRIANÇA / EDUCADOR
// =====================================================

import { buscarEventosPorData } from './services/eventService.js';
import { TIPOS_EVENTO } from './config/eventConfig.js';
import { formatDateISO } from './dateUtils.js';

export function initDashboardCrianca({ user, token }) {
  console.group('👶 Dashboard Criança');

  document.getElementById('nomeTurma') &&
    (document.getElementById('nomeTurma').textContent =
      user?.turma?.nome || 'Turma');

  carregarAgenda(new Date(), token);

  document.addEventListener('calendar:dateSelected', e => {
    const date = e.detail.date || e.detail.dateObj;
    carregarAgenda(date, token);
  });

  console.groupEnd();
}

// =====================================================
// AGENDA DO DIA
// =====================================================
async function carregarAgenda(date, token) {
  const dataISO = formatDateISO(date);
  console.group(`⏰ Agenda ${dataISO}`);

  const eventos = await buscarEventosPorData(dataISO, token);

  renderAgenda(eventos);
  atualizarResumoDoDia(eventos);

  console.groupEnd();
}

// =====================================================
// RENDER AGENDA
// =====================================================
function renderAgenda(eventos = []) {
  const agenda = document.getElementById('agenda');
  if (!agenda) return;

  agenda.innerHTML = '';

  if (!eventos.length) {
    agenda.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  eventos.forEach(evento => {
    const config = TIPOS_EVENTO[evento.tipo] || {};
    const hora = new Date(evento.data_hora || evento.hora)
      .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('article');
    card.className = `agenda-card ${config.class}`;

    card.innerHTML = `
      <div class="agenda-icon">
        <i class="iconoir-${config.icon}"></i>
      </div>
      <div class="agenda-content">
        <h4>${config.label}</h4>
        <span>${hora}</span>
        <p>${evento.descricao || ''}</p>
      </div>
    `;

    agenda.appendChild(card);
  });
}

// =====================================================
// RESUMO (FILTRADO)
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

  const contagem = {};
  eventos.forEach(e => {
    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;
  });

  Object.entries(TIPOS_EVENTO).forEach(([tipo, config]) => {
    const card = document.createElement('div');
    card.className = `card ${config.class}`;

    card.innerHTML = `
      <i class="iconoir-${config.icon}"></i>
      <strong>${contagem[tipo] || 0}</strong>
      <span>${config.label}</span>
    `;

    container.appendChild(card);
  });
}
