const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const logger = require('./config/logger');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const photoRoutes = require('./routes/photos');
const amenityRoutes = require('./routes/amenities');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(process.env.UPLOAD_PATH));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/amenities', amenityRoutes);

// Error Handler
app.use(errorHandler);

// Database Connection
sequelize
  .authenticate()
  .then(() => {
    logger.info('Connected to MySQL database');
  })
  .catch(err => {
    logger.error(`Database connection error: ${err.message}`);
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.sync({ alter: true });
    logger.info(`Server running on port ${PORT}`);
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
  }
});