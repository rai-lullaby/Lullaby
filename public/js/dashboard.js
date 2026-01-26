// =====================================================
// DASHBOARD.JS — LULLABY (FINAL ESTÁVEL)
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

// 👉 classe no body para controle de layout (CSS)
document.body.classList.add(
  user.perfil === 'ADMIN' ? 'is-admin' : 'is-user'
);

// =====================================================
// 🧱 HELPERS
// =====================================================
const $ = (id) => document.getElementById(id);

// =====================================================
// 🧱 LAYOUT
// =====================================================
function montarLayoutDashboard() {
  const app = $('app-content');
  if (!app) return;

  app.innerHTML = `
    <section class="calendar-card">
      <div class="calendar-header">
        <button id="prevWeek" aria-label="Anterior">‹</button>
        <h2 id="calendarTitle"></h2>
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
// 📅 CALENDÁRIO
// =====================================================
async function initCalendario() {
  // ⚠️ importa SOMENTE após o layout existir
  await import('/js/calendario.js');
}

// =====================================================
// 🔄 FILTRAR CALENDÁRIO E EVENTOS POR PERFIL
// =====================================================

function filtrarEventosPorPerfil(eventos = []) {
  if (!user) return [];

  // ADMIN vê tudo
  if (user.perfil === 'ADMIN') {
    return eventos;
  }

  // EDUCADOR (por enquanto vê tudo da turma)
  if (user.perfil === 'EDUCADOR') {
    return eventos;
  }

  // RESPONSÁVEL → só eventos das suas crianças
  if (user.perfil === 'RESPONSAVEL') {
    const idsCriancas = user.criancas || [];

    return eventos.filter(ev =>
      idsCriancas.includes(ev.crianca_id)
    );
  }

  return [];
}


// =====================================================
// 🧾 AGENDA DO DIA
// =====================================================
function renderAgenda(eventos = []) {
  const container = $('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p class="muted">📭 Nenhum evento neste dia</p>';
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'agenda-card';

    card.innerHTML = `
      <div class="agenda-content">
        <strong>${ev.tipo}</strong>
        <span class="agenda-time">
          ${new Date(ev.data_hora).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        ${ev.descricao ? `<p>${ev.descricao}</p>` : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

// =====================================================
// 📊 RESUMO DO DIA
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
// 🔄 ESCUTA DATA DO CALENDÁRIO
// =====================================================
document.addEventListener('calendar:dateSelected', async (e) => {
  const dataISO = e.detail?.date;
  if (!dataISO) return;

  const eventos = await buscarEventosPorData(dataISO);
  renderAgenda(eventos);
  atualizarResumo(eventos);
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
