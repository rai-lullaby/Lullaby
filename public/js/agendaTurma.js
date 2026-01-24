// =====================================================
// AGENDA DA TURMA
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  inicializarAccordion();
  inicializarFormulario();
  carregarEducadores();
});

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
// CARREGAR EDUCADORES
// =====================================================
async function carregarEducadores() {
  const select = document.getElementById('educadorId');
  if (!select) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/usuarios?perfil=EDUCADOR', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.warn('Erro ao buscar educadores');
      return;
    }

    const educadores = await res.json();

    educadores.forEach(educador => {
      const option = document.createElement('option');
      option.value = educador.id;
      option.textContent = educador.nome;
      select.appendChild(option);
    });

  } catch (err) {
    console.error('Erro ao carregar educadores:', err);
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

    await salvarEvento(payload);
    form.reset();
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

  if (!educadorId || !tipo || !descricao || !dataHora) {
    alert('Preencha todos os campos');
    return null;
  }

  return {
    educador_id: Number(educadorId),
    tipo,
    descricao,
    data_hora: dataHora
  };
}

// =====================================================
// SALVAR EVENTO
// =====================================================
async function salvarEvento(payload) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Sessão expirada');
    return;
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
      return;
    }

    alert('Evento criado com sucesso 🎉');

  } catch (err) {
    console.error('Erro ao salvar evento:', err);
    alert('Erro inesperado');
  }
}
