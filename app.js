const express = require('express');
const imageRoutes = require('./routes/imageRoutes');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8001;

// Middleware and routes
app.use(express.json());
app.use('/api/images', imageRoutes);

// Create necessary directories if they don't exist
if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
}

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

module.exports = app;
