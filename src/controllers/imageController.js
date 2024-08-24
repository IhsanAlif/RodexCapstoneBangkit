const path = require('path');
const fs = require('fs-extra');
const { inferImageWithRoboflow } = require('../services/roboflowService');
const { uploadImage, uploadJson } = require('../services/gcsService');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For unique identifiers

const tempDir = path.join(__dirname, '../../temp'); // Define temp directory

// Helper function to transform Roboflow JSON to saveDamage format
const transformRoboflowData = (roboflowData, imageName, location) => {
    const { predictions } = roboflowData;
    
    const damages = {
        count_damages: predictions.length,
        count_damages_type_0: predictions.filter(p => p.class_id === 0).length,
        count_damages_type_1: predictions.filter(p => p.class_id === 1).length,
        count_damages_type_2: predictions.filter(p => p.class_id === 2).length,
        count_damages_type_3: predictions.filter(p => p.class_id === 3).length,
        detected: predictions.length > 0,
        image: imageName,
        location: location,
    };

    return damages;
};

// Function to save damage data to Firestore
const saveDamage = async (damage) => {
    try {
        await db.collection('damages').add(damage);
        console.log('Damage saved:', damage);
    } catch (error) {
        console.error('Error saving damage:', error);
        throw new Error('Error saving damage');
    }
};

exports.uploadAndProcessImage = async (req, res) => {
    // Check if the request contains form-data with an image file
    if (!req.file || !req.body.identifier) {
        return res.status(400).send('Image file or identifier is missing');
    }

    try {
        const { file: imageFile } = req;
        const { identifier, location } = req.body;

        // Ensure the temporary directory exists
        await fs.ensureDir(tempDir);

        // Define temporary paths
        const tempImagePath = path.join(tempDir, `${uuidv4()}.jpg`);
        const tempResultPath = path.join(tempDir, `${identifier}_result.json`); // Changed extension to .jsonl

        // Save the uploaded image to a temporary file
        await fs.writeFile(tempImagePath, imageFile.buffer);

        // Process the image using Roboflow
        const { result, labeledImagePath } = await inferImageWithRoboflow(tempImagePath);

        // Transform Roboflow result to saveDamage format
        const damages = transformRoboflowData(result, identifier, location);

        // Save damage record to Firestore
        await saveDamage(damages);

        // Upload the labeled image to GCS
        const labeledImageUrl = await uploadImage(labeledImagePath, identifier);

        // Save and upload the transformed damages as JSONL
        const jsonLData = JSON.stringify(damages); // Convert to single-line JSON string
        fs.writeFileSync(tempResultPath, `${jsonLData}\n`); // Append newline for JSONL format
        const resultUrl = await uploadJson(tempResultPath, identifier);

        // Clean up temporary files
        await fs.remove(tempDir);

        res.json({ labeledImageUrl, resultUrl, damages });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image');
    }
};
