// =====================================================
// AGENDA TURMA — LULLABY (ESTÁVEL)
// =====================================================

document.addEventListener('DOMContentLoaded', initAgendaTurma);

// =====================================================
// INIT
// =====================================================
function initAgendaTurma() {
  console.group('🧩 initAgendaTurma');

  const user = getUser();
  if (!user) {
    console.warn('Usuário não encontrado no storage');
    console.groupEnd();
    return;
  }

  // Inicializa apenas se existir no DOM
  if (exists('toggleAgenda') && exists('agendaContent')) {
    inicializarAccordion();
  }

  if (exists('formAgendaTurma')) {
    inicializarFormulario();
  }

  // Apenas ADMIN pode carregar educadores
  if (user.perfil === 'ADMIN' && exists('educadorId')) {
    carregarEducadores();
  }

  console.groupEnd();
}

// =====================================================
// HELPERS
// =====================================================
function el(id) {
  return document.getElementById(id);
}

function exists(id) {
  return !!document.getElementById(id);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

// =====================================================
// ACCORDION
// =====================================================
function inicializarAccordion() {
  const toggle = el('toggleAgenda');
  const content = el('agendaContent');
  const arrow = toggle?.querySelector('.arrow');

  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    const aberto = content.classList.toggle('open');
    content.style.maxHeight = aberto ? `${content.scrollHeight}px` : null;

    if (arrow) {
      arrow.style.transform = aberto ? 'rotate(180deg)' : 'rotate(0)';
    }
  });
}

// =====================================================
// EDUCADORES (ADMIN)
// =====================================================
async function carregarEducadores() {
  const select = el('educadorId');
  const token = getToken();
  if (!select || !token) return;

  console.log('👩‍🏫 Carregando educadores');

  try {
    const res = await fetch('/api/usuarios?perfil=EDUCADOR', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Erro ao buscar educadores');

    const educadores = await res.json();

    select.innerHTML =
      '<option value="">Selecione o educador</option>';

    educadores.forEach(({ id, nome }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = nome;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error('Erro ao carregar educadores:', err);
  }
}

// =====================================================
// FORMULÁRIO
// =====================================================
function inicializarFormulario() {
  const form = el('formAgendaTurma');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = montarPayload();
    if (!payload) return;

    const ok = await salvarEvento(payload);
    if (ok) form.reset();
  });
}

// =====================================================
// PAYLOAD
// =====================================================
function montarPayload() {
  const tipo = el('tipoEvento')?.value;
  const descricao = el('descricao')?.value?.trim();
  const dataHora = el('dataHora')?.value;
  const educadorId = el('educadorId')?.value || null;

  if (!tipo || !descricao || !dataHora) {
    alert('Preencha todos os campos obrigatórios');
    return null;
  }

  const payload = {
    tipo,
    descricao,
    data_hora: dataHora
  };

  if (educadorId) {
    payload.educador_id = Number(educadorId);
  }

  console.log('📦 Payload evento:', payload);
  return payload;
}

// =====================================================
// SALVAR EVENTO
// =====================================================
async function salvarEvento(payload) {
  const token = getToken();
  if (!token) {
    alert('Sessão expirada');
    return false;
  }

  try {
    const res = await fetch('/api/eventos/turma', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Erro ao salvar evento');

    const eventoCriado = await res.json();
    console.log('✅ Evento criado:', eventoCriado);

    // 🔄 Atualiza dashboard automaticamente
    document.dispatchEvent(
      new CustomEvent('calendar:dateSelected', {
        detail: { date: payload.data_hora }
      })
    );

    return true;

  } catch (err) {
    console.error('Erro ao salvar evento:', err);
    alert('Erro ao salvar evento');
    return false;
  }
}
