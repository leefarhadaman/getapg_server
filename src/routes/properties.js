const express = require('express');
const router = express.Router();
const {
  createProperty,
  updateProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
} = require('../controllers/propertyController');
const { propertyValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, propertyValidation, upload.array('photos', 10), createProperty);
router.put('/:id', auth, propertyValidation, upload.array('photos', 10), updateProperty);
router.delete('/:id', auth, deleteProperty);
router.get('/', getProperties);
router.get('/:id', getPropertyById);

module.exports = router;