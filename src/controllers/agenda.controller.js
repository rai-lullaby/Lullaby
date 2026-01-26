const pool = require('../config/db');

/**
 * LISTAR AGENDA POR CRIANÇA
 * GET /criancas/:criancaId/agenda
 * ADMIN, EDUCADOR (turma), RESPONSÁVEL (sua criança)
 */
async function listarAgendaPorCrianca(req, res) {
  const { criancaId } = req.params;
  const { escola_id, perfil, id: usuarioId } = req.user;

  try {
    // 🔒 garante que a criança pertence à escola
    const criancaCheck = await pool.query(
      `
      SELECT id
      FROM criancas
      WHERE id = $1 AND escola_id = $2
      `,
      [Number(criancaId), escola_id]
    );

    if (criancaCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Criança não encontrada' });
    }

    const result = await pool.query(
      `
      SELECT
        e.id,
        te.nome AS tipo,
        e.descricao,
        e.data_hora,
        u.nome AS educador
      FROM eventos_agenda e
      JOIN tipos_evento te ON te.id = e.tipo_evento_id
      JOIN usuarios u ON u.id = e.educador_id
      WHERE e.crianca_id = $1
        AND e.escola_id = $2
      ORDER BY e.data_hora DESC
      `,
      [Number(criancaId), escola_id]
    );

    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('Erro listarAgendaPorCrianca:', err);
    return res.status(500).json({ error: 'Erro ao listar agenda' });
  }
}

/**
 * CRIAR EVENTO NA AGENDA
 * POST /criancas/:criancaId/agenda
 * ADMIN ou EDUCADOR
 */
async function criarEventoAgenda(req, res) {
  const { criancaId } = req.params;
  const { tipo_evento_id, descricao, data_hora } = req.body;
  const { id: educadorId, escola_id, perfil } = req.user;

  try {
    if (!tipo_evento_id || !data_hora) {
      return res.status(400).json({
        error: 'tipo_evento_id e data_hora são obrigatórios'
      });
    }

    if (!['ADMIN', 'EDUCADOR'].includes(perfil)) {
      return res.status(403).json({
        error: 'Sem permissão para criar eventos'
      });
    }

    // 🔒 valida criança + escola
    const crianca = await pool.query(
      `
      SELECT id
      FROM criancas
      WHERE id = $1 AND escola_id = $2
      `,
      [Number(criancaId), escola_id]
    );

    if (crianca.rowCount === 0) {
      return res.status(404).json({
        error: 'Criança não encontrada'
      });
    }

    const result = await pool.query(
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
        Number(criancaId),
        tipo_evento_id,
        descricao || null,
        data_hora,
        educadorId
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
