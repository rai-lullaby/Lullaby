// =====================================================
// DASHBOARD.JS — LULLABY (ESTÁVEL)
// =====================================================

import { formatDateISO } from './dateUtils.js';
import { buscarEventosPorData } from './services/eventService.js';

console.group('📊 Dashboard Init');

// =====================================================
// 📌 CONFIG EVENTOS (FRONTEND)
// =====================================================
const TIPOS_EVENTO = {
  ENTRADA: { label: 'Entrada', icon: 'log-in', class: 'entry' },
  SAIDA: { label: 'Saída', icon: 'log-out', class: 'exit' },
  ALIMENTACAO: { label: 'Alimentação', icon: 'pizza-slice', class: 'food' },
  SONECA: { label: 'Soneca', icon: 'bed', class: 'sleep' },
  ATIVIDADE: { label: 'Atividade', icon: 'palette', class: 'activity' },
  RECADO: { label: 'Recado', icon: 'chat-bubble', class: 'message' },
  OCORRENCIA: { label: 'Ocorrência', icon: 'warning-triangle', class: 'alert' }
};

// =====================================================
// 🔧 HELPERS
// =====================================================
const el = id => document.getElementById(id);

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem('token');

// =====================================================
// 🔐 AUTENTICAÇÃO
// =====================================================
const token = getToken();
const user = getUser();

console.log('🔑 Token OK:', !!token);
console.log('👤 User:', user);

if (!token || !user) {
  console.error('❌ Sessão inválida');
  window.location.replace('/');
}

// =====================================================
// 🧾 HEADER
// =====================================================
if (el('nomeCreche')) el('nomeCreche').textContent = user?.escola?.nome || 'Creche';
if (el('nomeTurma')) el('nomeTurma').textContent = user?.turma?.nome || 'Turma';

el('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('/');
});

// =====================================================
// 📊 DASHBOARD ADMIN (PLACEHOLDER)
// =====================================================
if (user.perfil === 'ADMIN') {
  el('totalUsuarios') && (el('totalUsuarios').textContent = '0');
  el('totalCriancas') && (el('totalCriancas').textContent = '0');
  el('totalEventos') && (el('totalEventos').textContent = '0');
}

// =====================================================
// 📅 AGENDA
// =====================================================
async function carregarAgenda(date) {
  const dataISO = formatDateISO(date);
  if (!dataISO) return;

  console.group(`📅 Agenda ${dataISO}`);

  try {
    const eventos = await buscarEventosPorData(dataISO);

    console.log('📦 Eventos recebidos:', eventos.length);

    renderAgenda(eventos);
    atualizarResumoDoDia(eventos);

    document.dispatchEvent(
      new CustomEvent('calendar:markEvents', {
        detail: {
          dates: [...new Set(eventos.map(e =>
            formatDateISO(e.data_hora)
          ))]
        }
      })
    );

  } catch (err) {
    console.error('❌ Erro ao carregar agenda:', err);
    renderAgenda([]);
    atualizarResumoDoDia([]);
  }

  console.groupEnd();
}

// =====================================================
// 🗂️ RENDER AGENDA
// =====================================================
function renderAgenda(eventos = []) {
  const container = el('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  const periodos = { Manhã: [], Tarde: [] };

  eventos.forEach(e => {
    const hora = new Date(e.data_hora).getHours();
    hora < 12 ? periodos.Manhã.push(e) : periodos.Tarde.push(e);
  });

  Object.entries(periodos).forEach(([titulo, lista]) => {
    if (!lista.length) return;

    const bloco = document.createElement('div');
    bloco.innerHTML = `<h3>${titulo}</h3>`;

    lista.forEach(ev => bloco.appendChild(criarEventoCard(ev)));
    container.appendChild(bloco);
  });
}

// =====================================================
// 🧾 CARD EVENTO
// =====================================================
function criarEventoCard(evento) {
  const config = TIPOS_EVENTO[evento.tipo] || {};
  const hora = new Date(evento.data_hora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const article = document.createElement('article');
  article.className = `agenda-card ${config.class || 'default'}`;
  article.dataset.eventoId = evento.id;

  article.innerHTML = `
    <div class="agenda-icon">
      <i class="iconoir-${config.icon || 'calendar'}"></i>
    </div>
    <div class="agenda-content">
      <h4>${config.label || evento.tipo}</h4>
      <span class="agenda-time">${hora}</span>
      <p>${evento.descricao || ''}</p>
    </div>
  `;

  return article;
}

// =====================================================
// 📊 RESUMO DO DIA (ADMIN = TODAS AS CRIANÇAS)
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  console.group('📊 Resumo do Dia');
  console.log('Eventos analisados:', eventos.length);

  container.innerHTML = '';

  const contagem = {};
  let inicio = null;
  let fim = null;

  eventos.forEach(e => {
    if (!e.tipo) return;

    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;

    const data = new Date(e.data_hora);
    if (!inicio || data < inicio) inicio = data;
    if (!fim || data > fim) fim = data;
  });

  console.log('Contagem final:', contagem);

  Object.entries(TIPOS_EVENTO).forEach(([tipo, config]) => {
    const total = contagem[tipo] || 0;

    const card = document.createElement('div');
    card.className = `card ${config.class}`;

    card.innerHTML = `
      <i class="iconoir-${config.icon}"></i>
      <strong>${total}</strong>
      <span>${config.label}</span>
    `;

    container.appendChild(card);
  });

  const cardHorario = document.createElement('div');
  cardHorario.className = 'card time';

  cardHorario.innerHTML = `
    <i class="iconoir-clock"></i>
    <strong>${
      inicio && fim
        ? `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} -
           ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : '—'
    }</strong>
    <span>Horário</span>
  `;

  container.appendChild(cardHorario);
  console.groupEnd();
}

// =====================================================
// 📆 CALENDÁRIO
// =====================================================
document.addEventListener('calendar:dateSelected', e => {
  carregarAgenda(e.detail.date || e.detail.dateObj);
});

// =====================================================
// ▶️ INIT ÚNICO
// =====================================================
carregarAgenda(new Date());
console.groupEnd();
