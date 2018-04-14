module.exports = function(sequelize, DataTypes) {
  const Categories = sequelize.define('categories', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    underscored: true,
  });
  return Categories;
};
