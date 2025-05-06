const express = require('express');
const router = express.Router();
const { uploadPhotos, deletePhoto } = require('../controllers/photoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/:propertyId', auth, upload.array('photos', 10), uploadPhotos);
router.delete('/:id', auth, deletePhoto);

module.exports = router;