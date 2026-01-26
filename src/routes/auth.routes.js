const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// ======================================================
// 🔐 LOGIN
// POST /api/login
// ======================================================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      error: 'Email e senha são obrigatórios'
    });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.senha,
        u.escola_id,
        u.ativo,
        p.nome AS perfil
      FROM usuarios u
      JOIN perfis p ON p.id = u.perfil_id
      WHERE u.email = $1
      `,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    const user = rows[0];

    if (!user.ativo) {
      return res.status(403).json({
        error: 'Usuário desativado'
      });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha);

    if (!senhaOk) {
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        escola_id: user.escola_id,
        perfil: user.perfil
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        escola_id: user.escola_id
      }
    });

  } catch (err) {
    console.error('🔥 ERRO LOGIN:', err);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
