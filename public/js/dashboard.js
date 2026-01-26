// =====================================================
// DASHBOARD.JS — LULLABY (REFATORADO FINAL)
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
// 🧠 HELPERS
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

function normalizarEvento(evento) {
  const tipo = (evento.tipo || '').toUpperCase();
  const cfg = EVENT_CONFIG[tipo] || {
    label: tipo,
    class: 'default',
    icon: 'calendar'
  };

  return {
    ...evento,
    tipo,
    label: cfg.label,
    className: cfg.class,
    icon: cfg.icon
  };
}

// =====================================================
// 🧱 MONTA DOM BASE DO DASHBOARD
// =====================================================
function montarLayoutDashboard() {
  const content = el('app-content');
  if (!content) return;

  content.innerHTML = `
    <section class="calendar-card">
      <div class="calendar-header">
        <button id="prevWeek">‹</button>
        <h2 id="calendarTitle">Calendário</h2>
        <button id="nextWeek">›</button>
      </div>
      <div id="calendarDays" class="calendar-days"></div>
    </section>

    <section id="agendaBox">
      <h2>
        <i class="iconoir-clock"></i>
        Agenda do Dia
      </h2>
      <section id="agenda" class="agenda"></section>
    </section>

    <section id="summaryBox">
      <h2>
        <i class="iconoir-clipboard"></i>
        Resumo do Dia
      </h2>
      <section class="summary"></section>
    </section>
  `;
}

// =====================================================
// 🧾 CARD EVENTO
// =====================================================
function criarEventoCard(evento) {
  const ev = normalizarEvento(evento);

  const card = document.createElement('article');
  card.className = `agenda-card ${ev.className}`;

  card.innerHTML = `
    <div class="agenda-icon">
      <i class="iconoir-${ev.icon}"></i>
    </div>
    <div class="agenda-content">
      <h4>${ev.label}</h4>
      <span class="agenda-time">${formatHora(ev.data_hora)}</span>
      <p>${ev.descricao || ''}</p>
    </div>
  `;

  return card;
}

// =====================================================
// 📅 AGENDA
// =====================================================
function renderAgenda(eventos = []) {
  const container = el('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  eventos.forEach(e => {
    container.appendChild(criarEventoCard(e));
  });
}

// =====================================================
// 📊 RESUMO DO DIA
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

  const contagem = {};
  let inicio = null;
  let fim = null;

  eventos.forEach(e => {
    const tipo = (e.tipo || '').toUpperCase();
    contagem[tipo] = (contagem[tipo] || 0) + 1;

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

  const hoje = new Date().toISOString().split('T')[0];
  const eventos = await buscarEventosPorData(hoje);

  atualizarResumoDoDia(eventos);

  if (user.perfil !== 'ADMIN') {
    renderAgenda(eventos);
  } else {
    el('agendaBox')?.remove();
  }

  console.groupEnd();
}

// =====================================================
// 🔄 EVENTO GLOBAL (CRIAR EVENTO)
// =====================================================
document.addEventListener('evento:criado', e => {
  const dataISO = e.detail.data_hora.split('T')[0];

  buscarEventosPorData(dataISO).then(eventos => {
    atualizarResumoDoDia(eventos);
    if (user.perfil !== 'ADMIN') {
      renderAgenda(eventos);
    }
  });
});

// =====================================================
// ▶️ START
// =====================================================
document.addEventListener('DOMContentLoaded', initDashboard);
