const express = require('express');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const canAccessChild = require('../middlewares/canAccessChild');
const agendaController = require('../controllers/agenda.controller');

const router = express.Router();
// Teste
router.get(
  '/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  async (req, res) => {
    res.json({ message: 'Agenda geral (em construção)' });
  }
);

// Criar evento
router.post(
  '/criancas/:criancaId/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  canAccessChild,
  agendaController.criarEvento
);

// Listar agenda
router.get(
  '/criancas/:criancaId/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR', 'RESPONSAVEL']),
  canAccessChild,
  agendaController.listarAgendaPorCrianca
);

// Atualizar evento
router.put(
  '/agenda/:id',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  agendaController.atualizarEvento
);

// Deletar evento
router.delete(
  '/agenda/:id',
  auth,
  authorize(['ADMIN']),
  agendaController.deletarEvento
);

module.exports = router;

