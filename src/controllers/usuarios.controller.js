const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// =========================
// CREATE - Criar usuário
// =========================
async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const userResult = await pool.query(
      `INSERT INTO usuarios (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [nome, email, senhaHash]
    );

    const usuarioId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO usuarios_perfis (usuario_id, perfil_id)
       VALUES ($1, (SELECT id FROM perfis WHERE nome = $2))`,
      [usuarioId, perfil]
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userResult.rows[0],
      perfil
    });

  } catch (err) {
    console.error('Erro criarUsuario:', err);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

// =========================
// READ - Listar usuários
// =========================
async function listarUsuarios(req, res) {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nome, u.email, p.nome AS perfil
      FROM usuarios u
      JOIN usuarios_perfis up ON up.usuario_id = u.id
      JOIN perfis p ON p.id = up.perfil_id
    `);

    return res.json(result.rows);

  } catch (err) {
    console.error('Erro listarUsuarios:', err);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

// =========================
// READ - Buscar usuário por ID
// =========================
async function buscarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT u.id, u.nome, u.email, p.nome AS perfil
      FROM usuarios u
      JOIN usuarios_perfis up ON up.usuario_id = u.id
      JOIN perfis p ON p.id = up.perfil_id
      WHERE u.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error('Erro buscarUsuarioPorId:', err);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

// =========================
// UPDATE - Atualizar usuário
// =========================
async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, senha, perfil } = req.body;

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      await pool.query(
        'UPDATE usuarios SET senha = $1 WHERE id = $2',
        [senhaHash, id]
      );
    }

    if (nome || email) {
      await pool.query(
        'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3',
        [nome, email, id]
      );
    }

    if (perfil) {
      await pool.query(
        `UPDATE usuarios_perfis
         SET perfil_id = (SELECT id FROM perfis WHERE nome = $1)
         WHERE usuario_id = $2`,
        [perfil, id]
      );
    }

    return res.json({ message: 'Usuário atualizado com sucesso' });

  } catch (err) {
    console.error('Erro atualizarUsuario:', err);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

// =========================
// DELETE - Remover usuário
// =========================
async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM usuarios_perfis WHERE usuario_id = $1', [id]);
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    return res.json({ message: 'Usuário removido com sucesso' });

  } catch (err) {
    console.error('Erro deletarUsuario:', err);
    return res.status(500).json({ error: 'Erro ao remover usuário' });
  }
}

// =========================
// EXPORTS
// =========================
module.exports = {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario
};
