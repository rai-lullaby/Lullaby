const pool = require('../config/db');

async function canAccessChild(req, res, next) {
  try {
    const { perfil, id: usuarioId } = req.user;
    const { criancaId } = req.params;

    // ADMIN pode tudo
    if (perfil === 'ADMIN') {
      return next();
    }

    // EDUCADOR pode tudo (por enquanto)
    if (perfil === 'EDUCADOR') {
      return next();
    }

    // RESPONSÁVEL → validar vínculo com a criança
    if (perfil === 'RESPONSAVEL') {
      const result = await pool.query(
        `
        SELECT 1
        FROM responsaveis_criancas
        WHERE usuario_id = $1 AND crianca_id = $2
        `,
        [usuarioId, criancaId]
      );

      if (result.rowCount === 0) {
        return res.status(403).json({
          error: 'Você não tem permissão para acessar esta criança'
        });
      }

      return next();
    }

    return res.status(403).json({ error: 'Acesso negado' });

  } catch (err) {
    console.error('Erro canAccessChild:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = canAccessChild;
