const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment'); // To handle timestamps
const dotenv = require('dotenv').config(); // Load environment variables

// Create a Google Cloud Storage client
const storage = new Storage();
const bucketName = 'capstone-426015_cloudbuild'; // Your bucket name
const bucket = storage.bucket(bucketName);

// Helper function to generate a timestamped filename
const generateTimestampedFilename = (identifier, extension) => {
    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    return `${timestamp}_${identifier}${extension}`;
};

// Function to upload a file to GCS
const uploadFile = async (filePath, destination) => {
    try {
        await bucket.upload(filePath, {
            destination: destination,
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });
        console.log(`File ${filePath} uploaded to ${destination}`);
        return `gs://${bucketName}/${destination}`;
    } catch (error) {
        console.error('Error uploading file to GCS:', error);
        throw new Error('Error uploading file to GCS');
    }
};

// Upload images to specific directory
exports.uploadImage = async (filePath, identifier) => {
    const fileName = generateTimestampedFilename(identifier, '.jpg');
    const destination = `road-damage-detection/labeled_output/images/${fileName}`;
    return await uploadFile(filePath, destination);
};

// Upload videos to specific directory
exports.uploadVideo = async (filePath, identifier) => {
    const fileName = generateTimestampedFilename(identifier, path.extname(filePath));
    const destination = `road-damage-detection/labeled_output/videos/${fileName}`;
    return await uploadFile(filePath, destination);
};

// Upload JSONL results to specific directory
exports.uploadJson = async (filePath, identifier) => {
    const fileName = generateTimestampedFilename(identifier, '.json');
    const destination = `road-damage-detection/result_output/${fileName}`;
    return await uploadFile(filePath, destination);
};
