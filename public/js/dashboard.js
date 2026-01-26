// =====================================================
// DASHBOARD.JS — LULLABY (REFATORADO + SERVICE)
// =====================================================

import { carregarHeader } from './layout/header.js';
import { carregarFooter } from './layout/footer.js';
import { buscarEventosPorData } from './services/eventService.js';

// =====================================================
// 🔐 SESSION
// =====================================================
const user = getUser();
const token = localStorage.getItem('token');

if (!user || !token) {
  window.location.replace('/');
}

// =====================================================
// 🎨 EVENT CONFIG (FONTE ÚNICA)
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

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function formatHora(date) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// =====================================================
// 🧱 NORMALIZAÇÃO
// =====================================================
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
// 📅 AGENDA (NÃO ADMIN)
// =====================================================
function renderAgenda(eventos = []) {
  const container = el('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  const manha = [];
  const tarde = [];

  eventos.forEach(e => {
    const h = new Date(e.data_hora).getHours();
    h < 12 ? manha.push(e) : tarde.push(e);
  });

  if (manha.length) container.appendChild(criarPeriodo('Manhã', manha));
  if (tarde.length) container.appendChild(criarPeriodo('Tarde', tarde));
}

function criarPeriodo(titulo, eventos) {
  const bloco = document.createElement('div');
  bloco.innerHTML = `<h3>${titulo}</h3>`;
  eventos.forEach(e => bloco.appendChild(criarEventoCard(e)));
  return bloco;
}

// =====================================================
// 📊 RESUMO DO DIA (TODOS)
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

  const hoje = new Date().toISOString().split('T')[0];
  const eventos = await buscarEventosPorData(hoje);

  atualizarResumoDoDia(eventos);

  // ADMIN não vê agenda do dia
  if (user.perfil !== 'ADMIN') {
    renderAgenda(eventos);
  } else {
    el('agenda')?.remove();
  }

  console.groupEnd();
}

// =====================================================
// 🔄 ATUALIZAÇÃO AUTOMÁTICA
// =====================================================
document.addEventListener('evento:criado', e => {
  console.log('🔁 Evento criado → atualizando dashboard', e.detail);

  const dataISO = e.detail.data_hora.split('T')[0];
  buscarEventosPorData(dataISO).then(eventos => {
    atualizarResumoDoDia(eventos);
    if (user.perfil !== 'ADMIN') renderAgenda(eventos);
  });
});

// =====================================================
// ▶️ START
// =====================================================
document.addEventListener('DOMContentLoaded', initDashboard);
