const axios = require('axios');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinaryConfig');
const { v4: uuidv4 } = require('uuid');

// Function to download and compress image
async function downloadAndCompressImage(url) {
    try {
        console.log('Downloading image from URL:', url);  // Log the input URL

        const response = await axios({
            url,
            responseType: 'arraybuffer',
        });
        const buffer = Buffer.from(response.data, 'binary');

        const compressedBuffer = await sharp(buffer)
            .jpeg({ quality: 50 })
            .toBuffer();

        const fileName = uuidv4();

        // Return a promise to handle the asynchronous upload
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: fileName,
                    folder: 'compressed_images',
                },
                (error, result) => {
                    if (error) {
                        console.error('Error uploading to Cloudinary:', error);
                        reject(error);  // Reject the promise on error
                    } else {
                        console.log('Uploaded compressed image to Cloudinary:', result.secure_url);
                        resolve(result.secure_url);  // Resolve the promise with the URL
                    }
                }
            );
            uploadStream.end(compressedBuffer);
        });

    } catch (error) {
        console.error('Error processing image:', error);
        return null;
    }
}



module.exports = { downloadAndCompressImage };
