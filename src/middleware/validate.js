const { body, param, query } = require('express-validator');

const registerValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['user', 'owner']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const propertyValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['pg', 'villa', 'flat', 'hostel']).withMessage('Invalid property type'),
  body('rent').isFloat({ min: 0 }).withMessage('Rent must be a positive number'),
  body('gender').isIn(['male', 'female', 'coed']).withMessage('Invalid gender'),
  body('location_id').isInt().withMessage('Invalid location ID'),
  body('amenities').isArray().withMessage('Amenities must be an array'),
  body('amenities.*').isInt().withMessage('Invalid amenity ID'),
  body('contact.phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('contact.email').optional().isEmail().withMessage('Invalid email'),
  body('contact.show_to_customers').isBoolean().withMessage('Show to customers must be a boolean'),
];

const searchValidation = [
  query('city').optional().isString().withMessage('Invalid city'),
  query('latitude').optional().isFloat().withMessage('Invalid latitude'),
  query('longitude').optional().isFloat().withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Invalid radius'),
];

const filterValidation = [
  query('type').optional().isIn(['pg', 'villa', 'flat', 'hostel']).withMessage('Invalid type'),
  query('gender').optional().isIn(['male', 'female', 'coed']).withMessage('Invalid gender'),
  query('minRent').optional().isFloat({ min: 0 }).withMessage('Invalid minimum rent'),
  query('maxRent').optional().isFloat({ min: 0 }).withMessage('Invalid maximum rent'),
  query('amenities').optional().isArray().withMessage('Amenities must be an array'),
  query('amenities.*').isInt().withMessage('Invalid amenity ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
];

module.exports = {
  registerValidation,
  loginValidation,
  propertyValidation,
  searchValidation,
  filterValidation,
};