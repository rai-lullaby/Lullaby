// =========================
// CONFIGURAÇÕES INICIAIS
// =========================
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

const app = express();
app.use(express.json());

// =========================
// LOG DE DEBUG (opcional)
// =========================
console.log('JWT carregado?', !!process.env.JWT_SECRET);

// =========================
// ROTA DE SAÚDE
// =========================
app.get('/', (req, res) => {
  res.status(200).send('API Lullaby online 🚀');
});

// =========================
// LOGIN REAL (JWT + POSTGRES)
// =========================
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const user = result.rows[0];
    const senhaOk = await bcrypt.compare(senha, user.senha);

    if (!senhaOk) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =========================
// MIDDLEWARE DE AUTENTICAÇÃO
// =========================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// =========================
// ROTA PROTEGIDA (EXEMPLO)
// =========================
app.get('/agenda', auth, (req, res) => {
  res.json({
    message: 'Agenda carregada com sucesso',
    user: req.user
  });
});

// =========================
// PORTA (RENDER)
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
