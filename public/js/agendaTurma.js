// =====================================================
// AGENDA DA TURMA — LULLABY (REFATORADO FINAL)
// =====================================================

document.addEventListener('DOMContentLoaded', initAgendaTurma);

// =====================================================
// INIT
// =====================================================
function initAgendaTurma() {
  inicializarAccordion();
  inicializarFormulario();

  const user = getUser();
  if (!user) return;

  // 🔐 Apenas ADMIN pode escolher educador
  if (user.perfil === 'ADMIN') {
    carregarEducadores();
  }
}

// =====================================================
// HELPERS
// =====================================================
function el(id) {
  const element = document.getElementById(id);
  if (!element) console.warn(`⚠️ Elemento #${id} não encontrado`);
  return element;
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

    content.style.maxHeight = aberto
      ? `${content.scrollHeight}px`
      : null;

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

  try {
    const res = await fetch('/api/usuarios?perfil=EDUCADOR', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.warn('⚠️ Não foi possível carregar educadores');
      return;
    }

    const educadores = await res.json();

    select.innerHTML = '<option value="">Selecione o educador</option>';

    educadores.forEach(({ id, nome }) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = nome;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('❌ Erro ao carregar educadores:', err);
  }
}

// =====================================================
// FORMULÁRIO
// =====================================================
function inicializarFormulario() {
  const form = el('formAgendaTurma');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = montarPayload();
    if (!payload) return;

    const sucesso = await salvarEvento(payload);
    if (sucesso) form.reset();
  });
}

// =====================================================
// PAYLOAD
// =====================================================
function montarPayload() {
  const educadorId = el('educadorId')?.value || null;
  const tipo = el('tipoEvento')?.value;
  const descricao = el('descricao')?.value?.trim();
  const dataHora = el('dataHora')?.value;

  if (!tipo || !descricao || !dataHora) {
    alert('Preencha todos os campos obrigatórios');
    return null;
  }

  return {
    educador_id: educadorId ? Number(educadorId) : null,
    tipo,
    descricao,
    data_hora: dataHora
  };
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

    if (!res.ok) {
      alert('Erro ao salvar evento');
      return false;
    }

    alert('Evento criado com sucesso 🎉');

    // 🔔 força atualização da agenda do dia
    document.dispatchEvent(
      new CustomEvent('calendar:dateSelected', {
        detail: { date: payload.data_hora }
      })
    );

    return true;
  } catch (err) {
    console.error('❌ Erro ao salvar evento:', err);
    alert('Erro inesperado');
    return false;
  }
}
