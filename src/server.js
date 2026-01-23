// =========================
// CONFIGURAÇÕES INICIAIS
// =========================
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

const auth = require('./middlewares/auth');
const authorize = require('./middlewares/authorize');

const app = express();
app.use(express.json());

// =========================
// LOG DE DEBUG
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
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.senha,
        p.nome AS perfil
      FROM usuarios u
      JOIN usuarios_perfis up ON up.usuario_id = u.id
      JOIN perfis p ON p.id = up.perfil_id
      WHERE u.email = $1
    `, [email]);

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    const user = result.rows[0];

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) {
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        perfil: user.perfil
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
    );

    return res.status(200).json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
      },
      token
    });

  } catch (err) {
    console.error('Erro no POST /login:', err);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =========================
// ROTAS PROTEGIDAS
// =========================

// ADMIN + EDUCADOR
app.get(
  '/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  (req, res) => {
    res.json({
      message: 'Agenda carregada com sucesso',
      user: req.user
    });
  }
);

// SOMENTE ADMIN
app.get(
  '/admin',
  auth,
  authorize(['ADMIN']),
  (req, res) => {
    res.send('Área administrativa');
  }
);

// ===============
