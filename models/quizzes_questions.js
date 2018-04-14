module.exports = function(sequelize, DataTypes) {
  const QuizzesQuestions = sequelize.define('quizzes_questions', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
  }, {
    underscored: true,
  });
  return QuizzesQuestions;
};
