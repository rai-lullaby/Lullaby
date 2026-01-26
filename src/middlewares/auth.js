const jwt = require('jsonwebtoken');

// ======================================================
// 🔐 AUTH MIDDLEWARE
// ======================================================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  // --------------------------------------
  // Token não enviado
  // --------------------------------------
  if (!authHeader) {
    return res.status(401).json({
      error: 'Token de autenticação não informado'
    });
  }

  // Esperado: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({
      error: 'Formato de token inválido'
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      error: 'Token mal formatado'
    });
  }

  if (!token) {
    return res.status(401).json({
      error: 'Token ausente'
    });
  }

  // --------------------------------------
  // Validação de ambiente
  // --------------------------------------
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET não configurado');
    return res.status(500).json({
      error: 'Erro de configuração do servidor'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --------------------------------------
    // Usuário autenticado
    // --------------------------------------
    req.user = {
      id: decoded.id,
      escola_id: decoded.escola_id,
      perfil: decoded.perfil
    };

    return next();

  } catch (err) {
    console.error('❌ Erro no JWT:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    return res.status(401).json({
      error: 'Token inválido'
    });
  }
}

module.exports = auth;
