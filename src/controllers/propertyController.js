const { validationResult } = require('express-validator');
const Property = require('../models/Property');
const Photo = require('../models/Photo');
const Contact = require('../models/Contact');
const PropertyAmenity = require('../models/PropertyAmenity');
const logger = require('../config/logger');

const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for RosswValidation failed for createProperty', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, type, rent, gender, description, location_id, amenities, contact } = req.body;
  const files = req.files;

  if (!files || files.length < 4) {
    logger.warn('Minimum 4 photos required');
    return res.status(400).json({ error: 'Minimum 4 photos required' });
  }

  try {
    const property = await Property.create({
      name,
      type,
      rent,
      gender,
      description,
      location_id,
      owner_id: req.user.id,
    });

    // Save photos
    const photos = files.map(file => ({
      property_id: property.id,
      url: `/uploads/${file.filename}`,
    }));
    await Photo.bulkCreate(photos);

    // Save contact
    if (contact) {
      await Contact.create({
        property_id: property.id,
        phone: contact.phone,
        email: contact.email,
        show_to_customers: contact.show_to_customers,
      });
    }

    // Save amenities
    if (amenities && amenities.length > 0) {
      const propertyAmenities = amenities.map(amenity_id => ({
        property_id: property.id,
        amenity_id,
      }));
      await PropertyAmenity.bulkCreate(propertyAmenities);
    }

    logger.info(`Property created: ${property.id}`);
    res.status(201).json({ message: 'Property created successfully', property_id: property.id });
  } catch (error) {
    logger.error(`Create property error: ${error.message}`);
    throw error;
  }
};

const updateProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for updateProperty', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, type, rent, gender, description, location_id, amenities, contact } = req.body;
  const files = req.files;

  try {
    const property = await Property.findByPk(id);
    if (!property) {
      logger.warn(`Property not found: ${id}`);
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner_id !== req.user.id) {
      logger.warn(`Unauthorized update attempt on property: ${id}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await property.update({
      name,
      type,
      rent,
      gender,
      description,
      location_id,
    });

    // Update photos
    if (files && files.length > 0) {
      await Photo.destroy({ where: { property_id: id } });
      const photos = files.map(file => ({
        property_id: id,
        url: `/uploads/${file.filename}`,
      }));
      await Photo.bulkCreate(photos);
    }

    // Update contact
    if (contact) {
      await Contact.upsert({
        property_id: id,
        phone: contact.phone,
        email: contact.email,
        show_to_customers: contact.show_to_customers,
      });
    }

    // Update amenities
    if (amenities) {
      await PropertyAmenity.destroy({ where: { property_id: id } });
      if (amenities.length > 0) {
        const propertyAmenities = amenities.map(amenity_id => ({
          property_id: id,
          amenity_id,
        }));
        await PropertyAmenity.bulkCreate(propertyAmenities);
      }
    }

    logger.info(`Property updated: ${id}`);
    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    logger.error(`Update property error: ${error.message}`);
    throw error;
  }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findByPk(id);
    if (!property) {
      logger.warn(`Property not found: ${id}`);
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner_id !== req.user.id) {
      logger.warn(`Unauthorized delete attempt on property: ${id}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await property.destroy();

    logger.info(`Property deleted: ${id}`);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    logger.error(`Delete property error: ${error.message}`);
    throw error;
  }
};

const getProperties = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const { count, rows } = await Property.findAndCountAll({
      include: [
        { model: Location },
        { model: Photo },
        { model: Contact, attributes: req.user ? ['phone', 'email'] : ['phone', 'email'].filter(attr => Contact.rawAttributes[attr].defaultValue) },
        { model: Amenity, through: PropertyAmenity },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    logger.info(`Retrieved ${rows.length} properties for page ${page}`);
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      properties: rows,
    });
  } catch (error) {
    logger.error(`Get properties error: ${error.message}`);
    throw error;
  }
};

const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findByPk(id, {
      include: [
        { model: Location },
        { model: Photo },
        { model: Contact, attributes: req.user ? ['phone', 'email'] : ['phone', 'email'].filter(attr => Contact.rawAttributes[attr].defaultValue) },
        { model: Amenity, through: PropertyAmenity },
      ],
    });

    if (!property) {
      logger.warn(`Property not found: ${id}`);
      return res.status(404).json({ error: 'Property not found' });
    }

    logger.info(`Retrieved property: ${id}`);
    res.json(property);
  } catch (error) {
    logger.error(`Get property error: ${error.message}`);
    throw error;
  }
};

module.exports = { createProperty, updateProperty, deleteProperty, getProperties, getPropertyById };