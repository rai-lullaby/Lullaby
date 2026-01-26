// =====================================================
// DASHBOARD.JS — LULLABY (REFATORADO CORRETO)
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
// 🧱 HELPERS
// =====================================================
function el(id) {
  return document.getElementById(id);
}

// =====================================================
// 🧱 MONTA LAYOUT
// =====================================================
function montarLayoutDashboard() {
  el('app-content').innerHTML = `
    <section class="calendar-card">
      <div class="calendar-header">
        <button id="prevWeek" aria-label="Anterior">‹</button>
        <h2 id="calendarTitle">Calendário</h2>
        <button id="nextWeek" aria-label="Próximo">›</button>
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
// 📅 INICIALIZA CALENDÁRIO
// =====================================================
async function initCalendario() {
  // path absoluto (obrigatório no browser)
  await import('/js/calendario.js');
}

// =====================================================
// 🔄 ESCUTA DATA SELECIONADA
// =====================================================
document.addEventListener('calendar:dateSelected', async (e) => {
  const dataISO = e.detail.date;

  const eventos = await buscarEventosPorData(dataISO);
  renderAgenda(eventos);
  atualizarResumo(eventos);
});

// =====================================================
// 🧾 AGENDA DO DIA
// =====================================================
function renderAgenda(eventos = []) {
  const container = el('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'agenda-card';

    card.innerHTML = `
      <strong>${ev.tipo}</strong>
      <span>${new Date(ev.data_hora).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}</span>
      <p>${ev.descricao || ''}</p>
    `;

    container.appendChild(card);
  });
}

// =====================================================
// 📊 RESUMO (placeholder simples)
// =====================================================
function atualizarResumo(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <strong>${eventos.length}</strong>
      <span>Eventos</span>
    </div>
  `;
}

// =====================================================
// 🧠 INIT
// =====================================================
async function initDashboard() {
  await carregarHeader(user);
  await carregarFooter();

  montarLayoutDashboard();
  await initCalendario();
}

document.addEventListener('DOMContentLoaded', initDashboard);
