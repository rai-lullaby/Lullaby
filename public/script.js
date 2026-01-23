const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');

// Usa rota relativa da API
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
      headers: {
        'Content-Type': 'application/json'
      },
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

    mensagem.textContent = `Bem-vindo(a), ${data.user.nome}!`;
    mensagem.classList.add('sucesso');

    // Redirecionar após login
    // window.location.href = '/dashboard.html';

  } catch (err) {
    mensagem.textContent = 'Erro de conexão com o servidor';
    mensagem.classList.add('erro');
  }
});
