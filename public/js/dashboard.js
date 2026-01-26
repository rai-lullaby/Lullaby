// =====================================================
// DASHBOARD.JS — LULLABY 
// =====================================================
import { formatDateISO } from './dateUtils.js';

console.group('📊 Dashboard Init');

// =====================================================
// 🎨 TIPOS DE EVENTO (ICONOIR)
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

console.log('🎨 Iconoir mapeado:', TIPOS_EVENTO);

// =====================================================
// 🧩 HELPERS
// =====================================================
const el = id => document.getElementById(id);

const safeJSONParse = value => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// =====================================================
// 💾 STORAGE
// =====================================================
const token = localStorage.getItem('token');
const user = safeJSONParse(localStorage.getItem('user'));

console.log('🔑 Token:', !!token);
console.log('👤 User:', user);

// =====================================================
// 🔒 AUTENTICAÇÃO
// =====================================================
function logout() {
  localStorage.clear();
  window.location.replace('/');
}

function protegerPagina() {
  if (!token || !user) return logout();

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) return logout();
  } catch {
    return logout();
  }
}

protegerPagina();

// =====================================================
// 🧾 HEADER
// =====================================================
if (el('nomeCreche')) {
  el('nomeCreche').textContent = user?.escola?.nome || 'Ambiente Tia Bia';
}

if (el('nomeTurma')) {
  el('nomeTurma').textContent = user?.turma?.nome || 'Turma';
}

el('logoutBtn')?.addEventListener('click', logout);

// =====================================================
// 📊 DASHBOARD ADMIN (placeholder)
// =====================================================
if (user.perfil === 'ADMIN') {
  el('totalUsuarios') && (el('totalUsuarios').textContent = '—');
  el('totalCriancas') && (el('totalCriancas').textContent = '—');
  el('totalEventos') && (el('totalEventos').textContent = '—');
}

// =====================================================
// 📅 AGENDA — API
// =====================================================
async function carregarAgendaPorData(date) {
  const dataISO = formatDateISO(date);
  if (!dataISO) return;

  console.group(`📅 Agenda ${dataISO}`);

  try {
    const res = await fetch(`/api/eventos?data=${dataISO}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Erro API');

    const eventos = await res.json();
    console.log('🧪 Contrato API:', eventos);

    const normalizados = eventos
      .map(normalizarEvento)
      .filter(Boolean);

    renderAgenda(normalizados);
    atualizarResumoDoDia(normalizados);

    document.dispatchEvent(
      new CustomEvent('calendar:markEvents', {
        detail: {
          dates: [...new Set(
            normalizados.map(e => formatDateISO(e.data_hora))
          )]
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
// 🧪 NORMALIZAÇÃO (CONTRATO REAL)
// =====================================================
function normalizarEvento(e) {
  if (!e?.tipo || !e?.data_hora) {
    console.warn('Evento inválido ignorado:', e);
    return null;
  }

  return {
    id: e.id,
    tipo: e.tipo,
    descricao: e.descricao || '',
    data_hora: e.data_hora,
    educador_id: e.educador_id || null
  };
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
    (hora < 12 ? periodos.Manhã : periodos.Tarde).push(e);
  });

  Object.entries(periodos).forEach(([titulo, lista]) => {
    if (!lista.length) return;

    const bloco = document.createElement('div');
    bloco.innerHTML = `<h3>${titulo}</h3>`;

    lista.forEach(ev => {
      bloco.appendChild(criarEventoCard(ev));
    });

    container.appendChild(bloco);
  });
}

// =====================================================
// 🧾 CARD EVENTO (ICONOIR)
// =====================================================
function criarEventoCard(evento) {
  const cfg = TIPOS_EVENTO[evento.tipo] || {};
  const hora = new Date(evento.data_hora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const article = document.createElement('article');
  article.className = `agenda-card ${cfg.class || 'default'}`;

  article.innerHTML = `
    <div class="agenda-icon">
      <i class="iconoir-${cfg.icon || 'calendar'}"></i>
    </div>
    <div class="agenda-content">
      <h4>${cfg.label || evento.tipo}</h4>
      <span class="agenda-time">${hora}</span>
      <p>${evento.descricao}</p>
    </div>
  `;

  return article;
}

// =====================================================
// 📊 RESUMO DO DIA (ICONOIR)
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  const container = document.querySelector('.summary');
  if (!container) return;

  container.innerHTML = '';

  const contagem = {};
  let inicio, fim;

  eventos.forEach(e => {
    contagem[e.tipo] = (contagem[e.tipo] || 0) + 1;
    const h = new Date(e.data_hora);
    if (!inicio || h < inicio) inicio = h;
    if (!fim || h > fim) fim = h;
  });

  Object.entries(TIPOS_EVENTO).forEach(([tipo, cfg]) => {
    const card = document.createElement('div');
    card.className = `card ${cfg.class}`;

    card.innerHTML = `
      <i class="iconoir-${cfg.icon}"></i>
      <strong>${contagem[tipo] || 0}</strong>
      <span>${cfg.label}</span>
    `;

    container.appendChild(card);
  });

  const horario = document.createElement('div');
  horario.className = 'card time';

  horario.innerHTML = `
    <i class="iconoir-clock"></i>
    <strong>${
      inicio && fim
        ? `${inicio.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
           - ${fim.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`
        : '—'
    }</strong>
    <span>Horário</span>
  `;

  container.appendChild(horario);
}

// =====================================================
// 📆 EVENTO GLOBAL (SEM RELOAD)
// =====================================================
document.addEventListener('calendar:dateSelected', e => {
  carregarAgendaPorData(e.detail.date || e.detail.dateObj);
});

// =====================================================
// ▶️ INIT
// =====================================================
carregarAgendaPorData(new Date());
console.groupEnd();
