const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const predictionRoutes = require('./routes/predictions');
const chatRoutes = require('./routes/chat');
const historyRoutes = require('./routes/history');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// ============ Middleware ============

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ Routes ============

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Diabetes CDSS API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);

// ============ Error Handling ============

app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;