// ======================================================
// 🔐 AUTHORIZE MIDDLEWARE
// Verifica se o perfil do usuário é permitido
// ======================================================
function authorize(perfisPermitidos = []) {
  if (!Array.isArray(perfisPermitidos)) {
    throw new Error('authorize espera um array de perfis');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    const { perfil } = req.user;

    if (!perfil) {
      return res.status(403).json({
        error: 'Perfil do usuário não encontrado'
      });
    }

    if (perfisPermitidos.length && !perfisPermitidos.includes(perfil)) {
      return res.status(403).json({
        error: 'Acesso negado para este perfil'
      });
    }

    return next();
  };
}

module.exports = authorize;
