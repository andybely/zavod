const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  acceptanceDate: {
    type: DataTypes.DATEONLY,
    field: 'ACCEPTANCE_DATE',
    allowNull: false
  },
  quantityAccepted: {
    type: DataTypes.INTEGER,
    field: 'QUANTITY_ACCEPTED',
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    field: 'PRICE',
    allowNull: false
  },

}