// =====================================================
// DASHBOARD.JS — LULLABY (REFATORADO)
// =====================================================
import { formatDateISO } from './dateUtils.js';

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

console.log('📦 Token carregado:', !!token);
console.log('👤 User:', user);

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
    const agora = Math.floor(Date.now() / 1000);

    if (payload.exp < agora) {
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
const nomeCrecheEl = el('nomeCreche');
const nomeTurmaEl = el('nomeTurma');

if (nomeCrecheEl) {
  nomeCrecheEl.textContent = user?.creche?.nome || 'Ambiente Tia Bia';
}

if (nomeTurmaEl) {
  nomeTurmaEl.textContent = user?.turma?.nome || 'Turma';
}

const logoutBtn = el('logoutBtn');
logoutBtn && logoutBtn.addEventListener('click', logout);

// =====================================================
// CONTROLE POR PERFIL
// =====================================================
// =====================================================
// CONTROLE POR PERFIL (REFATORADO)
// =====================================================
const perfilHandlers = {
  ADMIN() {
    carregarDashboardAdmin();
  },

  EDUCADOR() {
    mostrarSecao('educador');
  },

  RESPONSAVEL() {
    mostrarSecao('responsavel');
  }
};

function mostrarSecao(id) {
  const section = el(id);
  if (!section) return;
  section.hidden = false;
}

// executa handler do perfil, se existir
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

  console.log('📡 Buscando agenda:', dataISO);

  try {
    const res = await fetch(`/api/eventos?data=${dataISO}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar eventos');

    const eventos = await res.json();

    renderAgenda(eventos);
    atualizarResumoDoDia(eventos);

    // 🔔 avisa calendário para marcar dias
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

  const manha = [];
  const tarde = [];

  eventos.forEach(e => {
    const hora = new Date(e.hora).getHours();
    hora < 12 ? manha.push(e) : tarde.push(e);
  });

  manha.length && container.appendChild(criarPeriodo('Manhã', manha));
  tarde.length && container.appendChild(criarPeriodo('Tarde', tarde));
}

function criarPeriodo(titulo, eventos) {
  const bloco = document.createElement('div');

  const h3 = document.createElement('h3');
  h3.textContent = titulo;
  bloco.appendChild(h3);

  eventos.forEach(e => bloco.appendChild(criarEventoCard(e)));

  return bloco;
}

function criarEventoCard(evento) {
  const article = document.createElement('article');
  article.className = `event ${mapTipo(evento.tipo)}`;

  const hora = new Date(evento.hora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  article.innerHTML = `
    <h4>${evento.tipo}</h4>
    <span>${hora}</span>
    <p>${evento.descricao || ''}</p>
  `;

  return article;
}

function mapTipo(tipo) {
  const map = {
    ALIMENTACAO: 'food',
    SONO: 'sleep',
    BRINCADEIRA: 'play',
    HIGIENE: 'hygiene',
    ATIVIDADE: 'play',
    COMPORTAMENTO: 'behavior'
  };

  return map[tipo] || 'play';
}

// =====================================================
// RESUMO DO DIA — AUTOMÁTICO
// =====================================================
function atualizarResumoDoDia(eventos = []) {
  const resumo = {
    ALIMENTACAO: 0,
    SONO: 0,
    BRINCADEIRA: 0
  };

  let inicio = null;
  let fim = null;

  eventos.forEach(e => {
    resumo[e.tipo] !== undefined && resumo[e.tipo]++;

    const h = new Date(e.hora);
    if (!inicio || h < inicio) inicio = h;
    if (!fim || h > fim) fim = h;
  });

  el('resumoRefeicoes') && (el('resumoRefeicoes').textContent = resumo.ALIMENTACAO);
  el('resumoSono') && (el('resumoSono').textContent = resumo.SONO);
  el('resumoBrincadeiras') && (el('resumoBrincadeiras').textContent = resumo.BRINCADEIRA);

  const horarioEl = el('resumoHorario');
  if (horarioEl && inicio && fim) {
    horarioEl.textContent =
      `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ` +
      `${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (horarioEl) {
    horarioEl.textContent = '—';
  }
}

// =====================================================
// INTEGRAÇÃO COM CALENDÁRIO
// =====================================================
document.addEventListener('calendar:dateSelected', e => {
  carregarAgendaPorData(e.detail.date || e.detail.dateObj);
});

// =====================================================
// INIT — carrega HOJE
// =====================================================
carregarAgendaPorData(new Date());
