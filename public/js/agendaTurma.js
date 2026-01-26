// =====================================================
// AGENDA TURMA — LULLABY (REFATORADO + SERVICE)
// =====================================================

import { criarEventoTurma } from './services/eventService.js';

let inicializado = false;

// =====================================================
// INIT CONTROLADO
// =====================================================
export function initAgendaTurma() {
  if (inicializado) {
    console.warn('⚠️ agendaTurma já inicializada');
    return;
  }

  inicializado = true;
  console.group('🧩 agendaTurma Init');

  const form = document.getElementById('formAgendaTurma');

  if (!form) {
    console.log('ℹ️ agendaTurma carregada sem formulário');
    console.groupEnd();
    return;
  }

  form.addEventListener('submit', onSubmit);
  console.log('✅ agendaTurma ativa');
  console.groupEnd();
}

// =====================================================
// SUBMIT
// =====================================================
async function onSubmit(e) {
  e.preventDefault();

  console.group('📝 Criar evento turma');

  const tipo = document.getElementById('tipoEvento')?.value;
  const descricao = document.getElementById('descricao')?.value;
  const dataHora = document.getElementById('dataHora')?.value;
  const educadorId = document.getElementById('educadorId')?.value || null;

  if (!tipo || !dataHora) {
    alert('Preencha os campos obrigatórios');
    console.groupEnd();
    return;
  }

  const payload = {
    tipo,
    descricao,
    data_hora: dataHora,
    educador_id: educadorId ? Number(educadorId) : null
  };

  console.log('📤 Payload:', payload);

  const eventoCriado = await criarEventoTurma(payload);

  if (!eventoCriado) {
    alert('Erro ao criar evento');
    console.groupEnd();
    return;
  }

  console.log('✅ Evento criado:', eventoCriado);

  // 🔔 Notifica o dashboard
  document.dispatchEvent(
    new CustomEvent('evento:criado', {
      detail: eventoCriado
    })
  );

  e.target.reset();
  alert('Evento criado com sucesso 🎉');

  console.groupEnd();
}
