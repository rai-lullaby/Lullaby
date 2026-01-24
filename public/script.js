// =========================
// DOM
// =========================
const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const toggleSenha = document.getElementById('toggleSenha');

console.group('🔐 Login Script Init');
console.log('Form:', form);
console.log('Email input:', emailInput);
console.log('Senha input:', senhaInput);
console.log('Mensagem:', mensagem);
console.groupEnd();

// Segurança: evita erro se script carregar fora da página de login
if (!form || !emailInput || !senhaInput || !mensagem) {
  console.warn('⚠️ Script de login carregado fora da página correta');
} else {

  // =========================
  // CONFIG
  // =========================
  const API_URL = '/api/login';
  console.log('🌐 API_URL configurada:', API_URL);

  // =========================
  // LOGIN
  // =========================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.group('➡️ Submit do formulário');

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    console.log('📧 Email digitado:', email);
    console.log('🔑 Senha digitada:', senha ? '*** preenchida ***' : 'vazia');

    // Validação básica
    if (!email || !senha) {
      console.warn('❌ Validação falhou: campos vazios');
      mensagem.textContent = 'Informe email e senha';
      mensagem.className = 'mensagem erro';
      console.groupEnd();
      return;
    }

    mensagem.textContent = 'Entrando...';
    mensagem.className = 'mensagem';
    console.log('⏳ Enviando requisição de login...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      console.log('📡 Resposta recebida:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Payload da resposta:', data);

      // Erro de autenticação
      if (!response.ok) {
        console.warn('❌ Login inválido');
        mensagem.textContent = data.error || 'Erro ao fazer login';
        mensagem.className = 'mensagem erro';
        console.groupEnd();
        return;
      }

      // =========================
      // SUCESSO
      // =========================
      console.log('✅ Login bem-sucedido');
      console.log('👤 Usuário:', data.user);
      console.log('🪪 Token JWT:', data.token);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('💾 Token e usuário salvos no localStorage');

      // Redirecionamento garantido
      console.log('➡️ Redirecionando para /dashboard.html');
      window.location.href = '/dashboard.html';

      console.groupEnd();

    } catch (err) {
      console.error('🔥 Erro inesperado no login:', err);
      mensagem.textContent = 'Erro de conexão com o servidor';
      mensagem.className = 'mensagem erro';
      console.groupEnd();
    }
  });
}

// =========================
// VERSIONAMENTO
// =========================
async function carregarVersao() {
  console.group('📦 Versionamento');
  try {
    const res = await fetch('/api/version');
    console.log('Resposta /api/version:', res.status);

    const data = await res.json();
    console.log('Versão recebida:', data.version);

    const el = document.getElementById('appVersion');
    if (el) el.textContent = data.version;

  } catch (err) {
    console.warn('⚠️ Não foi possível carregar versão, usando fallback');
    const el = document.getElementById('appVersion');
    if (el) el.textContent = '1.0.x';
  }
  console.groupEnd();
}

const senhaInput = document.getElementById('senha');
const toggleSenha = document.getElementById('toggleSenha');
const icon = toggleSenha.querySelector('i');

toggleSenha.addEventListener('click', () => {
  const visivel = senhaInput.type === 'text';

  senhaInput.type = visivel ? 'password' : 'text';

  icon.className = visivel
    ? 'iconoir-eye'
    : 'iconoir-eye-off';
});


carregarVersao();


