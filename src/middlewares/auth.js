const jwt = require('jsonwebtoken');

// =========================
// AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  // Token não enviado
  if (!authHeader) {
    return res.status(401).json({
      error: 'Token de autenticação não informado'
    });
  }

  // Espera formato: Bearer <token>
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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Injeta o usuário decodificado na request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      perfil: decoded.perfil
    };

    return next();
  } catch (err) {
    console.error('❌ Erro no JWT:', err.message);

    return res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }
}

module.exports = auth;
