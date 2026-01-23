require('dotenv').config();

const express = require('express');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const agendaRoutes = require('./routes/agenda.routes');

const app = express();
app.use(express.json());

// =========================
// SERVE O FRONTEND
// =========================
app.use(express.static(path.join(__dirname, '../public')));

// =========================
// ROTAS DA API
// =========================
app.use('/api', authRoutes);                 // /api/login
app.use('/api/usuarios', usuariosRoutes);
app.use('/api', agendaRoutes);

// =========================
// HEALTH CHECK
// =========================
app.get('/api/health', (req, res) => {
  res.json({ status: 'API Lullaby online 🚀' });
});

// =========================
// FALLBACK SPA
// =========================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// =========================
// PORTA
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
