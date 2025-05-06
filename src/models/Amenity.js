const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Amenity = sequelize.define('Amenity', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
}, {
  tableName: 'Amenities',
  timestamps: false
});

module.exports = Amenity;