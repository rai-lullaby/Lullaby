// =====================================================
// EVENT SERVICE — LULLABY
// Camada única de comunicação com API de eventos
// =====================================================

const API_BASE = '/api';

// =====================================================
// 🔐 AUTH
// =====================================================
function getToken() {
  return localStorage.getItem('token');
}

function getHeaders() {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// =====================================================
// 📅 BUSCAR EVENTOS POR DATA (DASHBOARD / CRIANÇA)
// GET /api/eventos?data=YYYY-MM-DD
// =====================================================
export async function buscarEventosPorData(dataISO) {
  console.group('🔌 API → buscarEventosPorData');
  console.log('📆 Data:', dataISO);

  try {
    const res = await fetch(
      `${API_BASE}/eventos?data=${dataISO}`,
      { headers: getHeaders() }
    );

    console.log('📡 Status:', res.status);

    if (!res.ok) {
      console.warn('⚠️ Erro ao buscar eventos');
      return [];
    }

    const eventos = await res.json();

    console.log('📦 Eventos recebidos:', eventos);
    console.groupEnd();

    return eventos;

  } catch (err) {
    console.error('❌ Falha na API de eventos:', err);
    console.groupEnd();
    return [];
  }
}

// =====================================================
// ➕ CRIAR EVENTO PARA TURMA
// POST /api/eventos/turma
// =====================================================
export async function criarEventoTurma(payload) {
  console.group('🔌 API → criarEventoTurma');
  console.log('📤 Payload enviado:', payload);

  try {
    const res = await fetch(
      `${API_BASE}/eventos/turma`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      }
    );

    console.log('📡 Status:', res.status);

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      console.error('❌ Erro ao criar evento:', erro);
      console.groupEnd();
      return null;
    }

    const eventoCriado = await res.json();

    console.log('✅ Evento criado:', eventoCriado);
    console.groupEnd();

    return eventoCriado;

  } catch (err) {
    console.error('❌ Falha ao criar evento:', err);
    console.groupEnd();
    return null;
  }
}

// =====================================================
// ✏️ ATUALIZAR EVENTO (FUTURO)
// PUT /api/eventos/:id
// =====================================================
export async function atualizarEvento(id, payload) {
  console.group('🔌 API → atualizarEvento');
  console.log('🆔 Evento:', id, '📤 Payload:', payload);

  try {
    const res = await fetch(
      `${API_BASE}/eventos/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) return null;

    const eventoAtualizado = await res.json();
    console.log('✅ Evento atualizado:', eventoAtualizado);
    console.groupEnd();

    return eventoAtualizado;

  } catch (err) {
    console.error('❌ Falha ao atualizar evento:', err);
    console.groupEnd();
    return null;
  }
}
