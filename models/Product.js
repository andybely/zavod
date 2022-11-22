const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nomination: {
    type: DataTypes.STRING(25),
    field: 'NOMINATION',
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    field: 'QUANTITY',
    allowNull: false
  },
  defect: {
    type: DataTypes.INTEGER,
    field: 'DEFECT',
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(100),
    field: 'DESCRIPTION',
    allowNull: true
  },

}