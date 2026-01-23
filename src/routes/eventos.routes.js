const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');
const auth = require('../middlewares/auth');

// 🔒 todas protegidas
router.use(auth);

router.post('/eventos', eventos.criarEvento);
router.get('/eventos', eventos.listarPorData);
router.put('/eventos/:id', eventos.atualizarEvento);
router.delete('/eventos/:id', eventos.deletarEvento);


// GET /api/eventos?data=YYYY-MM-DD
router.get('/eventos', auth, eventosController.listarPorData);

module.exports = router;



