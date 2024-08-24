const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const { inferImageWithRoboflow } = require('./roboflowService');
const { uploadImage } = require('./gcsService');

exports.processVideo = async (videoPath, outputFolder, frameRate = 1) => {
    try {
        // Ensure the output folder exists
        await fs.ensureDir(outputFolder);

        // Extract frames from video
        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .output(path.join(outputFolder, 'frame_%04d.jpg'))
                .fps(frameRate)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        const frames = fs.readdirSync(outputFolder).filter(file => file.endsWith('.jpg'));
        const results = [];

        for (const frame of frames) {
            const framePath = path.join(outputFolder, frame);
            const { result, labeledImagePath } = await inferImageWithRoboflow(framePath);

            // Upload the labeled frame to GCS
            const labeledFileName = `${path.parse(frame).name}_labeled.jpg`;
            const labeledImageUrl = await uploadImage(labeledImagePath, labeledFileName);

            results.push({
                frame: frame,
                result: result,
                labeledImageUrl: labeledImageUrl
            });

            // Clean up temporary labeled frame
            fs.unlinkSync(labeledImagePath);
        }

        return results;
    } catch (error) {
        console.error('Error processing video:', error);
        throw new Error('Error processing video');
    }
};
