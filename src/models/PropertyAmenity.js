const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Property = require('./Property');
const Amenity = require('./Amenity');

const PropertyAmenity = sequelize.define('PropertyAmenity', {
  property_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  amenity_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
}, {
  tableName: 'Property_Amenities',
  timestamps: false,
});

PropertyAmenity.belongsTo(Property, { foreignKey: 'property_id' });
PropertyAmenity.belongsTo(Amenity, { foreignKey: 'amenity_id' });

module.exports = PropertyAmenity;