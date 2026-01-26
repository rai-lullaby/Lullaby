const pool = require('../config/db');

async function canAccessChild(req, res, next) {
  try {
    const { perfil, id: usuarioId, escola_id } = req.user;
    const { criancaId } = req.params;

    if (!criancaId) {
      return res.status(400).json({ error: 'criancaId é obrigatório' });
    }

    // ======================================
    // 🔒 Valida se a criança pertence à escola
    // ======================================
    const criancaCheck = await pool.query(
      `
      SELECT id, turma_id
      FROM criancas
      WHERE id = $1 AND escola_id = $2
      `,
      [criancaId, escola_id]
    );

    if (!criancaCheck.rowCount) {
      return res.status(404).json({
        error: 'Criança não encontrada'
      });
    }

    const { turma_id } = criancaCheck.rows[0];

    // ======================================
    // 👑 ADMIN → acesso total (da escola)
    // ======================================
    if (perfil === 'ADMIN') {
      return next();
    }

    // ======================================
    // 👩‍🏫 EDUCADOR → somente turmas vinculadas
    // ======================================
    if (perfil === 'EDUCADOR') {
      const educadorCheck = await pool.query(
        `
        SELECT 1
        FROM educadores_turmas
        WHERE educador_id = $1
          AND turma_id = $2
        `,
        [usuarioId, turma_id]
      );

      if (!educadorCheck.rowCount) {
        return res.status(403).json({
          error: 'Educador sem acesso a esta criança'
        });
      }

      return next();
    }

    // ======================================
    // 👨‍👩‍👧 RESPONSÁVEL → vínculo direto
    // ======================================
    if (perfil === 'RESPONSAVEL') {
      const responsavelCheck = await pool.query(
        `
        SELECT 1
        FROM responsaveis_criancas
        WHERE responsavel_id = $1
          AND crianca_id = $2
        `,
        [usuarioId, criancaId]
      );

      if (!responsavelCheck.rowCount) {
        return res.status(403).json({
          error: 'Você não tem permissão para acessar esta criança'
        });
      }

      return next();
    }

    // ======================================
    // ❌ Perfil desconhecido
    // ======================================
    return res.status(403).json({ error: 'Acesso negado' });

  } catch (err) {
    console.error('Erro canAccessChild:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = canAccessChild;
