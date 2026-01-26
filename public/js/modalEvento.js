// =====================================================
// MODAL EVENTO — LULLABY (API INTEGRADA)
// =====================================================

const modal = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const campoDinamico = document.getElementById('campoDinamico');
const form = document.getElementById('formEventoModal');

let modoAtual = 'child'; // child | class

// =====================================================
// BOTÕES
// =====================================================
document.getElementById('btnNovoEvento')?.addEventListener('click', () => {
  abrirModal('child');
});

document.getElementById('btnEventoTurma')?.addEventListener('click', () => {
  abrirModal('class');
});

document.getElementById('closeModal')?.addEventListener('click', fecharModal);
document.getElementById('cancelModal')?.addEventListener('click', fecharModal);

// =====================================================
// MODAL
// =====================================================
function abrirModal(modo) {
  modoAtual = modo;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  if (modo === 'class') {
    modalTitle.textContent = 'Novo Evento para Turma';
    campoDinamico.innerHTML = `
      <label for="modalTurma">Turma</label>
      <select id="modalTurma" required>
        <option value="">Selecione a turma</option>
      </select>
    `;
    carregarTurmas();
  } else {
    modalTitle.textContent = 'Novo Evento';
    campoDinamico.innerHTML = `
      <label for="modalCrianca">Criança</label>
      <select id="modalCrianca" required>
        <option value="">Selecione a criança</option>
      </select>
    `;
    carregarCriancas();
  }
}

function fecharModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  form.reset();
  campoDinamico.innerHTML = '';
}

// =====================================================
// FORM SUBMIT
// =====================================================
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = montarPayload();
  if (!payload) return;

  const sucesso = await salvarEvento(payload);
  if (sucesso) {
    fecharModal();

    // 🔄 atualiza agenda do dia
    document.dispatchEvent(
      new CustomEvent('calendar:dateSelected', {
        detail: { date: payload.data_hora }
      })
    );
  }
});

// =====================================================
// PAYLOAD
// =====================================================
function montarPayload() {
  const tipo = document.getElementById('modalTipoEvento')?.value;
  const inicio = document.getElementById('modalInicio')?.value;
  const fim = document.getElementById('modalFim')?.value;
  const descricao = document.getElementById('modalDescricao')?.value;

  if (!tipo || !inicio) {
    alert('Preencha os campos obrigatórios');
    return null;
  }

  const payload = {
    tipo,
    descricao,
    data_hora: inicio
  };

  if (fim) payload.data_hora_fim = fim;

  if (modoAtual === 'class') {
    const turmaId = document.getElementById('modalTurma')?.value;
    if (!turmaId) {
      alert('Selecione a turma');
      return null;
    }
    payload.turma_id = Number(turmaId);
  } else {
    const criancaId = document.getElementById('modalCrianca')?.value;
    if (!criancaId) {
      alert('Selecione a criança');
      return null;
    }
    payload.crianca_id = Number(criancaId);
  }

  return payload;
}

// =====================================================
// API
// =====================================================
async function salvarEvento(payload) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Sessão expirada');
    return false;
  }

  const endpoint =
    modoAtual === 'class'
      ? '/api/eventos/turma'
      : '/api/eventos';

  try {
    const res = await fetch(endpoint, {
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

// =====================================================
// DADOS DINÂMICOS
// =====================================================
async function carregarCriancas() {
  const select = document.getElementById('modalCrianca');
  const token = localStorage.getItem('token');
  if (!select || !token) return;

  try {
    const res = await fetch('/api/criancas', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const criancas = await res.json();
    criancas.forEach(({ id, nome }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = nome;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

async function carregarTurmas() {
  const select = document.getElementById('modalTurma');
  const token = localStorage.getItem('token');
  if (!select || !token) return;

  try {
    const res = await fetch('/api/turmas', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const turmas = await res.json();
    turmas.forEach(({ id, nome }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = nome;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}
