const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');
const db = require('./config/db'); // Import the database module

const app = express();

// Middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Route handlers
app.use('/image', (req, res, next) => {
    req.db = db; // Attach the database to the request
    next();
}, imageRoutes);

app.use('/user', (req, res, next) => {
    req.db = db; // Attach the database to the request
    next();
}, userRoutes);

app.use('/inspection', (req, res, next) => {
    req.db = db; // Attach the database to the request
    next();
}, inspectionRoutes);

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
