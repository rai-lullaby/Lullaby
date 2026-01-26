// =====================================================
// AGENDA TURMA — LULLABY
// =====================================================
import { criarEventoTurma } from './services/eventService.js';

document.addEventListener('DOMContentLoaded', initAgendaTurma);

// =====================================================
// INIT
// =====================================================
function initAgendaTurma() {
  console.group('🧩 initAgendaTurma');

  const form = document.getElementById('formAgendaTurma');
  if (!form) {
    console.warn('⚠️ formAgendaTurma não existe nesta página');
    console.groupEnd();
    return;
  }

  form.addEventListener('submit', onSubmit);
  console.log('✅ Formulário de agenda inicializado');

  console.groupEnd();
}

// =====================================================
// SUBMIT
// =====================================================
async function onSubmit(e) {
  e.preventDefault();

  const payload = montarPayload();
  if (!payload) return;

  try {
    const eventoCriado = await criarEventoTurma(payload);

    console.log('🎉 Evento criado:', eventoCriado);

    document.dispatchEvent(
      new CustomEvent('agenda:eventCreated', {
        detail: eventoCriado
      })
    );

    e.target.reset();
    alert('Evento criado com sucesso 🎉');

  } catch (err) {
    console.error('❌ Erro ao criar evento:', err);
    alert(err.message);
  }
}

// =====================================================
// PAYLOAD
// =====================================================
function montarPayload() {
  const tipo = document.getElementById('tipoEvento')?.value;
  const descricao = document.getElementById('descricao')?.value?.trim();
  const dataHora = document.getElementById('dataHora')?.value;
  const educadorId = document.getElementById('educadorId')?.value || null;

  if (!tipo || !descricao || !dataHora) {
    alert('Preencha todos os campos obrigatórios');
    return null;
  }

  const payload = {
    tipo,
    descricao,
    data_hora: dataHora,
    educador_id: educadorId ? Number(educadorId) : null
  };

  console.log('📦 Payload enviado:', payload);
  return payload;
}
