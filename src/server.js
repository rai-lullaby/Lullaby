// =========================
// CONFIGURAÇÕES INICIAIS
// =========================
require('dotenv').config();

const express = require('express');

// =========================
// IMPORTAÇÃO DAS ROTAS
// =========================
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const agendaRoutes = require('./routes/agenda.routes');

const app = express();
app.use(express.json());

// =========================
// LOG DE DEBUG
// =========================
console.log('JWT carregado?', !!process.env.JWT_SECRET);

// =========================
// ROTA DE SAÚDE
// =========================
app.get('/', (req, res) => {
  res.status(200).send('API Lullaby online 🚀');
});

// =========================
// REGISTRO DAS ROTAS
// =========================

// Autenticação
app.use(authRoutes); 
// → /login

// Usuários (CRUD)
app.use('/usuarios', usuariosRoutes);

// Agenda e agenda por criança
app.use(agendaRoutes);

// =========================
// PORTA (RENDER)
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
