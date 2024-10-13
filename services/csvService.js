const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const db = require('../db/db');  // Import the database instance
const { downloadAndCompressImage } = require('../services/imageService');  // Import the function


async function processCsv(inputFilePath, outputFilePath, requestId) {
    const results = [];
    const processedRows = [];

    fs.createReadStream(inputFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            results.push(row);
        })
        .on('end', async () => {
            for (const row of results) {
                const inputUrls = row['Input Image Urls'].split(',');
                const outputUrls = [];

                for (const inputUrl of inputUrls) {
                    const outputUrl = await downloadAndCompressImage(inputUrl.trim());
                    outputUrls.push(outputUrl);
                }

                processedRows.push({
                    S_No: row['S.No'],
                    Product_Name: row['Product Name'],
                    Input_Image_Urls: row['Input Image Urls'],
                    Output_Image_Urls: outputUrls.join(','),
                });
            }

            const csvWriter = createCsvWriter({
                path: outputFilePath,
                header: [
                    { id: 'S_No', title: 'S.No' },
                    { id: 'Product_Name', title: 'Product Name' },
                    { id: 'Input_Image_Urls', title: 'Input Image Urls' },
                    { id: 'Output_Image_Urls', title: 'Output Image Urls' },
                ],
            });

            await csvWriter.writeRecords(processedRows);

            // Update the request status to 'complete' in the database
            await db('requests').where({ requestId }).update({
                status: 'complete',
                outputFilePath: outputFilePath
            });

            console.log('Processing complete, CSV written to:', outputFilePath);
        });
}

module.exports = { processCsv };