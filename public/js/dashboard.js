// =====================================================
// DASHBOARD.JS — LULLABY (FINAL)
// =====================================================
import { formatDateISO } from './dateUtils.js';
import { buscarEventosPorData } from './services/eventService.js';

console.group('📊 Dashboard Init');

// =====================================================
// CONFIG
// =====================================================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

console.log('🔑 Token OK:', !!token);
console.log('👤 User:', user);

if (!token || !user) {
  localStorage.clear();
  window.location.replace('/');
  throw new Error('Sessão inválida');
}

// =====================================================
// TIPOS DE EVENTO (FRONT)
// =====================================================
const TIPOS_EVENTO = {
  ENTRADA: { label: 'Entrada', icon: 'log-in' },
  SAIDA: { label: 'Saída', icon: 'log-out' },
  ALIMENTACAO: { label: 'Alimentação', icon: 'pizza-slice' },
  SONECA: { label: 'Soneca', icon: 'bed' },
  ATIVIDADE: { label: 'Atividade', icon: 'palette' },
  RECADO: { label: 'Recado', icon: 'chat-bubble' },
  OCORRENCIA: { label: 'Ocorrência', icon: 'warning-triangle' }
};

// =====================================================
// HEADER
// =====================================================
const nomeCreche = document.getElementById('nomeCreche');
const nomeTurma = document.getElementById('nomeTurma');

if (nomeCreche) nomeCreche.textContent = user.escola?.nome || 'Creche';
if (nomeTurma) nomeTurma.textContent = 'Turma';

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('/');
});

// =====================================================
// INIT
// =====================================================
initDashboard();
console.groupEnd();

async function initDashboard() {
  const hoje = new Date();
  const dataISO = formatDateISO(hoje);

  console.group(`📅 Dashboard ${dataISO}`);

  const eventos = await buscarEventosPorData(dataISO);

  console.log('📦 Eventos recebidos:', eventos.length);

  // 🔥 SEMPRE atualizar resumo
  atualizarResumoDoDia(eventos);

  // 🚫 ADMIN NÃO vê agenda
  if (user.perfil !== 'ADMIN') {
    renderAgenda(eventos);
  } else {
    ocultarAgenda();
  }

  console.groupEnd();
}

// =====================================================
// RESUMO DO DIA (ADMIN GLOBAL)
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  console.group('📊 Resumo do Dia');

  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

  const contagem = {};
  let inicio = null;
  let fim = null;

  eventos.forEach(ev => {
    contagem[ev.tipo] = (contagem[ev.tipo] || 0) + 1;

    const h = new Date(ev.data_hora);
    if (!inicio || h < inicio) inicio = h;
    if (!fim || h > fim) fim = h;
  });

  console.log('Eventos analisados:', eventos.length);
  console.log('Contagem final:', contagem);

  Object.entries(TIPOS_EVENTO).forEach(([tipo, cfg]) => {
    const total = contagem[tipo] || 0;

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <i class="iconoir-${cfg.icon}"></i>
      <strong>${total}</strong>
      <span>${cfg.label}</span>
    `;

    container.appendChild(card);
  });

  // Horário
  const horario = document.createElement('div');
  horario.className = 'card time';

  horario.innerHTML = `
    <i class="iconoir-clock"></i>
    <strong>
      ${inicio && fim
        ? `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} -
           ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : '—'}
    </strong>
    <span>Horário</span>
  `;

  container.appendChild(horario);

  console.groupEnd();
}

// =====================================================
// AGENDA (NÃO ADMIN)
// =====================================================
function renderAgenda(eventos = []) {
  const agenda = document.getElementById('agenda');
  if (!agenda) return;

  agenda.innerHTML = '';

  if (!eventos.length) {
    agenda.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  eventos.forEach(ev => {
    const cfg = TIPOS_EVENTO[ev.tipo] || {};
    const hora = new Date(ev.data_hora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const card = document.createElement('article');
    card.className = 'agenda-card';

    card.innerHTML = `
      <div class="agenda-icon">
        <i class="iconoir-${cfg.icon || 'calendar'}"></i>
      </div>
      <div class="agenda-content">
        <h4>${cfg.label || ev.tipo}</h4>
        <span>${hora}</span>
        <p>${ev.descricao || ''}</p>
      </div>
    `;

    agenda.appendChild(card);
  });
}

// =====================================================
// OCULTAR AGENDA (ADMIN)
// =====================================================
function ocultarAgenda() {
  const agendaBox = document.getElementById('agendaBox');
  if (agendaBox) agendaBox.style.display = 'none';
}
