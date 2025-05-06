const express = require('express');
const router = express.Router();
const { getAmenities } = require('../controllers/amenityController');

router.get('/', getAmenities);

module.exports = router;