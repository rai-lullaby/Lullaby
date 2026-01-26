// =====================================================
// DASHBOARD.JS — LULLABY (REFATORADO)
// =====================================================
import { formatDateISO } from './dateUtils.js';

console.group('📊 Dashboard Init');

// =====================================================
// 📌 TIPOS DE EVENTO (FONTE ÚNICA)
// =====================================================
const TIPOS_EVENTO = {
  ENTRADA: {
    label: 'Entrada',
    icon: 'log-in',
    class: 'entry'
  },
  SAIDA: {
    label: 'Saída',
    icon: 'log-out',
    class: 'exit'
  },
  ALIMENTACAO: {
    label: 'Alimentação',
    icon: 'pizza-slice',
    class: 'food'
  },
  SONECA: {
    label: 'Soneca',
    icon: 'bed',
    class: 'sleep'
  },
  ATIVIDADE: {
    label: 'Atividade',
    icon: 'palette',
    class: 'activity'
  },
  RECADO: {
    label: 'Recado',
    icon: 'chat-bubble',
    class: 'message'
  },
  OCORRENCIA: {
    label: 'Ocorrência',
    icon: 'warning-triangle',
    class: 'alert'
  }
};

console.log('📌 TIPOS_EVENTO carregado:', TIPOS_EVENTO);

// =====================================================
// 🧩 HELPERS
// =====================================================
function el(id) {
  const element = document.getElementById(id);
  if (!element) console.warn(`⚠️ Elemento #${id} não encontrado`);
  return element;
}

function safeJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// =====================================================
// 💾 STORAGE
// =====================================================
const token = localStorage.getItem('token');
const user = safeJSONParse(localStorage.getItem('user'));

console.log('🔑 Token:', token ? 'OK' : 'AUSENTE');
console.log('👤 User:', user);

// =====================================================
// 🔒 AUTENTICAÇÃO
// =====================================================
function logout() {
  console.warn('🚪 Logout acionado');
  localStorage.clear();
  window.location.replace('/');
}

function protegerPagina() {
  if (!token || !user) {
    console.error('❌ Token ou usuário ausente');
    logout();
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const agora = Math.floor(Date.now() / 1000);

    console.log('⏱️ JWT exp:', payload.exp, '| agora:', agora);

    if (payload.exp < agora) {
      console.error('⛔ Token expirado');
      logout();
      return false;
    }
  } catch (err) {
    console.error('❌ Erro ao validar token:', err);
    logout();
    return false;
  }

  return true;
}

if (!protegerPagina()) {
  throw new Error('Página protegida');
}

// =====================================================
// 🧾 HEADER
// =====================================================
el('nomeCreche') &&
  (el('nomeCreche').textContent =
    user?.escola?.nome || 'Ambiente Tia Bia');

el('nomeTurma') &&
  (el('nomeTurma').textContent =
    user?.turma?.nome || 'Turma');

el('logoutBtn')?.addEventListener('click', logout);

// =====================================================
// 👥 CONTROLE POR PERFIL
// =====================================================
console.log('👥 Perfil logado:', user.perfil);

const perfilHandlers = {
  ADMIN() {
    console.log('🛠️ Dashboard ADMIN');
    carregarDashboardAdmin();
  },
  EDUCADOR() {
    console.log('🧑‍🏫 Dashboard EDUCADOR');
  },
  RESPONSAVEL() {
    console.log('👨‍👩‍👧 Dashboard RESPONSÁVEL');
  }
};

perfilHandlers[user.perfil]?.();

// =====================================================
// 📊 DASHBOARD ADMIN (mock inicial)
// =====================================================
function carregarDashboardAdmin() {
  el('totalUsuarios') && (el('totalUsuarios').textContent = '12');
  el('totalCriancas') && (el('totalCriancas').textContent = '5');
  el('totalEventos') && (el('totalEventos').textContent = '48');
}

// =====================================================
// 📅 AGENDA — API
// =====================================================
async function carregarAgendaPorData(date) {
  const dataISO = formatDateISO(date);
  if (!dataISO) return;

  console.group(`📅 Carregar agenda ${dataISO}`);

  try {
    const res = await fetch(`/api/eventos?data=${dataISO}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📡 Status:', res.status);

    if (!res.ok) throw new Error('Erro ao buscar eventos');

    const eventos = await res.json();
    console.log('📦 Eventos recebidos:', eventos);

    renderAgenda(eventos);
    atualizarResumoDoDia(eventos);

    document.dispatchEvent(
      new CustomEvent('calendar:markEvents', {
        detail: {
          dates: [...new Set(eventos.map(e =>
            formatDateISO(e.data || e.data_hora)
          ))]
        }
      })
    );
  } catch (err) {
    console.error('❌ Erro agenda:', err);
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
    const hora = new Date(e.hora || e.data_hora).getHours();
    hora < 12 ? periodos.Manhã.push(e) : periodos.Tarde.push(e);
  });

  Object.entries(periodos).forEach(([titulo, lista]) => {
    if (lista.length) {
      const bloco = document.createElement('div');
      bloco.innerHTML = `<h3>${titulo}</h3>`;
      lista.forEach(ev => bloco.appendChild(criarEventoCard(ev)));
      container.appendChild(bloco);
    }
  });
}

// =====================================================
// 🧾 CARD EVENTO
// =====================================================
function criarEventoCard(evento) {
  const config = TIPOS_EVENTO[evento.tipo] || {};

  const hora = new Date(evento.hora || evento.data_hora).toLocaleTimeString(
    'pt-BR',
    { hour: '2-digit', minute: '2-digit' }
  );

  const article = document.createElement('article');
  article.className = `agenda-card ${config.class || 'default'}`;

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
    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;

    const h = new Date(e.hora || e.data_hora);
    if (!inicio || h < inicio) inicio = h;
    if (!fim || h > fim) fim = h;
  });

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
        ? `${inicio.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })} - ${fim.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}`
        : '—'
    }</strong>
    <span>Horário</span>
  `;

  container.appendChild(cardHorario);
}

// =====================================================
// 📆 CALENDÁRIO
// =====================================================
document.addEventListener('calendar:dateSelected', e => {
  console.log('📆 Data selecionada:', e.detail);
  carregarAgendaPorData(e.detail.date || e.detail.dateObj);
});

// =====================================================
// ▶️ INIT
// =====================================================
carregarAgendaPorData(new Date());
console.groupEnd();
