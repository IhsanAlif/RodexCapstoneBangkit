const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const imageRoutes = require('./routes/imageRoutes');
const db = require('./config/db'); // Firestore initialization

const app = express();

// Middleware setup
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Route handlers
app.use('/image', imageRoutes);
app.use('/user', userRoutes);
app.use('/inspection', inspectionRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Rodex-Capstone');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

module.exports = app;