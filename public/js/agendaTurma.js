// =====================================================
// AGENDA DA TURMA — LULLABY
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  inicializarAccordion();
  inicializarFormulario();

  const user = getUser();

  if (!user) return;

  // 🔐 Apenas ADMIN e EDUCADOR podem carregar educadores
  if (['ADMIN', 'EDUCADOR'].includes(user.perfil)) {
    carregarEducadores();
  }
});

// =====================================================
// HELPERS
// =====================================================
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
  const toggle = document.getElementById('toggleAgenda');
  const content = document.getElementById('agendaContent');
  const arrow = toggle?.querySelector('.arrow');

  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    const aberto = content.classList.toggle('open');

    content.style.maxHeight = aberto
      ? content.scrollHeight + 'px'
      : null;

    if (arrow) {
      arrow.style.transform = aberto ? 'rotate(180deg)' : 'rotate(0)';
    }
  });
}

// =====================================================
// EDUCADORES (ADMIN / EDUCADOR)
// =====================================================
async function carregarEducadores() {
  const select = document.getElementById('educadorId');
  if (!select) return;

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/usuarios?perfil=EDUCADOR', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.warn('⚠️ Não foi possível carregar educadores');
      return;
    }

    const educadores = await res.json();

    select.innerHTML = '<option value="">Selecione</option>';

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
  const form = document.getElementById('formAgendaTurma');
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
  const educadorId = document.getElementById('educadorId')?.value;
  const tipo = document.getElementById('tipoEvento')?.value;
  const descricao = document.getElementById('descricao')?.value;
  const dataHora = document.getElementById('dataHora')?.value;

  if (!tipo || !descricao || !dataHora) {
    alert('Preencha todos os campos obrigatórios');
    return null;
  }

  // 👩‍🏫 Educador é opcional dependendo do perfil
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
    return true;

  } catch (err) {
    console.error('❌ Erro ao salvar evento:', err);
    alert('Erro inesperado');
    return false;
  }
}
