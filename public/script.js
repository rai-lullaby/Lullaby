// ======================================================
// 🔐 LOGIN SCRIPT
// ======================================================

// -------------------------
// DOM
// -------------------------
const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const toggleSenha = document.getElementById('toggleSenha');
const icon = toggleSenha?.querySelector('i');

// Segurança: evita erro fora da página de login
if (!form || !emailInput || !senhaInput || !mensagem) {
  console.warn('⚠️ Script de login carregado fora da página correta');
} else {

  // -------------------------
  // CONFIG
  // -------------------------
  const API_URL = '/api/login';

  // -------------------------
  // SUBMIT LOGIN
  // -------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    // Validação básica
    if (!email || !senha) {
      exibirMensagem('Informe email e senha', true);
      return;
    }

    exibirMensagem('Entrando...', false);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // resposta não-JSON
      }

      // ❌ Erro de autenticação ou servidor
      if (!response.ok) {
        exibirMensagem(
          data?.error || 'Erro interno do servidor',
          true
        );
        return;
      }

      // ✅ Sucesso
      if (!data.token || !data.usuario) {
        exibirMensagem('Resposta inválida do servidor', true);
        return;
      }

      // Persistência
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      // Redirect
      window.location.href = '/dashboard.html';

    } catch (err) {
      console.error('Erro de rede/login:', err);
      exibirMensagem('Erro de conexão com o servidor', true);
    }
  });
}

// ======================================================
// 👁️ TOGGLE VISIBILIDADE DA SENHA
// ======================================================
if (toggleSenha && senhaInput && icon) {
  toggleSenha.addEventListener('click', () => {
    const visivel = senhaInput.type === 'text';

    senhaInput.type = visivel ? 'password' : 'text';
    icon.className = visivel ? 'iconoir-eye' : 'iconoir-eye-off';
  });
}

// ======================================================
// 📦 VERSIONAMENTO
// ======================================================
async function carregarVersao() {
  const el = document.getElementById('appVersion');
  if (!el) return;

  try {
    const res = await fetch('/api/version');
    const data = await res.json();
    el.textContent = data.version || '1.0.x';
  } catch {
    el.textContent = '1.0.x';
  }
}

carregarVersao();

// ======================================================
// 🧩 HELPERS
// ======================================================
function exibirMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
}
