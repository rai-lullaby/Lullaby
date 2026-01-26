// =====================================================
// AGENDA TURMA — LULLABY (ESTÁVEL)
// =====================================================

console.group('🧩 agendaTurma');

// =====================================================
// EVENTOS GLOBAIS
// =====================================================

/**
 * Escuta quando um evento de turma é criado pelo modal
 * Disparado pelo modalEvento.js
 */
document.addEventListener('evento:turmaCriado', (e) => {
  console.log('📥 Evento de turma criado:', e.detail);

  const { data_hora } = e.detail || {};
  if (!data_hora) return;

  // Atualiza dashboard e agenda automaticamente
  document.dispatchEvent(
    new CustomEvent('calendar:dateSelected', {
      detail: { date: data_hora }
    })
  );
});

console.log('✅ agendaTurma pronta (modo passivo)');
console.groupEnd();
