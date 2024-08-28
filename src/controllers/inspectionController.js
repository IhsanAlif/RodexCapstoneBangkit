const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For unique identifiers

exports.startInspection = async (req, res) => {
    const { name_of_officer, name_of_road, length_of_road, width_of_road, type_of_road_surface, location_start } = req.body;

    if (!name_of_officer || !name_of_road || !length_of_road || !width_of_road || !type_of_road_surface || !location_start) {
        return res.status(400).send('Missing required data for inspection');
    }

    try {
        const id = uuidv4(); // Generate a unique inspection ID
        const inspectionData = {
            id,
            name_of_officer,
            name_of_road,
            length_of_road,
            width_of_road,
            type_of_road_surface,
            location_start,
            status: 'ongoing',
            date_started: new Date().toISOString(),
        };

        await db.collection('inspections').doc(id).set(inspectionData);
        res.status(201).json(inspectionData); // Output the JSON of the inspection data
    } catch (error) {
        console.error('Error starting new inspection:', error);
        res.status(500).send('Failed to start new inspection');
    }
};

exports.endInspection = async (req, res) => {
    const { inspectionId, location_end } = req.body;

    if (!inspectionId || !location_end) {
        return res.status(400).send('Missing required data to end inspection');
    }

    try {
        const inspectionDoc = await db.collection('inspections').doc(inspectionId).get();
        if (!inspectionDoc.exists) {
            return res.status(404).send('Inspection not found');
        }

        const inspectionData = inspectionDoc.data();
        inspectionData.location_end = location_end;
        inspectionData.status = 'completed';

        await db.collection('inspections').doc(inspectionId).update(inspectionData);
        res.status(200).json(inspectionData); // Output the JSON of the updated inspection data
    } catch (error) {
        console.error('Error ending inspection:', error);
        res.status(500).send('Error ending inspection');
    }
};

exports.getInspectionHistory = async (req, res) => {
    try {
        const snapshot = await db.collection('inspections').get();
        const inspections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(inspections);
    } catch (error) {
        console.error('Error fetching inspection history:', error);
        res.status(500).send('Error fetching inspection history');
    }
};

exports.getInspectionDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await db.collection('inspections').doc(id).get();
        if (!doc.exists) {
            res.status(404).send('Inspection not found');
            return;
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching inspection detail:', error);
        res.status(500).send('Error fetching inspection detail');
    }
};
