const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Location = require('./Location');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('pg', 'villa', 'flat', 'hostel'),
    allowNull: false,
  },
  rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'coed'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  location_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
}, {
  tableName: 'Properties',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

Property.belongsTo(User, { foreignKey: 'owner_id' });
Property.belongsTo(Location, { foreignKey: 'location_id' });

module.exports = Property;