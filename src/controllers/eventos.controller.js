const { Evento } = require('../models');
const db = require('../db');


// ➕ Criar evento
exports.criarEvento = async (req, res) => {
  const {
    crianca_id,
    educador_id,
    tipo,
    descricao,
    data,
    hora
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO eventos_agenda
      (crianca_id, educador_id, tipo, descricao, data, hora)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [crianca_id, educador_id, tipo, descricao, data, hora]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
};


// 📅 Listar eventos por data - GET /api/eventos?data=YYYY-MM-DD
async function listarPorData(req, res) {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        error: 'Parâmetro "data" é obrigatório (YYYY-MM-DD)'
      });
    }

    console.log('📅 Buscando eventos da data:', data);

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

module.exports = {
  listarPorData
};

// ✏️ Atualizar evento
exports.atualizarEvento = async (req, res) => {
  const { id } = req.params;

  try {
    await Evento.update(req.body, { where: { id } });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// ❌ Remover evento
exports.deletarEvento = async (req, res) => {
  const { id } = req.params;

  try {
    await Evento.destroy({ where: { id } });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};




