const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    field: 'ISSUE_DATE',
    allowNull: false
  },
  quantityIssued: {
    type: DataTypes.INTEGER,
    field: 'QUANTITY_ISSUED',
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    field: 'PRICE',
    allowNull: false
  },

}