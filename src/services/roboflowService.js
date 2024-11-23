const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');
const FormData = require('form-data');

// Define colors for each class
const colors = {
    0: { r: 255, g: 0, b: 0 },    // Red
    1: { r: 0, g: 255, b: 0 },    // Green
    2: { r: 255, g: 255, b: 0 },  // Yellow
    3: { r: 0, g: 0, b: 255 }     // Blue
};

exports.inferImageWithRoboflow = function(filePath, callback) {
    const formData = new FormData();
    formData.append("name", "file");
    formData.append("file", fs.createReadStream(filePath));
    formData.append("split", "train");

    axios({
        method: 'POST',
        url: 'https://detect.roboflow.com/road-damage-ww8ex/1',
        params: { api_key: 'mSuiLDlfOqxZArfLhDtL' },
        data: formData,
        headers: formData.getHeaders()
    })
    .then(function(response) {
        if (!response || !response.data || !response.data.predictions) {
            return callback(new Error('Invalid response from Roboflow API'));
        }

        const result = response.data;
        Jimp.read(filePath, function(err, imageWithLabels) {
            if (err) {
                return callback(new Error('Error reading image file'));
            }

            // Load the font
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK, function(err, font) {
                if (err) {
                    return callback(new Error('Error loading font'));
                }

                // Filter predictions to include only those with confidence > 50%
                const filteredPredictions = result.predictions.filter(prediction => prediction.confidence > 0.50);

                filteredPredictions.forEach(function(prediction) {
                    const { x, y, width, height, class: label, confidence } = prediction;

                    // Get color based on the prediction class
                    const color = colors[label] || { r: 255, g: 255, b: 255 }; // Default to white if class not defined

                    // Draw a rectangle (border) around the detected object
                    imageWithLabels.scan(
                        x - width / 2, y - height / 2, width, 1,
                        function(xPos, yPos, idx) {
                            imageWithLabels.bitmap.data[idx] = color.r;    // R
                            imageWithLabels.bitmap.data[idx + 1] = color.g;  // G
                            imageWithLabels.bitmap.data[idx + 2] = color.b;    // B
                            imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                        });

                    imageWithLabels.scan(
                        x - width / 2, y + height / 2 - 1, width, 1,
                        function(xPos, yPos, idx) {
                            imageWithLabels.bitmap.data[idx] = color.r;    // R
                            imageWithLabels.bitmap.data[idx + 1] = color.g;  // G
                            imageWithLabels.bitmap.data[idx + 2] = color.b;    // B
                            imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                        });

                    imageWithLabels.scan(
                        x - width / 2, y - height / 2, 1, height,
                        function(xPos, yPos, idx) {
                            imageWithLabels.bitmap.data[idx] = color.r;    // R
                            imageWithLabels.bitmap.data[idx + 1] = color.g;  // G
                            imageWithLabels.bitmap.data[idx + 2] = color.b;    // B
                            imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                        });

                    imageWithLabels.scan(
                        x + width / 2 - 1, y - height / 2, 1, height,
                        function(xPos, yPos, idx) {
                            imageWithLabels.bitmap.data[idx] = color.r;    // R
                            imageWithLabels.bitmap.data[idx + 1] = color.g;  // G
                            imageWithLabels.bitmap.data[idx + 2] = color.b;    // B
                            imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                        });

                    // Draw the label above the detected object
                    imageWithLabels.print(
                        font,
                        x - width / 2,
                        y - height / 2 - 32,
                        `${label} (${(confidence * 100).toFixed(2)}%)`
                    );
                });

                // Convert the image to a buffer and encode to Base64
                imageWithLabels.getBuffer(Jimp.MIME_JPEG, function(err, buffer) {
                    if (err) {
                        return callback(new Error('Error converting image to buffer'));
                    }

                    const labeledImageEncoded = buffer.toString('base64');

                    callback(null, { result: { ...result, predictions: filteredPredictions }, labeledImageEncoded });
                });
            });
        });
    })
    .catch(function(error) {
        callback(new Error('Error inferring image with Roboflow: ' + error.message));
    });
};
