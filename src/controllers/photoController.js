const { validationResult } = require('express-validator');
const Property = require('../models/Property');
const Photo = require('../models/Photo');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

const uploadPhotos = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for uploadPhotos', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { propertyId } = req.params;
  const files = req.files;

  if (!files || files.length < 4) {
    logger.warn(`Minimum 4 photos required for property: ${propertyId}`);
    return res.status(400).json({ error: 'Minimum 4 photos required' });
  }

  try {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      logger.warn(`Property not found: ${propertyId}`);
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner_id !== req.user.id) {
      logger.warn(`Unauthorized upload attempt on property: ${propertyId}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete existing photos
    await Photo.destroy({ where: { property_id: propertyId } });

    // Save new photos
    const photos = files.map(file => ({
      property_id: propertyId,
      url: `/uploads/${file.filename}`,
    }));
    await Photo.bulkCreate(photos);

    logger.info(`Uploaded ${files.length} photos for property: ${propertyId}`);
    res.status(201).json({ message: 'Photos uploaded successfully' });
  } catch (error) {
    logger.error(`Upload photos error: ${error.message}`);
    // Clean up uploaded files on error
    for (const file of files) {
      try {
        await fs.unlink(path.join(process.env.UPLOAD_PATH, file.filename));
      } catch (unlinkError) {
        logger.error(`Failed to delete file ${file.filename}: ${unlinkError.message}`);
      }
    }
    throw error;
  }
};

const deletePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const photo = await Photo.findByPk(id, {
      include: [{ model: Property }],
    });
    if (!photo) {
      logger.warn(`Photo not found: ${id}`);
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.Property.owner_id !== req.user.id) {
      logger.warn(`Unauthorized delete attempt on photo: ${id}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete file from disk
    try {
      await fs.unlink(path.join(process.env.UPLOAD_PATH, photo.url.replace('/uploads/', '')));
    } catch (error) {
      logger.error(`Failed to delete file ${photo.url}: ${error.message}`);
    }

    await photo.destroy();

    logger.info(`Photo deleted: ${id}`);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    logger.error(`Delete photo error: ${error.message}`);
    throw error;
  }
};

module.exports = { uploadPhotos, deletePhoto };