import { formatDateISO } from './dateUtils.js';

/* =====================================================
 DASHBOARD.JS — LULLABY
===================================================== */

/* =====================================================
 HELPERS
===================================================== */
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

/* =====================================================
 STORAGE
===================================================== */
const token = localStorage.getItem('token');
const user = safeJSONParse(localStorage.getItem('user'));

console.log('📦 Token carregado:', !!token);
console.log('👤 User:', user);

/* =====================================================
 🔒 PROTEÇÃO DA PÁGINA
===================================================== */
function logout() {
  console.warn('🚪 Logout');
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
      console.warn('⏰ Token expirado');
      logout();
      return false;
    }
  } catch (err) {
    console.error('❌ Token inválido', err);
    logout();
    return false;
  }

  return true;
}

if (!protegerPagina()) {
  throw new Error('Página protegida');
}

/* =====================================================
 HEADER — CRECHE + TURMA
===================================================== */
const nomeCrecheEl = el('nomeCreche');
const nomeTurmaEl = el('nomeTurma');

if (nomeCrecheEl) {
  nomeCrecheEl.textContent =
    user?.creche?.nome || 'Ambiente Tia Bia';
}

if (nomeTurmaEl) {
  nomeTurmaEl.textContent =
    user?.turma?.nome || 'Turma';
}

const logoutBtn = el('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

/* =====================================================
 CONTROLE POR PERFIL
===================================================== */
console.log('🎭 Perfil:', user.perfil);

if (user.perfil === 'ADMIN') {
  const admin = el('admin');
  if (admin) {
    admin.hidden = false;
    carregarDashboardAdmin();
  }
}

if (user.perfil === 'EDUCADOR') {
  const educador = el('educador');
  if (educador) educador.hidden = false;
}

if (user.perfil === 'RESPONSAVEL') {
  const responsavel = el('responsavel');
  if (responsavel) responsavel.hidden = false;
}

/* =====================================================
 DASHBOARD ADMIN (mock)
===================================================== */
function carregarDashboardAdmin() {
  el('totalUsuarios') && (el('totalUsuarios').textContent = '12');
  el('totalCriancas') && (el('totalCriancas').textContent = '5');
  el('totalEventos') && (el('totalEventos').textContent = '48');
}

/* =====================================================
 AGENDA — API
===================================================== */
async function carregarAgendaPorData(date) {
  const dataISO = formatDateISO(date);
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
  } catch (err) {
    console.error('❌ Erro agenda:', err);
    renderAgenda([]);
  }
}

/* =====================================================
 RENDER AGENDA (MANHÃ / TARDE)
===================================================== */
function renderAgenda(eventos) {
  const container =
    el('agendaEducador') || el('agendaResponsavel');

  if (!container) return;

  container.innerHTML = '';

  if (!eventos || !eventos.length) {
    container.innerHTML = '<p>📭 Nenhum evento para este dia</p>';
    return;
  }

  const manha = [];
  const tarde = [];

  eventos.forEach(e => {
    const hora = new Date(e.hora).getHours();
    hora < 12 ? manha.push(e) : tarde.push(e);
  });

  if (manha.length) {
    container.appendChild(criarPeriodo('Manhã', manha));
  }

  if (tarde.length) {
    container.appendChild(criarPeriodo('Tarde', tarde));
  }
}

function criarPeriodo(titulo, eventos) {
  const bloco = document.createElement('div');

  const h3 = document.createElement('h3');
  h3.textContent = titulo;
  bloco.appendChild(h3);

  eventos.forEach(e => {
    bloco.appendChild(criarEventoCard(e));
  });

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
    APRENDIZADO: 'learn'
  };

  return map[tipo] || 'play';
}

/* =====================================================
 INTEGRAÇÃO COM CALENDÁRIO
===================================================== */
document.addEventListener('calendar:dateSelected', e => {
  const date = e.detail.date;
  console.log('📅 Data selecionada:', date);
  carregarAgendaPorData(date);
});

/* =====================================================
 INIT — carrega hoje
===================================================== */
carregarAgendaPorData(new Date());

/* =====================================================
 RESUMO DO DIA — AUTOMÁTICO
===================================================== */
function atualizarResumoDoDia(eventos) {
  const resumo = {
    ALIMENTACAO: 0,
    SONO: 0,
    BRINCADEIRA: 0
  };

  let horaInicio = null;
  let horaFim = null;

  eventos.forEach(e => {
    if (resumo[e.tipo] !== undefined) {
      resumo[e.tipo]++;
    }

    const horaEvento = new Date(e.hora);

    if (!horaInicio || horaEvento < horaInicio) {
      horaInicio = horaEvento;
    }

    if (!horaFim || horaEvento > horaFim) {
      horaFim = horaEvento;
    }
  });

  // Atualiza cards
  el('resumoRefeicoes') && (el('resumoRefeicoes').textContent = resumo.ALIMENTACAO);
  el('resumoSono') && (el('resumoSono').textContent = resumo.SONO);
  el('resumoBrincadeiras') && (el('resumoBrincadeiras').textContent = resumo.BRINCADEIRA);

  // Horário
  const horarioEl = el('resumoHorario');
  if (horarioEl && horaInicio && horaFim) {
    const inicio = horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fim = horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    horarioEl.textContent = `${inicio} - ${fim}`;
  } else if (horarioEl) {
    horarioEl.textContent = '—';
  }
}

