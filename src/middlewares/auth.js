const jwt = require('jsonwebtoken');

// ======================================================
// 🔐 AUTH MIDDLEWARE
// ======================================================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  // ======================================
  // Token não enviado
  // ======================================
  if (!authHeader) {
    return res.status(401).json({
      error: 'Token de autenticação não informado'
    });
  }

  // Esperado: Bearer <token>
  const [scheme, token] = authHeader.split(' ');

  if (!scheme || !token) {
    return res.status(401).json({
      error: 'Formato de token inválido'
    });
  }

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      error: 'Token mal formatado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================================
    // Injeta usuário autenticado na request
    // ======================================
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
