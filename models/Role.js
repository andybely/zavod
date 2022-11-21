const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  roleName: {
    type: DataTypes.STRING(25),
    field: 'ROLE_NAME',
    allowNull: false
  },
  roleAccess: {
    type: DataTypes.STRING(25),
    field: 'ROLE_ACCESS',
    allowNull: false
  },
}