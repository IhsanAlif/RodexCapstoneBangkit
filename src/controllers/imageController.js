const path = require('path');
const fs = require('fs-extra');
const { inferImageWithRoboflow } = require('../services/roboflowService');
const { uploadImage, uploadJson } = require('../services/gcsService');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For unique identifiers

const tempDir = '/tmp'; // Use the /tmp directory for Firebase Functions

// Helper function to transform Roboflow JSON to saveDamage format
const transformRoboflowData = (id, roboflowData, inspectionId, imageName, imageUrl) => {
    const { predictions } = roboflowData;

    // Get current date in ISO 8601 format
    const currentDate = new Date().toISOString();

    const damages = {
        id: id,
        inspectionId: inspectionId,
        count_damages: predictions.length,
        count_damages_type_0: predictions.filter(p => p.class_id === 0).length,
        count_damages_type_1: predictions.filter(p => p.class_id === 1).length,
        count_damages_type_2: predictions.filter(p => p.class_id === 2).length,
        count_damages_type_3: predictions.filter(p => p.class_id === 3).length,
        detected: predictions.length > 0,
        image: imageName,
        image_url: imageUrl, // Include the public image URL
        date_created: currentDate // Add current date in ISO format
    };

    return damages;
};

// Function to save damage data to Firestore and return the ID
const saveDamage = async (id, damage) => {
    try {
        const damageRef = await db.collection('damages').doc(id).set(damage);
        console.log('Damage saved:', damage);
        return damageRef.id; // Return the ID of the saved damage
    } catch (error) {
        console.error('Error saving damage:', error);
        throw new Error('Error saving damage');
    }
};

// Function to get and list all damages
exports.getAllDamages = async (req, res) => {
    try {
        const damagesSnapshot = await db.collection('damages').get();
        if (damagesSnapshot.empty) {
            return res.status(404).send('No damages found');
        }

        const damages = [];
        damagesSnapshot.forEach(doc => {
            damages.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(damages);
    } catch (error) {
        console.error('Error getting damages:', error);
        res.status(500).send('Error getting damages');
    }
};

// Function to get a single damage by ID
exports.getDamageById = async (req, res) => {
    const { id } = req.params;

    try {
        const damageDoc = await db.collection('damages').doc(id).get();
        if (!damageDoc.exists) {
            return res.status(404).send('Damage not found');
        }

        const damage = { id: damageDoc.id, ...damageDoc.data() };
        res.status(200).json(damage);
    } catch (error) {
        console.error('Error getting damage:', error);
        res.status(500).send('Error getting damage');
    }
};

// Function to get damages by inspectionId
exports.getDamagesByInspectionId = async (req, res) => {
    const { inspectionId } = req.params;

    try {
        const damagesSnapshot = await db.collection('damages').where('inspectionId', '==', inspectionId).get();
        if (damagesSnapshot.empty) {
            return res.status(404).send('No damages found for the provided inspection ID');
        }

        const damages = [];
        damagesSnapshot.forEach(doc => {
            damages.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(damages);
    } catch (error) {
        console.error('Error getting damages by inspection ID:', error);
        res.status(500).send('Error getting damages by inspection ID');
    }
};

// Function to post image
exports.uploadAndProcessImage = async (req, res) => {
    if (!req.body || !req.body.file || !req.body.identifier) {
        return res.status(400).send('Image file or identifier is missing');
    }

    try {
        const id = uuidv4(); // Generate a unique inspection ID
        const fileBuffer = Buffer.from(req.body.file, 'base64');
        const { identifier, inspectionId } = req.body;

        // Ensure the temporary directory exists
        await fs.ensureDir(tempDir);

        const tempImagePath = path.join(tempDir, `${id}.jpg`);
        const tempResultPath = path.join(tempDir, `${identifier}_result.json`);

        await fs.writeFile(tempImagePath, fileBuffer);

        const { result, labeledImagePath } = await inferImageWithRoboflow(tempImagePath);
        const labeledImageUrl = await uploadImage(labeledImagePath, identifier);

        const damages = transformRoboflowData(id, result, inspectionId, identifier, labeledImageUrl);
        await saveDamage(id, damages); // Save the damage into Firestore

        const jsonLData = JSON.stringify(damages);
        fs.writeFileSync(tempResultPath, `${jsonLData}\n`);
        await uploadJson(tempResultPath, identifier);

        res.status(201).json(damages); // Include the damage ID in the response
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image');
    }
};
