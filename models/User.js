const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(25),
    field: 'USERNAME',
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(64),
    field: 'PASSWORD',
    allowNull: false
  },
}