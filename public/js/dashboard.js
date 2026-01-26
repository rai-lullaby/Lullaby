// =====================================================
// DASHBOARD.JS — LULLABY 
// =====================================================
import { formatDateISO } from './dateUtils.js';

// =====================================================
// CONFIGURAÇÃO GLOBAL
// =====================================================
const TIPOS_EVENTO = {
  ENTRADA: {
    label: 'Entradas',
    icon: 'log-in',
    class: 'play'
  },
  SAIDA: {
    label: 'Saídas',
    icon: 'log-out',
    class: 'play'
  },
  ALIMENTACAO: {
    label: 'Refeições',
    icon: 'pizza-slice',
    class: 'food'
  },
  SONO: {
    label: 'Sonecas',
    icon: 'moon-sat',
    class: 'sleep'
  },
  BRINCADEIRA: {
    label: 'Brincadeiras',
    icon: 'gamepad',
    class: 'play'
  },
  HIGIENE: {
    label: 'Higiene',
    icon: 'droplet',
    class: 'hygiene'
  },
  APRENDIZADO: {
    label: 'Aprendizado',
    icon: 'graduation-cap',
    class: 'learn'
  }
};

// =====================================================
// HELPERS
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
// STORAGE
// =====================================================
const token = localStorage.getItem('token');
const user = safeJSONParse(localStorage.getItem('user'));

// =====================================================
// 🔒 AUTENTICAÇÃO
// =====================================================
function logout() {
  localStorage.clear();
  window.location.replace('/');
}

function protegerPagina() {
  if (!token || !user) {
    logout();
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      logout();
      return false;
    }
  } catch {
    logout();
    return false;
  }

  return true;
}

if (!protegerPagina()) {
  throw new Error('Página protegida');
}

// =====================================================
// HEADER — CRECHE + TURMA
// =====================================================
el('nomeCreche') &&
  (el('nomeCreche').textContent =
    user?.creche?.nome || 'Ambiente Tia Bia');

el('nomeTurma') &&
  (el('nomeTurma').textContent =
    user?.turma?.nome || 'Turma');

el('logoutBtn')?.addEventListener('click', logout);

// =====================================================
// CONTROLE POR PERFIL
// =====================================================
const perfilHandlers = {
  ADMIN() {
    carregarDashboardAdmin();
  },
  EDUCADOR() {},
  RESPONSAVEL() {}
};

perfilHandlers[user.perfil]?.();

// =====================================================
// DASHBOARD ADMIN (mock)
// =====================================================
function carregarDashboardAdmin() {
  el('totalUsuarios') && (el('totalUsuarios').textContent = '12');
  el('totalCriancas') && (el('totalCriancas').textContent = '5');
  el('totalEventos') && (el('totalEventos').textContent = '48');
}

// =====================================================
// AGENDA — API
// =====================================================
async function carregarAgendaPorData(date) {
  const dataISO = formatDateISO(date);
  if (!dataISO) return;

  try {
    const res = await fetch(`/api/eventos?data=${dataISO}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Erro ao buscar eventos');

    const eventos = await res.json();

    renderAgenda(eventos);
    atualizarResumoDoDia(eventos);

    document.dispatchEvent(
      new CustomEvent('calendar:markEvents', {
        detail: {
          dates: [...new Set(eventos.map(e => formatDateISO(e.data || e.hora)))]
        }
      })
    );
  } catch (err) {
    console.error('❌ Erro agenda:', err);
    renderAgenda([]);
    atualizarResumoDoDia([]);
  }
}

// =====================================================
// RENDER AGENDA (MANHÃ / TARDE)
// =====================================================
function renderAgenda(eventos = []) {
  const container = el('agenda');
  if (!container) return;

  container.innerHTML = '';

  if (!eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  const periodos = {
    Manhã: [],
    Tarde: []
  };

  eventos.forEach(e => {
    const hora = new Date(e.hora || e.data_hora).getHours();
    hora < 12 ? periodos.Manhã.push(e) : periodos.Tarde.push(e);
  });

  Object.entries(periodos).forEach(([titulo, lista]) => {
    if (lista.length) {
      container.appendChild(criarPeriodo(titulo, lista));
    }
  });
}

function criarPeriodo(titulo, eventos) {
  const bloco = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.textContent = titulo;
  bloco.appendChild(h3);

  eventos.forEach(e => bloco.appendChild(criarEventoCard(e)));
  return bloco;
}

// =====================================================
// CARD DE EVENTO
// =====================================================
function criarEventoCard(evento) {
  const config = TIPOS_EVENTO[evento.tipo] || {};
  const article = document.createElement('article');

  const hora = new Date(evento.hora || evento.data_hora).toLocaleTimeString(
    'pt-BR',
    { hour: '2-digit', minute: '2-digit' }
  );

  article.className = `agenda-card ${config.class || 'play'}`;

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
// RESUMO DO DIA — DINÂMICO
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

  // Horário
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
// INTEGRAÇÃO COM CALENDÁRIO
// =====================================================
document.addEventListener('calendar:dateSelected', e => {
  carregarAgendaPorData(e.detail.date || e.detail.dateObj);
});

// =====================================================
// INIT
// =====================================================
carregarAgendaPorData(new Date());
