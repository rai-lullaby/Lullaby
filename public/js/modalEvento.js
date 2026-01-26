// =====================================================
// MODAL EVENTO — LULLABY
// =====================================================
import { criarEventoTurma } from './services/eventService.js';

const modal = document.getElementById('modalBackdrop');
const form = document.getElementById('formEventoModal');

let eventoEditando = null;

// =====================================================
// OPEN / CLOSE
// =====================================================
function abrirModal(evento = null) {
  eventoEditando = evento;

  modal.classList.add('open');

  if (evento) {
    preencherFormulario(evento);
  } else {
    form.reset();
  }
}

function fecharModal() {
  modal.classList.remove('open');
  eventoEditando = null;
}

// =====================================================
// FORM
// =====================================================
form?.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    tipo: form.tipoEvento.value,
    descricao: form.descricao.value,
    data_hora: form.dataHora.value
  };

  try {
    if (eventoEditando) {
      console.warn('⚠️ UPDATE ainda não implementado no backend');
      alert('Edição ainda não disponível');
      return;
    }

    const evento = await criarEventoTurma(payload);

    document.dispatchEvent(
      new CustomEvent('agenda:eventCreated', {
        detail: evento
      })
    );

    fecharModal();

  } catch (err) {
    alert(err.message);
  }
});

// =====================================================
// FILL
// =====================================================
function preencherFormulario(evento) {
  form.tipoEvento.value = evento.tipo;
  form.descricao.value = evento.descricao;
  form.dataHora.value = evento.data_hora;
}

// =====================================================
// EVENTOS GLOBAIS
// =====================================================
document.addEventListener('agenda:editEvent', e => {
  abrirModal(e.detail);
});

document.getElementById('closeModal')?.addEventListener('click', fecharModal);
