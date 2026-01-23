module.exports = (sequelize, DataTypes) => {
  const Evento = sequelize.define('Evento', {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT
    },
    tipo: {
      type: DataTypes.ENUM(
        'ALIMENTACAO',
        'SONECA',
        'BRINCADEIRA',
        'HIGIENE',
        'APRENDIZADO'
      ),
      allowNull: false
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    horaInicio: {
      type: DataTypes.TIME
    },
    horaFim: {
      type: DataTypes.TIME
    },
    turmaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    criadoPor: {
      type: DataTypes.INTEGER
    }
  });

  return Evento;
};
