const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Property = require('./Property');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  email: {
    type: DataTypes.STRING(255),
  },
  show_to_customers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Contacts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

Contact.belongsTo(Property, { foreignKey: 'property_id' });

module.exports = Contact;