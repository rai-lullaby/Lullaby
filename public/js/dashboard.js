// =====================================================
// DASHBOARD.JS — LULLABY (FINAL LIMPO / SEM UI)
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

// classe no body para controle de layout via CSS
document.body.classList.add(
  user.perfil === 'ADMIN' ? 'is-admin' : 'is-user'
);

// =====================================================
// 🧱 HELPERS
// =====================================================
const $ = (id) => document.getElementById(id);

// =====================================================
// 🧱 LAYOUT (estrutura apenas)
// =====================================================
function montarLayoutDashboard() {
  const app = $('app-content');
  if (!app) return;

  app.innerHTML = `
    <section class="calendar-card">
      <div class="calendar-header">
        <button id="prevWeek" type="button" aria-label="Anterior"></button>
        <h2 id="calendarTitle"></h2>
        <button id="nextWeek" type="button" aria-label="Próximo"></button>
      </div>
      <div id="calendarDays" class="calendar-days"></div>
    </section>

    <section id="agendaBox">
      <h2 class="section-title section-title--agenda">
        Agenda do Dia
      </h2>
      <section id="agenda" class="agenda"></section>
    </section>

    <section id="summaryBox">
      <h2 class="section-title section-title--summary">
        Resumo do Dia
      </h2>
      <section class="summary"></section>
    </section>
  `;
}

// =====================================================
// 📅 CALENDÁRIO
// =====================================================
async function initCalendario() {
  // importa SOMENTE após o layout existir
  await import('/js/calendario.js');
}

// =====================================================
// 🔄 FILTRO DE EVENTOS POR PERFIL
// =====================================================
function filtrarEventosPorPerfil(eventos = []) {
  if (!user) return [];

  // ADMIN → tudo
  if (user.perfil === 'ADMIN') return eventos;

  // EDUCADOR → eventos da turma (regra futura)
  if (user.perfil === 'EDUCADOR') return eventos;

  // RESPONSÁVEL → apenas eventos das próprias crianças
  if (user.perfil === 'RESPONSAVEL') {
    const idsCriancas = user.criancas || [];
    return eventos.filter(ev =>
      idsCriancas.includes(ev.crianca_id)
    );
  }

  return [];
}

// =====================================================
// 🧾 AGENDA DO DIA (SEM ESTILO)
// =====================================================
function renderAgenda(eventos = []) {
  const container = $('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    const empty = document.createElement('p');
    empty.className = 'agenda-empty';
    empty.textContent = 'Nenhum evento neste dia';
    container.appendChild(empty);
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement('article');
    card.className = `agenda-card agenda-${ev.tipo?.toLowerCase() || 'default'}`;

    const time = new Date(ev.data_hora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    card.innerHTML = `
      <div class="agenda-content">
        <strong class="agenda-title">${ev.tipo}</strong>
        <span class="agenda-time">${time}</span>
        ${ev.descricao ? `<p class="agenda-desc">${ev.descricao}</p>` : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

// =====================================================
// 📊 RESUMO DO DIA (SEM ÍCONES)
// =====================================================
function atualizarResumo(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <strong>${eventos.length}</strong>
    <span>Eventos</span>
  `;

  container.appendChild(card);
}

// =====================================================
// 🔄 ESCUTA DATA DO CALENDÁRIO
// =====================================================
document.addEventListener('calendar:dateSelected', async (e) => {
  const dataISO = e.detail?.date;
  if (!dataISO) return;

  const eventos = await buscarEventosPorData(dataISO);
  const eventosFiltrados = filtrarEventosPorPerfil(eventos);

  renderAgenda(eventosFiltrados);
  atualizarResumo(eventosFiltrados);
});

// =====================================================
// 🧠 INIT
// =====================================================
async function initDashboard() {
  console.group('📊 Dashboard Init');

  await carregarHeader(user);
  await carregarFooter();

  montarLayoutDashboard();
  await initCalendario();

  console.groupEnd();
}

document.addEventListener('DOMContentLoaded', initDashboard);
