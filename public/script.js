// =========================
// DOM
// =========================
const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');

// Segurança: evita erro se o script carregar fora da página de login
if (!form || !emailInput || !senhaInput || !mensagem) {
  console.warn('Script de login carregado fora da página correta');
  return;
}

// =========================
// CONFIG
// =========================
const API_URL = '/api/login';

// =========================
// LOGIN
// =========================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  // Validação básica
  if (!email || !senha) {
    mensagem.textContent = 'Informe email e senha';
    mensagem.className = 'mensagem erro';
    return;
  }

  mensagem.textContent = 'Entrando...';
  mensagem.className = 'mensagem';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    // Erro de autenticação
    if (!response.ok) {
      mensagem.textContent = data.error || 'Erro ao fazer login';
      mensagem.className = 'mensagem erro';
      return;
    }

    // =========================
    // SUCESSO
    // =========================
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    console.log('Login OK:', data.user);

    // Redirecionamento garantido
    window.location.href = '/dashboard.html';

  } catch (err) {
    console.error('Erro no login:', err);
    mensagem.textContent = 'Erro de conexão com o servidor';
    mensagem.className = 'mensagem erro';
  }
});
