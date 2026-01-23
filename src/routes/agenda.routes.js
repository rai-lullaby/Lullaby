const express = require('express');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const canAccessChild = require('../middlewares/canAccessChild');
const agendaController = require('../controllers/agenda.controller');

const router = express.Router();

// =========================
// AGENDA GERAL (ADMIN / EDUCADOR)
// =========================
router.get(
  '/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  async (req, res) => {
    res.json({ message: 'Agenda geral (em construção)' });
  }
);

// =========================
// LISTAR AGENDA POR CRIANÇA
// GET /criancas/:criancaId/agenda
// =========================
router.get(
  '/criancas/:criancaId/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR', 'RESPONSAVEL']),
  canAccessChild,
  agendaController.listarAgendaPorCrianca
);

// =========================
// CRIAR EVENTO NA AGENDA
// POST /criancas/:criancaId/agenda
// =========================
router.post(
  '/criancas/:criancaId/agenda',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  canAccessChild,
  agendaController.criarEventoAgenda
);

// =========================
// (FUTURO) ATUALIZAR EVENTO
// PUT /agenda/:id
// =========================
router.put(
  '/agenda/:id',
  auth,
  authorize(['ADMIN', 'EDUCADOR']),
  async (req, res) => {
    res.status(501).json({ error: 'Atualização de evento não implementada' });
  }
);

// =========================
// (FUTURO) DELETAR EVENTO
// DELETE /agenda/:id
// =========================
router.delete(
  '/agenda/:id',
  auth,
  authorize(['ADMIN']),
  async (req, res) => {
    res.status(501).json({ error: 'Remoção de evento não implementada' });
  }
);

module.exports = router;
