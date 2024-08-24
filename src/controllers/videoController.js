const path = require('path');
const fs = require('fs-extra');
const { processVideo } = require('../services/videoService');
const { uploadVideo, uploadJson } = require('../services/gcsService');

exports.uploadAndProcessVideo = async (req, res) => {
    const { videoPath, identifier } = req.body;

    try {
        // Upload the original video to GCS
        const videoUrl = await uploadVideo(videoPath, identifier);

        // Create a temporary folder for extracted frames
        const tempFolder = path.join(__dirname, '../../temp', identifier);
        await fs.ensureDir(tempFolder);

        // Process the video
        const results = await processVideo(videoPath, tempFolder);

        // Save results to JSON and upload to GCS
        const resultFilePath = path.join(__dirname, '../../temp', `${identifier}_result.json`);
        fs.writeFileSync(resultFilePath, JSON.stringify(results, null, 2));

        const resultUrl = await uploadJson(resultFilePath, identifier);

        // Clean up temporary files
        await fs.remove(tempFolder);
        fs.unlinkSync(resultFilePath);

        res.json({ videoUrl, resultUrl, results });
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).send('Error processing video');
    }
};
