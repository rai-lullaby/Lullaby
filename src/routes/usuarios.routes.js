const express = require('express');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const usuariosController = require('../controllers/usuarios.controller');

const router = express.Router();

router.post('/', auth, authorize(['ADMIN']), usuariosController.criarUsuario);
router.get('/', auth, authorize(['ADMIN']), usuariosController.listarUsuarios);
router.get('/:id', auth, authorize(['ADMIN']), usuariosController.buscarUsuarioPorId);
router.put('/:id', auth, authorize(['ADMIN']), usuariosController.atualizarUsuario);
router.delete('/:id', auth, authorize(['ADMIN']), usuariosController.deletarUsuario);

module.exports = router;
