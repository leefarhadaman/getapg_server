const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for register', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    logger.info(`User registered: ${user.id}`);
    res.status(201).json({ token, user: { id: user.id, email, name, role } });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    throw error;
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for login', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    logger.info(`User logged in: ${user.id}`);
    res.json({ token, user: { id: user.id, email, name: user.name, role: user.role } });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    throw error;
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role'],
    });
    if (!user) {
      logger.warn(`Profile not found for user: ${req.user.id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Profile retrieved for user: ${req.user.id}`);
    res.json(user);
  } catch (error) {
    logger.error(`Profile error: ${error.message}`);
    throw error;
  }
};

module.exports = { register, login, getProfile };