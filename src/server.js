require('dotenv').config();

const express = require('express');

const app = express();

// Middleware básico
app.use(express.json());

// Rota de saúde (teste rápido)
app.get('/', (req, res) => {
  res.status(200).send('API Lullaby online 🚀');
});

// 🚨 PORTA CERTA PARA O RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

console.log('JWT carregado?', !!process.env.JWT_SECRET);
