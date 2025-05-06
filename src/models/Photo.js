const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Property = require('./Property');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'Photos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

Photo.belongsTo(Property, { foreignKey: 'property_id' });

module.exports = Photo;