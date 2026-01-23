// =========================
// CONFIGURAÇÕES INICIAIS
// =========================
require('dotenv').config();

const express = require('express');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const agendaRoutes = require('./routes/agenda.routes');

const app = express();
app.use(express.json());

// =========================
// MIDDLEWARES GLOBAIS
// =========================
app.use(express.json());

// =========================
// SERVIR FRONTEND (PUBLIC)
// =========================
app.use(express.static(path.join(__dirname, '../public')));

// =========================
// ROTAS DA API (PREFIXO /api)
// =========================
app.use('/api', authRoutes);          // /api/login
app.use('/api/usuarios', usuariosRoutes);
app.use('/api', agendaRoutes);

// =========================
// FALLBACK (SPA / LOGIN)
// =========================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// =========================
// PORTA (RENDER)
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// =========================
// LOG DE DEBUG
// =========================
console.log('JWT carregado?', !!process.env.JWT_SECRET);

// =========================
// ROTA DE SAÚDE (API)
// =========================
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API Lullaby online 🚀' });
});


