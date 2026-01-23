const pool = require('../config/db');

// =========================
// CREATE - Criar evento na agenda
// =========================
async function criarEvento(req, res) {
  try {
    const { criancaId } = req.params;
    const { data, descricao } = req.body;
    const usuarioId = req.user.id;

    if (!data || !descricao) {
      return res.status(400).json({
        error: 'Data e descrição são obrigatórias'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO agenda (crianca_id, data, descricao, criado_por)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [criancaId, data, descricao, usuarioId]
    );

    return res.status(201).json({
      message: 'Evento criado com sucesso',
      evento: result.rows[0]
    });

  } catch (err) {
    console.error('Erro criarEvento:', err);
    return res.status(500).json({ error: 'Erro ao criar evento' });
  }
}

// =========================
// READ - Listar agenda por criança
// =========================
async function listarAgendaPorCrianca(req, res) {
  try {
    const { criancaId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        a.id,
        a.data,
        a.descricao,
        u.nome AS criado_por
      FROM agenda a
      JOIN usuarios u ON u.id = a.criado_por
      WHERE a.crianca_id = $1
      ORDER BY a.data DESC
      `,
      [criancaId]
    );

    return res.json(result.rows);

  } catch (err) {
    console.error('Erro listarAgendaPorCrianca:', err);
    return res.status(500).json({ error: 'Erro ao listar agenda' });
  }
}

// =========================
// UPDATE - Atualizar evento
// =========================
async function atualizarEvento(req, res) {
  try {
    const { id } = req.params;
    const { data, descricao } = req.body;

    await pool.query(
      `
      UPDATE agenda
      SET data = $1,
          descricao = $2
      WHERE id = $3
      `,
      [data, descricao, id]
    );

    return res.json({ message: 'Evento atualizado com sucesso' });

  } catch (err) {
    console.error('Erro atualizarEvento:', err);
    return res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
}

// =========================
// DELETE - Remover evento
// =========================
async function deletarEvento(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM agenda WHERE id = $1',
      [id]
    );

    return res.json({ message: 'Evento removido com sucesso' });

  } catch (err) {
    console.error('Erro deletarEvento:', err);
    return res.status(500).json({ error: 'Erro ao remover evento' });
  }
}

// =========================
// EXPORTS
// =========================
module.exports = {
  criarEvento,
  listarAgendaPorCrianca,
  atualizarEvento,
  deletarEvento
};
