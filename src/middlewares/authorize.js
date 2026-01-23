function authorize(perfisPermitidos = []) {
  return (req, res, next) => {
    const { perfil } = req.user || {};

    if (!perfil) {
      return res.status(403).json({
        error: 'Perfil do usuário não encontrado'
      });
    }

    if (!perfisPermitidos.includes(perfil)) {
      return res.status(403).json({
        error: 'Acesso negado para este perfil'
      });
    }

    next();
  };
}

module.exports = authorize;
