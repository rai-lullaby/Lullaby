// =========================
// CONFIGURAÇÕES INICIAIS
// =========================
require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();

// =========================
// MIDDLEWARES GLOBAIS
// =========================
app.use(express.json());

// =========================
// SERVIR FRONTEND (PUBLIC)
// =========================
// Login em: https://seu-dominio.onrender.com/
app.use(express.static(path.join(__dirname, '../public')));

// =========================
// IMPORTAÇÃO DAS ROTAS
// =========================
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const agendaRoutes = require('./routes/agenda.routes');

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

// =========================
// REGISTRO DAS ROTAS DA API
// =========================

// Auth → POST /api/login
app.use('/api', authRoutes);

// Usuários → /api/usuarios
app.use('/api/usuarios', usuariosRoutes);

// Agenda → /api/agenda | /api/criancas/:id/agenda
app.use('/api', agendaRoutes);

// =========================
// FALLBACK PARA FRONTEND
// =========================
// Qualquer rota que não seja /api/*
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
