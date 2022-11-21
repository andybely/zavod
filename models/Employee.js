const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  surname: {
    type: DataTypes.STRING(25),
    field: 'SURNAME',
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(25),
    field: 'NAME',
    allowNull: false
  },
  middleName: {
    type: DataTypes.STRING(25),
    field: 'MIDDLE_NAME',
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'DATE_OF_BIRTH',
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    field: 'ADDRESS',
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(14),
    field: 'PHONE_NUMBER',
    allowNull: false
  },
  jobTitle: {
    type: DataTypes.STRING(25),
    field: 'JOB_TITLE',
    allowNull: false
  },
}