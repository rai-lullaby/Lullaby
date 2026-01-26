// =====================================================
// DASHBOARD.JS — LULLABY (FINAL DEFINITIVO)
// =====================================================

import { carregarHeader } from './layout/header.js';
import { carregarFooter } from './layout/footer.js';
import { buscarEventosPorData } from './services/eventService.js';

// =====================================================
// 🔐 SESSION
// =====================================================
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

const user = getUser();
const token = localStorage.getItem('token');

if (!user || !token) {
  window.location.replace('/');
}

// =====================================================
// 🎨 EVENT CONFIG
// =====================================================
const EVENT_CONFIG = {
  ENTRADA: { label: 'Entrada', class: 'entry', icon: 'log-in' },
  SAIDA: { label: 'Saída', class: 'exit', icon: 'log-out' },
  ALIMENTACAO: { label: 'Alimentação', class: 'food', icon: 'pizza-slice' },
  SONECA: { label: 'Soneca', class: 'sleep', icon: 'bed' },
  ATIVIDADE: { label: 'Atividade', class: 'play', icon: 'palette' },
  HIGIENE: { label: 'Higiene', class: 'hygiene', icon: 'droplet' },
  APRENDIZADO: { label: 'Aprendizado', class: 'learn', icon: 'book' },
  RECADO: { label: 'Recado', class: 'message', icon: 'chat-bubble' },
  OCORRENCIA: { label: 'Ocorrência', class: 'alert', icon: 'warning-triangle' }
};

// =====================================================
// 🧱 DOM
// =====================================================
function el(id) {
  return document.getElementById(id);
}

function formatHora(date) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// =====================================================
// 🧱 MONTA LAYOUT
// =====================================================
function montarLayoutDashboard() {
  el('app-content').innerHTML = `
    <section class="calendar-card">
      <div class="calendar-header">
        <button id="prevWeek">‹</button>
        <h2 id="calendarTitle">Calendário</h2>
        <button id="nextWeek">›</button>
      </div>
      <div id="calendarDays" class="calendar-days"></div>
    </section>

    <section id="agendaBox">
      <h2><i class="iconoir-clock"></i> Agenda do Dia</h2>
      <section id="agenda" class="agenda"></section>
    </section>

    <section id="summaryBox">
      <h2><i class="iconoir-clipboard"></i> Resumo do Dia</h2>
      <section class="summary"></section>
    </section>
  `;
}

// =====================================================
// 📅 INICIALIZA CALENDÁRIO (IMPORT DINÂMICO)
// =====================================================
async function initCalendario() {
  await import('./calendario.js');
}

// =====================================================
// 📊 RESUMO
// =====================================================
function atualizarResumo(eventos) {
  const container = document.querySelector('.summary');
  container.innerHTML = '';

  const contagem = {};
  let inicio = null;
  let fim = null;

  eventos.forEach(e => {
    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;
    const h = new Date(e.data_hora);
    if (!inicio || h < inicio) inicio = h;
    if (!fim || h > fim) fim = h;
  });

  Object.entries(EVENT_CONFIG).forEach(([tipo, cfg]) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <i class="iconoir-${cfg.icon}"></i>
      <strong>${contagem[tipo] || 0}</strong>
      <span>${cfg.label}</span>
    `;
    container.appendChild(card);
  });

  if (inicio && fim) {
    const horario = document.createElement('div');
    horario.className = 'card';
    horario.innerHTML = `
      <i class="iconoir-clock"></i>
      <strong>${formatHora(inicio)} - ${formatHora(fim)}</strong>
      <span>Horário</span>
    `;
    container.appendChild(horario);
  }
}

// =====================================================
// 🧠 INIT
// =====================================================
async function initDashboard() {
  console.group('📊 Dashboard Init');

  await carregarHeader(user);
  await carregarFooter();
  montarLayoutDashboard();
  await initCalendario();

  const hoje = new Date().toISOString().split('T')[0];
  const eventos = await buscarEventosPorData(hoje);

  atualizarResumo(eventos);

  console.groupEnd();
}

document.addEventListener('DOMContentLoaded', initDashboard);
