// =====================================================
// EVENT SERVICE — API LAYER
// =====================================================

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await res.json().catch(() => null);

  console.group('🔌 API EVENTOS');
  console.log('URL:', url);
  console.log('Status:', res.status);
  console.log('Payload:', data);
  console.groupEnd();

  if (!res.ok) {
    throw new Error(data?.error || 'Erro na API');
  }

  return data;
}

// =====================================================
// API PÚBLICA
// =====================================================
export async function getEventosPorData(dataISO) {
  return request(`/api/eventos?data=${dataISO}`);
}

export async function criarEventoTurma(payload) {
  return request('/api/eventos/turma', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
