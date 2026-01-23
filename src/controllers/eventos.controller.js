const { Evento } = require('../models');

// ➕ Criar evento
exports.criarEvento = async (req, res) => {
  try {
    const evento = await Evento.create({
      ...req.body,
      criadoPor: req.user.id
    });

    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// 📅 Listar eventos por data
exports.listarPorData = async (req, res) => {
  const { data, turmaId } = req.query;

  try {
    const eventos = await Evento.findAll({
      where: { data, turmaId },
      order: [['horaInicio', 'ASC']]
    });

    res.json(eventos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
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
