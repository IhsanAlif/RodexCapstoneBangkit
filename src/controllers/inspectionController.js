const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For unique identifiers

// Helper function to handle errors
const handleDbError = (res, error, message) => {
    console.error(message, error);
    res.status(500).send(message);
};

// Start a new inspection
exports.startInspection = (req, res) => {
    const {
        name_of_officer,
        name_of_road,
        length_of_road,
        width_of_road,
        type_of_road_surface,
        location_start,
        road_class,
        address,
        additional,
    } = req.body;

    if (
        !name_of_officer ||
        !name_of_road ||
        !length_of_road ||
        !width_of_road ||
        !type_of_road_surface ||
        !location_start ||
        !road_class ||
        !address
    ) {
        return res.status(400).send('Missing required data for inspection');
    }

    try {
        const id = uuidv4(); // Generate a unique inspection ID
        const date_started = new Date().toISOString();

        const inspectionData = [
            id,
            name_of_officer,
            name_of_road,
            length_of_road,
            width_of_road,
            type_of_road_surface,
            location_start,
            road_class,
            address,
            additional || null,
            'ongoing',
            date_started,
            null, // location_end
        ];

        const query = `
            INSERT INTO inspections (
                id, name_of_officer, name_of_road, length_of_road, width_of_road, 
                type_of_road_surface, location_start, road_class, address, additional, 
                status, date_started, location_end
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        db.run(query, inspectionData, function (err) {
            if (err) {
                handleDbError(res, err, 'Failed to start new inspection');
            } else {
                res.status(201).json({
                    id,
                    name_of_officer,
                    name_of_road,
                    length_of_road,
                    width_of_road,
                    type_of_road_surface,
                    location_start,
                    road_class,
                    address,
                    additional,
                    status: 'ongoing',
                    date_started,
                });
            }
        });
    } catch (error) {
        handleDbError(res, error, 'Failed to start new inspection');
    }
};

// End an ongoing inspection
exports.endInspection = (req, res) => {
    const { inspectionId, location_end } = req.body;

    if (!inspectionId || !location_end) {
        return res.status(400).send('Missing required data to end inspection');
    }

    try {
        const query = `
            UPDATE inspections
            SET location_end = ?, status = 'completed'
            WHERE id = ?;
        `;

        db.run(query, [location_end, inspectionId], function (err) {
            if (err) {
                return handleDbError(res, err, 'Error ending inspection');
            }

            if (this.changes === 0) {
                return res.status(404).send('Inspection not found');
            }

            // Fetch the updated inspection
            const getQuery = 'SELECT * FROM inspections WHERE id = ?;';
            db.get(getQuery, [inspectionId], (err, updatedInspection) => {
                if (err) {
                    return handleDbError(res, err, 'Error fetching updated inspection');
                }

                res.status(200).json(updatedInspection);
            });
        });
    } catch (error) {
        handleDbError(res, error, 'Error ending inspection');
    }
};

// Get all inspection history
exports.getInspectionHistory = (req, res) => {
    const query = 'SELECT * FROM inspections;';
    db.all(query, (err, inspections) => {
        if (err) {
            return handleDbError(res, err, 'Error fetching inspection history');
        }
        console.log('Inspection below:');
        console.log(inspections);
        res.json(inspections);
    });
};

// Get details of a specific inspection by id
exports.getInspectionDetail = (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM inspections WHERE id = ?;';
    db.get(query, [id], (err, inspection) => {
        if (err) {
            return handleDbError(res, err, 'Error fetching inspection detail');
        }

        if (!inspection) {
            return res.status(404).send('Inspection not found');
        }

        res.json(inspection);
    });
};
