const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');

// Garante que só roda na página de login
if (!form || !mensagem) {
  console.warn('Script de login carregado fora da página correta');
  return;
}

const API_URL = '/api/login';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  mensagem.textContent = 'Entrando...';
  mensagem.className = 'mensagem';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      mensagem.textContent = data.error || 'Erro ao fazer login';
      mensagem.classList.add('erro');
      return;
    }

    // Salva token e usuário
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    console.log('Login OK, dados:', data);

    //REDIRECIONAMENTO GARANTIDO
    window.location.replace('/dashboard.html');

  } catch (err) {
    console.error(err);
    mensagem.textContent = 'Erro de conexão com o servidor';
    mensagem.classList.add('erro');
  }
});
