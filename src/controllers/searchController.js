const { validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const Property = require('../models/Property');
const Location = require('../models/Location');
const Photo = require('../models/Photo');
const Contact = require('../models/Contact');
const Amenity = require('../models/Amenity');
const PropertyAmenity = require('../models/PropertyAmenity');
const logger = require('../config/logger');

const searchProperties = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for searchProperties', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { city, latitude, longitude, radius = 10, page = 1, limit = 10 } = req.query;

  try {
    let where = {};
    let locationWhere = {};

    if (city) {
      locationWhere.city = { [Op.like]: `%${city}%` };
    }

    if (latitude && longitude) {
      // Simple geospatial query using Haversine formula
      where = {
        [Op.and]: [
          sequelize.literal(`
            6371 * acos(
              cos(radians(${latitude}))
              * cos(radians(Locations.latitude))
              * cos(radians(Locations.longitude) - radians(${longitude}))
              + sin(radians(${latitude})) * sin(radians(Locations.latitude))
            ) <= ${radius}
          `),
        ],
      };
    }

    const { count, rows } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: Location,
          where: locationWhere,
        },
        { model: Photo },
        { model: Contact, attributes: req.user ? ['phone', 'email'] : ['phone', 'email'].filter(attr => Contact.rawAttributes[attr].defaultValue) },
        { model: Amenity, through: PropertyAmenity },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    if (rows.length === 0) {
      logger.info('No properties found for search');
      return res.status(404).json({ message: 'No properties found' });
    }

    logger.info(`Retrieved ${rows.length} properties for search`);
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      properties: rows,
    });
  } catch (error) {
    logger.error(`Search properties error: ${error.message}`);
    throw error;
  }
};

const filterProperties = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for filterProperties', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, gender, minRent, maxRent, amenities, page = 1, limit = 10 } = req.query;

  try {
    let where = {};
    let include = [
      { model: Location },
      { model: Photo },
      { model: Contact, attributes: req.user ? ['phone', 'email'] : ['phone', 'email'].filter(attr => Contact.rawAttributes[attr].defaultValue) },
    ];

    if (type) {
      where.type = type;
    }

    if (gender) {
      where.gender = gender;
    }

    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) where.rent[Op.gte] = minRent;
      if (maxRent) where.rent[Op.lte] = maxRent;
    }

    if (amenities && amenities.length > 0) {
      include.push({
        model: Amenity,
        through: PropertyAmenity,
        where: { id: { [Op.in]: amenities } },
      });
    }

    const { count, rows } = await Property.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    if (rows.length === 0) {
      logger.info('No properties found for filter');
      return res.status(404).json({ message: 'No properties found' });
    }

    logger.info(`Retrieved ${rows.length} properties for filter`);
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      properties: rows,
    });
  } catch (error) {
    logger.error(`Filter properties error: ${error.message}`);
    throw error;
  }
};

module.exports = { searchProperties, filterProperties };