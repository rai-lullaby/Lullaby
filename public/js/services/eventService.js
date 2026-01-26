// =====================================================
// EVENT SERVICE — LULLABY
// Centraliza chamadas da API de eventos
// =====================================================

const BASE_HEADERS = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// =====================================================
// 🔍 Buscar eventos por data (AGENDA)
// GET /api/eventos?data=YYYY-MM-DD
// =====================================================
export async function buscarEventosPorData(dataISO) {
  console.group('📡 API EVENTOS');
  console.log('URL:', `/api/eventos?data=${dataISO}`);

  const res = await fetch(`/api/eventos?data=${dataISO}`, {
    headers: BASE_HEADERS()
  });

  console.log('Status:', res.status);

  if (!res.ok) {
    console.groupEnd();
    throw new Error('Erro ao buscar eventos');
  }

  const payload = await res.json();
  console.log('Payload:', payload);
  console.groupEnd();

  return payload;
}

// =====================================================
// ➕ Criar evento para turma
// POST /api/eventos/turma
// =====================================================
export async function criarEventoTurma(payload) {
  console.group('📡 API CRIAR EVENTO');

  const res = await fetch('/api/eventos/turma', {
    method: 'POST',
    headers: BASE_HEADERS(),
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);

  if (!res.ok) {
    console.groupEnd();
    throw new Error('Erro ao criar evento');
  }

  const evento = await res.json();
  console.log('Evento criado:', evento);
  console.groupEnd();

  return evento;
}
