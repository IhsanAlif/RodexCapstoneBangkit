const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');
const FormData = require('form-data');

exports.inferImageWithRoboflow = async (filePath) => {
    try {
        const formData = new FormData();
        formData.append("name", "file");
        formData.append("file", fs.createReadStream(filePath));
        formData.append("split", "train");

        const response = await axios({
            method: 'POST',
            url: 'https://detect.roboflow.com/road-damage-ww8ex/1',
            params: { api_key: 'mSuiLDlfOqxZArfLhDtL' },
            data: formData,
            headers: formData.getHeaders()
        });

        if (!response || !response.data || !response.data.predictions) {
            throw new Error('Invalid response from Roboflow API');
        }

        const result = response.data;
        const imageWithLabels = await Jimp.read(filePath);

        // Load the font
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        result.predictions.forEach(prediction => {
            const { x, y, width, height, class: label, confidence } = prediction;

            // Draw a yellow rectangle (border) around the detected object
            imageWithLabels.scan(
                x - width / 2, y - height / 2, width, 1,
                (xPos, yPos, idx) => {
                    imageWithLabels.bitmap.data[idx] = 255;    // R
                    imageWithLabels.bitmap.data[idx + 1] = 255;  // G
                    imageWithLabels.bitmap.data[idx + 2] = 0;    // B
                    imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                });

            imageWithLabels.scan(
                x - width / 2, y + height / 2 - 1, width, 1,
                (xPos, yPos, idx) => {
                    imageWithLabels.bitmap.data[idx] = 255;    // R
                    imageWithLabels.bitmap.data[idx + 1] = 255;  // G
                    imageWithLabels.bitmap.data[idx + 2] = 0;    // B
                    imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                });

            imageWithLabels.scan(
                x - width / 2, y - height / 2, 1, height,
                (xPos, yPos, idx) => {
                    imageWithLabels.bitmap.data[idx] = 255;    // R
                    imageWithLabels.bitmap.data[idx + 1] = 255;  // G
                    imageWithLabels.bitmap.data[idx + 2] = 0;    // B
                    imageWithLabels.bitmap.data[idx + 3] = 255;  // A
                });

            imageWithLabels.scan(
                x + width / 2 - 1, y - height / 2, 1, height,
                (xPos, yPos, idx) => {
                    imageWithLabels.bitmap.data[idx] = 255;    // R
                    imageWithLabels.bitmap.data[idx + 1] = 255;  // G
                    imageWithLabels.bitmap.data[idx + 2] = 0;    // B
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

        // Save the image with labels
        const labeledImagePath = `${filePath.replace(/\.\w+$/, '')}_labeled.jpg`;
        await imageWithLabels.writeAsync(labeledImagePath);

        return { result, labeledImagePath };
    } catch (error) {
        console.error('Error inferring image with Roboflow:', error);
        throw new Error('Error processing image with Roboflow');
    }
};
