const db = require('../db');

// ======================================================
// ➕ Criar evento
// ======================================================
async function criarEvento(req, res) {
  const {
    crianca_id,
    educador_id,
    tipo,
    descricao,
    data,
    hora
  } = req.body;

  if (!crianca_id || !tipo || !data) {
    return res.status(400).json({
      error: 'crianca_id, tipo e data são obrigatórios'
    });
  }

  try {
    const query = `
      INSERT INTO eventos_agenda
      (crianca_id, educador_id, tipo, descricao, data, hora)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      crianca_id,
      educador_id || null,
      tipo,
      descricao || null,
      data,
      hora || null
    ];

    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('❌ Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
}

// ======================================================
// 📅 Listar eventos por data
// GET /api/eventos?data=YYYY-MM-DD
// ======================================================
async function listarPorData(req, res) {
  const { data } = req.query;

  if (!data) {
    return res.status(400).json({
      error: 'Parâmetro "data" é obrigatório (YYYY-MM-DD)'
    });
  }

  try {
    const query = `
      SELECT
        id,
        crianca_id,
        educador_id,
        tipo,
        descricao,
        data,
        hora
      FROM eventos_agenda
      WHERE data = $1
      ORDER BY hora ASC
    `;

    const { rows } = await db.query(query, [data]);

    res.json(rows);

  } catch (err) {
    console.error('❌ Erro ao buscar eventos:', err);
    res.status(500).json({ error: 'Erro interno ao buscar eventos' });
  }
}

// ======================================================
// ✏️ Atualizar evento
// ======================================================
async function atualizarEvento(req, res) {
  const { id } = req.params;
  const { tipo, descricao, data, hora, educador_id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do evento é obrigatório' });
  }

  try {
    const query = `
      UPDATE eventos_agenda
      SET
        tipo = COALESCE($1, tipo),
        descricao = COALESCE($2, descricao),
        data = COALESCE($3, data),
        hora = COALESCE($4, hora),
        educador_id = COALESCE($5, educador_id)
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      tipo,
      descricao,
      data,
      hora,
      educador_id,
      id
    ];

    const { rows } = await db.query(query, values);

    if (!rows.length) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('❌ Erro ao atualizar evento:', err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
}

// ======================================================
// ❌ Deletar evento
// ======================================================
async function deletarEvento(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID do evento é obrigatório' });
  }

  try {
    const query = `
      DELETE FROM eventos_agenda
      WHERE id = $1
      RETURNING id
    `;

    const { rows } = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({ sucesso: true });

  } catch (err) {
    console.error('❌ Erro ao deletar evento:', err);
    res.status(500).json({ error: 'Erro ao deletar evento' });
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
