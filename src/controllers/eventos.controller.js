const pool = require('../config/db');

// ======================================================
// ➕ Criar evento
// POST /eventos
// ADMIN ou EDUCADOR
// ======================================================
async function criarEvento(req, res) {
  const {
    crianca_id,
    tipo_evento_id,
    descricao,
    data_hora
  } = req.body;

  const { id: educadorId, escola_id, perfil } = req.user;

  if (!crianca_id || !tipo_evento_id || !data_hora) {
    return res.status(400).json({
      error: 'crianca_id, tipo_evento_id e data_hora são obrigatórios'
    });
  }

  if (!['ADMIN', 'EDUCADOR'].includes(perfil)) {
    return res.status(403).json({
      error: 'Sem permissão para criar eventos'
    });
  }

  try {
    // 🔒 valida criança + escola
    const criancaCheck = await pool.query(
      `
      SELECT id
      FROM criancas
      WHERE id = $1 AND escola_id = $2
      `,
      [crianca_id, escola_id]
    );

    if (!criancaCheck.rowCount) {
      return res.status(404).json({
        error: 'Criança não encontrada'
      });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO eventos_agenda (
        escola_id,
        crianca_id,
        tipo_evento_id,
        descricao,
        data_hora,
        educador_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        escola_id,
        crianca_id,
        tipo_evento_id,
        descricao || null,
        data_hora,
        educadorId
      ]
    );

    return res.status(201).json(rows[0]);

  } catch (err) {
    console.error('Erro ao criar evento:', err);
    return res.status(500).json({ error: 'Erro ao criar evento' });
  }
}

// ======================================================
// 📅 Listar eventos por data
// GET /eventos?data=YYYY-MM-DD
// ======================================================
async function listarPorData(req, res) {
  const { data } = req.query;
  const { escola_id } = req.user;

  if (!data) {
    return res.status(400).json({
      error: 'Parâmetro "data" é obrigatório (YYYY-MM-DD)'
    });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        e.id,
        e.crianca_id,
        c.nome AS crianca,
        te.nome AS tipo,
        e.descricao,
        e.data_hora,
        u.nome AS educador
      FROM eventos_agenda e
      JOIN criancas c ON c.id = e.crianca_id
      JOIN tipos_evento te ON te.id = e.tipo_evento_id
      JOIN usuarios u ON u.id = e.educador_id
      WHERE e.escola_id = $1
        AND DATE(e.data_hora) = $2
      ORDER BY e.data_hora ASC
      `,
      [escola_id, data]
    );

    return res.json(rows);

  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    return res.status(500).json({
      error: 'Erro interno ao buscar eventos'
    });
  }
}

// ======================================================
// ✏️ Atualizar evento
// PUT /eventos/:id
// ADMIN ou EDUCADOR
// ======================================================
async function atualizarEvento(req, res) {
  const { id } = req.params;
  const {
    tipo_evento_id,
    descricao,
    data_hora
  } = req.body;

  const { escola_id, perfil } = req.user;

  if (!['ADMIN', 'EDUCADOR'].includes(perfil)) {
    return res.status(403).json({
      error: 'Sem permissão para atualizar eventos'
    });
  }

  try {
    const { rows } = await pool.query(
      `
      UPDATE eventos_agenda
      SET
        tipo_evento_id = COALESCE($1, tipo_evento_id),
        descricao = COALESCE($2, descricao),
        data_hora = COALESCE($3, data_hora)
      WHERE id = $4
        AND escola_id = $5
      RETURNING *
      `,
      [
        tipo_evento_id || null,
        descricao || null,
        data_hora || null,
        id,
        escola_id
      ]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Evento não encontrado'
      });
    }

    return res.json(rows[0]);

  } catch (err) {
    console.error('Erro ao atualizar evento:', err);
    return res.status(500).json({
      error: 'Erro ao atualizar evento'
    });
  }
}

// ======================================================
// ❌ Deletar evento
// DELETE /eventos/:id
// ADMIN
// ======================================================
async function deletarEvento(req, res) {
  const { id } = req.params;
  const { escola_id, perfil } = req.user;

  if (perfil !== 'ADMIN') {
    return res.status(403).json({
      error: 'Somente ADMIN pode excluir eventos'
    });
  }

  try {
    const { rowCount } = await pool.query(
      `
      DELETE FROM eventos_agenda
      WHERE id = $1 AND escola_id = $2
      `,
      [id, escola_id]
    );

    if (!rowCount) {
      return res.status(404).json({
        error: 'Evento não encontrado'
      });
    }

    return res.json({ sucesso: true });

  } catch (err) {
    console.error('Erro ao deletar evento:', err);
    return res.status(500).json({
      error: 'Erro ao deletar evento'
    });
  }
}

// ======================================================
// 📦 Exports
// ======================================================
module.exports = {
  criarEvento,
  listarPorData,
  atualizarEvento,
  deletarEvento
};
