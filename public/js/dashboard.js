// =====================================================
// DASHBOARD.JS — LULLABY 
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
  EDUCADOR() {
    mostrarSecao('educador');
  },
  RESPONSAVEL() {
    mostrarSecao('responsavel');
  }
};

function mostrarSecao(id) {
  const section = el(id);
  if (section) section.hidden = false;
}

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

// =====================================================
// CARD DE EVENTO — ICONOIR
// =====================================================
function criarEventoCard(evento) {
  const article = document.createElement('article');

  const tipoClass = mapTipo(evento.tipo);
  const icon = mapIcon(evento.tipo);

  const hora = new Date(evento.hora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  article.className = `agenda-card ${tipoClass}`;

  article.innerHTML = `
    <div class="agenda-icon">
      <i class="iconoir-${icon}"></i>
    </div>
    <div class="agenda-content">
      <h4>${formatTipoLabel(evento.tipo)}</h4>
      <span class="agenda-time">${hora}</span>
      <p>${evento.descricao || ''}</p>
    </div>
  `;

  return article;
}

// =====================================================
// MAPAS (TIPO → COR / ÍCONE / LABEL)
// =====================================================
function mapTipo(tipo) {
  return {
    ALIMENTACAO: 'food',
    SONO: 'sleep',
    BRINCADEIRA: 'play',
    HIGIENE: 'hygiene',
    APRENDIZADO: 'learn',
    ENTRADA: 'play',
    SAIDA: 'play'
  }[tipo] || 'play';
}

function mapIcon(tipo) {
  return {
    ALIMENTACAO: 'fork-spoon',
    SONO: 'moon-sat',
    BRINCADEIRA: 'gamepad',
    HIGIENE: 'droplet',
    APRENDIZADO: 'graduation-cap',
    ENTRADA: 'log-in',
    SAIDA: 'log-out'
  }[tipo] || 'calendar';
}

function formatTipoLabel(tipo) {
  return {
    ALIMENTACAO: 'Alimentação',
    SONO: 'Soneca',
    BRINCADEIRA: 'Brincadeiras',
    HIGIENE: 'Higiene',
    APRENDIZADO: 'Aprendizado',
    ENTRADA: 'Entrada',
    SAIDA: 'Saída'
  }[tipo] || tipo;
}

// =====================================================
// RESUMO DO DIA
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
  el('resumoBrincadeiras') &&
    (el('resumoBrincadeiras').textContent = resumo.BRINCADEIRA);

  const horarioEl = el('resumoHorario');
  horarioEl &&
    (horarioEl.textContent =
      inicio && fim
        ? `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : '—');
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
