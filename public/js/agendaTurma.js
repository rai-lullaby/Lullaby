// =====================================================
// AGENDA TURMA — LULLABY
// Inicialização controlada externamente
// =====================================================

let inicializado = false;

export function initAgendaTurma() {
  if (inicializado) {
    console.warn('⚠️ agendaTurma já inicializada — ignorando');
    return;
  }

  console.group('🧩 agendaTurma');
  inicializado = true;

  const form = document.getElementById('formAgendaTurma');

  if (!form) {
    console.log('ℹ️ agendaTurma pronta (modo passivo)');
    console.groupEnd();
    return;
  }

  form.addEventListener('submit', onSubmit);
  console.log('✅ agendaTurma ativa (formulário conectado)');
  console.groupEnd();
}

// =====================================================
// SUBMIT
// =====================================================
async function onSubmit(e) {
  e.preventDefault();

  console.log('📝 Submit agendaTurma');

}
