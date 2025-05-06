const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
  },
}, {
  tableName: 'Locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Location;