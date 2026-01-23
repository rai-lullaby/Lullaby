const express = require('express');
const router = express.Router();

const {
  criarEvento,
  listarPorData,
  atualizarEvento,
  deletarEvento
} = require('../controllers/eventos.controller');

const auth = require('../middlewares/auth');

// ➕ Criar evento
router.post('/eventos', auth, criarEvento);

// 📅 Listar eventos por data
router.get('/eventos', auth, listarPorData);

// ✏️ Atualizar evento
router.put('/eventos/:id', auth, atualizarEvento);

// ❌ Deletar evento
router.delete('/eventos/:id', auth, deletarEvento);

module.exports = router;
