const db = require('../config/db');

exports.startInspection = async (req, res) => {
    const { name_of_officer, name_of_road, length_of_road, type_of_road_surface, location_start } = req.body;

    if (!name_of_officer || !name_of_road || !length_of_road || !type_of_road_surface || !location_start) {
        return res.status(400).send('Missing required data for inspection');
    }

    try {
        await db.collection('inspections').add({
            name_of_officer, name_of_road, length_of_road, type_of_road_surface, location_start, status: 'ongoing'
        });
        res.send(`New inspection started at ${name_of_road}`);
    } catch (error) {
        console.error('Error starting new inspection:', error);
        res.status(500).send('Failed to start new inspection');
    }
};

exports.endInspection = async (req, res) => {
    const { location_end } = req.body;

    try {
        const snapshot = await db.collection('inspections').where('status', '==', 'ongoing').limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({ location_end, status: 'completed' });
        }
        res.send('Inspection ended');
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
