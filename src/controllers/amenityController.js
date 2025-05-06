const Amenity = require('../models/Amenity');
const logger = require('../config/logger');

const getAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.findAll();
    if (amenities.length === 0) {
      logger.info('No amenities found');
      return res.status(404).json({ message: 'No amenities found' });
    }

    logger.info(`Retrieved ${amenities.length} amenities`);
    res.json(amenities);
  } catch (error) {
    logger.error(`Get amenities error: ${error.message}`);
    throw error;
  }
};

module.exports = { getAmenities };