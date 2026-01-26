const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// ======================================================
// ➕ Criar usuário
// POST /usuarios
// ADMIN
// ======================================================
async function criarUsuario(req, res) {
  const { nome, cpf, email, senha, perfil } = req.body;
  const { escola_id, perfil: perfilLogado } = req.user;

  if (perfilLogado !== 'ADMIN') {
    return res.status(403).json({ error: 'Sem permissão para criar usuários' });
  }

  if (!nome || !cpf || !email || !senha || !perfil) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const { rows } = await pool.query(
      `
      INSERT INTO usuarios (
        escola_id,
        nome,
        cpf,
        email,
        senha,
        perfil_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        (SELECT id FROM perfis WHERE nome = $6)
      )
      RETURNING id, nome, email, cpf
      `,
      [escola_id, nome, cpf, email, senhaCriptografada, perfil]
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: rows[0],
      perfil
    });

  } catch (err) {
    console.error('Erro criarUsuario:', err);

    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Email ou CPF já cadastrado'
      });
    }

    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

// ======================================================
// 📋 Listar usuários da escola
// GET /usuarios
// ADMIN
// ======================================================
async function listarUsuarios(req, res) {
  const { escola_id, perfil } = req.user;

  if (perfil !== 'ADMIN') {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.cpf,
        p.nome AS perfil,
        u.ativo
      FROM usuarios u
      JOIN perfis p ON p.id = u.perfil_id
      WHERE u.escola_id = $1
      ORDER BY u.nome
      `,
      [escola_id]
    );

    return res.json(rows);

  } catch (err) {
    console.error('Erro listarUsuarios:', err);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

// ======================================================
// 🔍 Buscar usuário por ID
// GET /usuarios/:id
// ADMIN
// ======================================================
async function buscarUsuarioPorId(req, res) {
  const { id } = req.params;
  const { escola_id, perfil } = req.user;

  if (perfil !== 'ADMIN') {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.cpf,
        p.nome AS perfil,
        u.ativo
      FROM usuarios u
      JOIN perfis p ON p.id = u.perfil_id
      WHERE u.id = $1
        AND u.escola_id = $2
      `,
      [id, escola_id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(rows[0]);

  } catch (err) {
    console.error('Erro buscarUsuarioPorId:', err);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

// ======================================================
// ✏️ Atualizar usuário
// PUT /usuarios/:id
// ADMIN
// ======================================================
async function atualizarUsuario(req, res) {
  const { id } = req.params;
  const { nome, email, senha, perfil: novoPerfil, ativo } = req.body;
  const { escola_id, perfil } = req.user;

  if (perfil !== 'ADMIN') {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  try {
    if (senha) {
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      await pool.query(
        `
        UPDATE usuarios
        SET senha = $1
        WHERE id = $2 AND escola_id = $3
        `,
        [senhaCriptografada, id, escola_id]
      );
    }

    await pool.query(
      `
      UPDATE usuarios
      SET
        nome = COALESCE($1, nome),
        email = COALESCE($2, email),
        ativo = COALESCE($3, ativo),
        perfil_id = COALESCE(
          (SELECT id FROM perfis WHERE nome = $4),
          perfil_id
        )
      WHERE id = $5
        AND escola_id = $6
      `,
      [
        nome || null,
        email || null,
        ativo ?? null,
        novoPerfil || null,
        id,
        escola_id
      ]
    );

    return res.json({ message: 'Usuário atualizado com sucesso' });

  } catch (err) {
    console.error('Erro atualizarUsuario:', err);

    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Email ou CPF já cadastrado'
      });
    }

    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

// ======================================================
// ❌ Desativar usuário (soft delete)
// DELETE /usuarios/:id
// ADMIN
// ======================================================
async function deletarUsuario(req, res) {
  const { id } = req.params;
  const { escola_id, perfil } = req.user;

  if (perfil !== 'ADMIN') {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  try {
    const { rowCount } = await pool.query(
      `
      UPDATE usuarios
      SET ativo = false
      WHERE id = $1 AND escola_id = $2
      `,
      [id, escola_id]
    );

    if (!rowCount) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json({ message: 'Usuário desativado com sucesso' });

  } catch (err) {
    console.error('Erro deletarUsuario:', err);
    return res.status(500).json({ error: 'Erro ao remover usuário' });
  }
}

// ======================================================
// 📦 Exports
// ======================================================
module.exports = {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario
};
