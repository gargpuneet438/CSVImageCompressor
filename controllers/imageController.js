const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { processCsv } = require('../services/csvService');
const requestStatuses = {};  // Store request statuses
const { downloadAndCompressImage } = require('../services/imageService');  // Import the function
const db = require('../db/db');  // Import the database instance

// Upload CSV Handler
const uploadCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const requestId = uuidv4();  // Generate unique request ID
    const inputFilePath = req.file.path;
    const outputFilePath = path.join(__dirname, '..', 'output', `${requestId}.csv`);

    // Insert the initial status (pending) into the database
    await db('requests').insert({
        requestId: requestId,
        status: 'pending',
        outputFilePath: null
    });

    // Process CSV asynchronously
    processCsv(inputFilePath, outputFilePath, requestId);

    return res.json({ requestId });
};

// Status Check Handler
const checkStatus = async (req, res) => {
    const requestId = req.params.id;

    // Fetch the status from the database
    const request = await db('requests').where({ requestId }).first();

    if (!request) {
        return res.status(404).json({ message: 'Request ID not found' });
    }

    if (request.status === 'pending') {
        return res.json({ status: 'pending' });
    }

    if (request.status === 'complete') {
        const outputFilePath = request.outputFilePath;
        return res.download(outputFilePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error downloading the file' });
            }
        });
    }
};

module.exports = { uploadCsv, checkStatus };