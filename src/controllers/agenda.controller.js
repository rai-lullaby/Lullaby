const pool = require('../config/db');

/**
 * LISTAR AGENDA POR CRIANÇA
 * GET /criancas/:criancaId/agenda
 */
async function listarAgendaPorCrianca(req, res) {
  const { criancaId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.tipo,
        e.descricao,
        e.data_hora,
        u.nome AS educador
      FROM eventos_agenda e
      JOIN usuarios u ON u.id = e.educador_id
      WHERE e.crianca_id = $1
      ORDER BY e.data_hora DESC
      `,
      [Number(criancaId)]
    );

    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('Erro listarAgendaPorCrianca:', err);
    return res.status(500).json({
      error: 'Erro ao listar agenda'
    });
  }
}

/**
 * CRIAR EVENTO NA AGENDA
 * POST /criancas/:criancaId/agenda
 * (ADMIN ou EDUCADOR)
 */
async function criarEventoAgenda(req, res) {
  const { criancaId } = req.params;
  const { tipo, descricao, data_hora } = req.body;
  const educadorId = req.user.id;

  try {
    if (!tipo || !data_hora) {
      return res.status(400).json({
        error: 'Tipo e data_hora são obrigatórios'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO eventos_agenda
        (crianca_id, educador_id, tipo, descricao, data_hora)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        Number(criancaId),
        educadorId,
        tipo,
        descricao || null,
        data_hora
      ]
    );

    return res.status(201).json({
      message: 'Evento criado com sucesso',
      evento: result.rows[0]
    });

  } catch (err) {
    console.error('Erro criarEventoAgenda:', err);
    return res.status(500).json({
      error: 'Erro ao criar evento na agenda'
    });
  }
}

module.exports = {
  listarAgendaPorCrianca,
  criarEventoAgenda
};
