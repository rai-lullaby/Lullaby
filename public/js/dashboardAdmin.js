// =====================================================
// DASHBOARD ADMIN
// =====================================================

import { buscarEventosPorData } from './services/eventService.js';
import { TIPOS_EVENTO } from './config/eventConfig.js';
import { formatDateISO } from './dateUtils.js';

export function initDashboardAdmin({ user, token }) {
  console.group('🛠️ Dashboard ADMIN');

  preencherVisaoGeral();
  carregarResumoDoDia(new Date(), token);

  document.addEventListener('calendar:dateSelected', e => {
    const date = e.detail.date || e.detail.dateObj;
    carregarResumoDoDia(date, token);
  });

  console.groupEnd();
}

// =====================================================
// VISÃO GERAL (mock por enquanto)
// =====================================================
function preencherVisaoGeral() {
  document.getElementById('totalUsuarios').textContent = '12';
  document.getElementById('totalCriancas').textContent = '5';
  document.getElementById('totalEventos').textContent = '48';
}

// =====================================================
// RESUMO DO DIA (GLOBAL)
// =====================================================
async function carregarResumoDoDia(date, token) {
  const dataISO = formatDateISO(date);
  console.group(`📋 Resumo ADMIN ${dataISO}`);

  const eventos = await buscarEventosPorData(dataISO, token);
  atualizarResumoDoDia(eventos);

  console.groupEnd();
}

// =====================================================
// RENDER RESUMO
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

  const contagem = {};
  let inicio = null;
  let fim = null;

  eventos.forEach(e => {
    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;

    const h = new Date(e.data_hora || e.hora);
    if (!inicio || h < inicio) inicio = h;
    if (!fim || h > fim) fim = h;
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

  const horario = document.createElement('div');
  horario.className = 'card time';
  horario.innerHTML = `
    <i class="iconoir-clock"></i>
    <strong>${
      inicio && fim
        ? `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : '—'
    }</strong>
    <span>Horário</span>
  `;

  container.appendChild(horario);
}
