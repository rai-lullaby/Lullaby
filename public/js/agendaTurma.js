// =====================================================
// AGENDA DA TURMA — LULLABY
// Responsabilidade: criar evento para turma
// =====================================================

document.addEventListener('DOMContentLoaded', initAgendaTurma);

// =====================================================
// INIT
// =====================================================
function initAgendaTurma() {
  console.group('🧩 initAgendaTurma');

  inicializarAccordion();
  inicializarFormulario();

  const user = getUser();
  if (!user) {
    console.warn('⚠️ Usuário não encontrado no storage');
    console.groupEnd();
    return;
  }

  // ADMIN pode escolher educador
  if (user.perfil === 'ADMIN') {
    carregarEducadores();
  }

  console.groupEnd();
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
// ACCORDION (UI apenas)
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
// EDUCADORES (somente ADMIN)
// =====================================================
async function carregarEducadores() {
  const select = el('educadorId');
  const token = getToken();

  if (!select || !token) return;

  console.group('👩‍🏫 Carregar educadores');

  try {
    const res = await fetch('/api/usuarios?perfil=EDUCADOR', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.warn('⚠️ Não foi possível carregar educadores');
      console.groupEnd();
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

    console.log('✅ Educadores carregados:', educadores.length);

  } catch (err) {
    console.error('❌ Erro ao carregar educadores:', err);
  }

  console.groupEnd();
}

// =====================================================
// FORMULÁRIO
// =====================================================
function inicializarFormulario() {
  const form = el('formAgendaTurma');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.group('📝 Submit evento turma');

    const payload = montarPayload();
    if (!payload) {
      console.groupEnd();
      return;
    }

    const sucesso = await salvarEvento(payload);
    if (sucesso) {
      form.reset();
    }

    console.groupEnd();
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

  return {
    tipo,
    descricao,
    data_hora: dataHora,
    educador_id: educadorId ? Number(educadorId) : null
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

  console.group('📡 POST /api/eventos/turma');
  console.log('Payload:', payload);

  try {
    const res = await fetch('/api/eventos/turma', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);

    if (!res.ok) {
      alert('Erro ao salvar evento');
      console.groupEnd();
      return false;
    }

    alert('Evento criado com sucesso 🎉');

    // 🔔 avisa o dashboard para atualizar agenda
    document.dispatchEvent(
      new CustomEvent('calendar:dateSelected', {
        detail: { date: payload.data_hora }
      })
    );

    console.groupEnd();
    return true;

  } catch (err) {
    console.error('❌ Erro ao salvar evento:', err);
    alert('Erro inesperado');
    console.groupEnd();
    return false;
  }
}
