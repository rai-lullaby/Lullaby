// ======================================================
// 🔐 LOGIN SCRIPT — DEBUG PASSO A PASSO
// ======================================================

console.group('🚀 [LOGIN] Script carregado');

// ======================================================
// 🧩 DOM
// ======================================================
const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const toggleSenha = document.getElementById('toggleSenha');
const icon = toggleSenha?.querySelector('i');

console.log('📌 DOM carregado:', {
  form: !!form,
  emailInput: !!emailInput,
  senhaInput: !!senhaInput,
  mensagem: !!mensagem,
  toggleSenha: !!toggleSenha
});

// Segurança: script fora da página
if (!form || !emailInput || !senhaInput || !mensagem) {
  console.warn('⚠️ Script de login carregado fora da página correta');
  console.groupEnd();
} else {

  // ======================================================
  // ⚙️ CONFIG
  // ======================================================
  const API_URL = '/api/login';
  console.log('🌐 API_URL definida:', API_URL);

  // ======================================================
  // 📩 SUBMIT LOGIN
  // ======================================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.group('📝 [SUBMIT] Formulário enviado');

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    console.log('1️⃣ Dados capturados:', {
      email,
      senhaPreenchida: !!senha
    });

    // Validação básica
    if (!email || !senha) {
      console.warn('❌ Validação falhou: campos obrigatórios');
      exibirMensagem('Informe email e senha', true);
      console.groupEnd();
      return;
    }

    exibirMensagem('Entrando...', false);
    console.log('2️⃣ Validação OK → iniciando requisição');

    try {
      console.log('3️⃣ Enviando POST para /api/login');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      console.log('4️⃣ Resposta HTTP recebida:', {
        status: response.status,
        ok: response.ok
      });

      let data = null;
      try {
        data = await response.json();
        console.log('5️⃣ JSON parseado com sucesso:', data);
      } catch (parseErr) {
        console.error('❌ Erro ao converter resposta em JSON');
      }

      // ❌ Erro de backend ou autenticação
      if (!response.ok) {
        console.warn('❌ Backend retornou erro:', data);
        exibirMensagem(
          data?.error || 'Erro interno do servidor',
          true
        );
        console.groupEnd();
        return;
      }

      // ❌ Contrato inválido
      if (!data?.token || !data?.user) {
        console.error('❌ Resposta inválida do servidor:', data);
        exibirMensagem('Resposta inválida do servidor', true);
        console.groupEnd();
        return;
      }

      // ✅ Sucesso
      console.log('6️⃣ Login bem-sucedido');
      console.log('👤 Usuário:', data.user);
      console.log('🔑 Token recebido:', data.token);

      // Persistência
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('7️⃣ Dados salvos no localStorage');

      // Redirect
      console.log('8️⃣ Redirecionando para /dashboard.html');
      window.location.href = '/dashboard.html';

      console.groupEnd();

    } catch (err) {
      console.error('🔥 Erro de rede ou execução:', err);
      exibirMensagem('Erro de conexão com o servidor', true);
      console.groupEnd();
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

    console.log('👁️ Toggle senha:', visivel ? 'ocultada' : 'visível');
  });
}

// ======================================================
// 📦 VERSIONAMENTO
// ======================================================
async function carregarVersao() {
  const el = document.getElementById('appVersion');
  if (!el) return;

  console.group('📦 [VERSION]');
  try {
    const res = await fetch('/api/version');
    const data = await res.json();
    el.textContent = data.version || '1.0.x';
    console.log('Versão carregada:', data.version);
  } catch {
    el.textContent = '1.0.x';
    console.warn('⚠️ Não foi possível carregar versão');
  }
  console.groupEnd();
}

carregarVersao();

// ======================================================
// 🧩 HELPERS
// ======================================================
function exibirMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  console.log('📢 Mensagem exibida:', texto);
}

console.groupEnd();
