const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sectorName: {
    type: DataTypes.STRING(25),
    field: 'SECTOR_NAME',
    allowNull: false
  },
}