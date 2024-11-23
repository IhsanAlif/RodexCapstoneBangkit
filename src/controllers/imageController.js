const path = require('path');
const fs = require('fs-extra');
const { inferImageWithRoboflow } = require('../services/roboflowService');
const { v4: uuidv4 } = require('uuid'); // For unique identifiers
const db = require('../config/db');

const storageDir = path.join(__dirname, '..', 'storage/output'); // Directory for local file storage

// Ensure storage directory exists
fs.ensureDirSync(storageDir);

// Helper function to transform Roboflow JSON to saveDamage format
const transformRoboflowData = (id, roboflowData, inspectionId, identifier, labeledImageEncoded) => {
    const { predictions } = roboflowData;
    const currentDate = new Date().toISOString();

    const damages = {
        id,
        inspection_id: inspectionId,
        count_damages: predictions.length,
        count_damages_type_0: predictions.filter(p => p.class_id === 0).length,
        count_damages_type_1: predictions.filter(p => p.class_id === 1).length,
        count_damages_type_2: predictions.filter(p => p.class_id === 2).length,
        count_damages_type_3: predictions.filter(p => p.class_id === 3).length,
        detected: predictions.length > 0,
        image_name: identifier,
        image_url: labeledImageEncoded,
        date_created: currentDate,
    };

    return damages;
};

// Function to save damage data to SQLite (using db from app.js)
const saveDamage = (damage, callback) => {
    const query = `
        INSERT INTO damages (
            id, inspection_id, count_damages, count_damages_type_0, count_damages_type_1, 
            count_damages_type_2, count_damages_type_3, detected, image_name, image_url, date_created
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        damage.id,
        damage.inspection_id,
        damage.count_damages,
        damage.count_damages_type_0,
        damage.count_damages_type_1,
        damage.count_damages_type_2,
        damage.count_damages_type_3,
        damage.detected,
        damage.image_name,
        damage.image_url,
        damage.date_created,
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Error saving damage:', err);
            return callback(err);
        }
        console.log('Damage saved:', damage);
        callback(null, this.lastID); // Return last inserted ID
    });
};

// Function to get and list all damages
exports.getAllDamages = (req, res) => {
    const query = `SELECT * FROM damages`;

    db.all(query, (err, damages) => {
        if (err) {
            console.error('Error getting damages:', err);
            return res.status(500).send('Error getting damages');
        }
        if (damages.length === 0) {
            return res.status(404).send('No damages found');
        }
        res.status(200).json(damages);
    });
};

// Function to get a single damage by ID
exports.getDamageById = (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM damages WHERE id = ?`;

    db.get(query, [id], (err, damage) => {
        if (err) {
            console.error('Error getting damage:', err);
            return res.status(500).send('Error getting damage');
        }
        if (!damage) {
            return res.status(404).send('Damage not found');
        }
        res.status(200).json(damage);
    });
};

// Function to get damages by inspectionId
exports.getDamagesByInspectionId = (req, res) => {
    const { inspectionId } = req.params;

    const query = `SELECT * FROM damages WHERE inspection_id = ?`;

    db.all(query, [inspectionId], (err, damages) => {
        if (err) {
            console.error('Error getting damages by inspection ID:', err);
            return res.status(500).send('Error getting damages by inspection ID');
        }
        if (damages.length === 0) {
            return res.status(404).send('No damages found for the provided inspection ID');
        }
        res.status(200).json(damages);
    });
};

// Function to upload and process image
exports.uploadAndProcessImage = (req, res) => {
    if (!req.body || !req.body.file || !req.body.identifier) {
        return res.status(400).send('Image file or identifier is missing');
    }

    const id = uuidv4();
    const fileBuffer = Buffer.from(req.body.file, 'base64');
    const { identifier, inspectionId } = req.body;

    const tempImagePath = path.join(storageDir, `${id}.jpg`);

    fs.writeFile(tempImagePath, fileBuffer, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Error saving image');
        }
        console.log("Writing Phase 1 Complete")

        inferImageWithRoboflow(tempImagePath, (err, { result, labeledImageEncoded }) => {
            if (err) {
                console.error('Error inferring image:', err);
                return res.status(500).send('Error processing image');
            }


            console.log("IDENTIFIER")
            console.log(identifier)
            const damages = transformRoboflowData(id, result, inspectionId, identifier, labeledImageEncoded);

            // Save damages data to SQLite database
            saveDamage(damages, (err, damageId) => {
                if (err) {
                    console.error('Error saving damage to database:', err);
                    return res.status(500).send('Error saving damage to database');
                }

                // Successfully saved the damage to the database
                console.log('Damage saved to database with ID:', damageId);

                // Delete the temporary image after processing
                fs.remove(tempImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting temporary image:', err);
                    } else {
                        console.log('Temporary image deleted');
                    }
                });

                // Return the saved damages data as the response
                res.status(201).json(damages);
            });
        });
    });
};
