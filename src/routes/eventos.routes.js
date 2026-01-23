const express = require('express');
const router = express.Router();
const eventos = require('../controllers/eventos.controller');
const auth = require('../middlewares/auth.middleware');

// 🔒 todas protegidas
router.use(auth);

router.post('/eventos', eventos.criarEvento);
router.get('/eventos', eventos.listarPorData);
router.put('/eventos/:id', eventos.atualizarEvento);
router.delete('/eventos/:id', eventos.deletarEvento);

module.exports = router;
