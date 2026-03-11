const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const openaiService = require('../utils/openai');
const VideoUtils = require('../utils/supabase/videoUtils');
const UserUtils = require('../utils/supabase/userUtils');

// @route    POST api/videos/transcribe
// @desc     Transcribe a video/audio file
// @access   Private
router.post('/transcribe', auth, [
  body('videoUrl', 'Video URL is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { videoUrl } = req.body;

    // Initialize Supabase utilities
    const userUtils = new UserUtils(req.supabase);
    const videoUtils = new VideoUtils(req.supabase);

    // Check user credits
    const user = await userUtils.getUserById(req.user.id);
    if (user.credits <= 0) {
      return res.status(400).json({ msg: 'Insufficient credits' });
    }

    // Create a new video record
    const newVideo = await videoUtils.createVideo({
      userId: req.user.id,
      originalUrl: videoUrl,
      title: 'Transcription: ' + new URL(videoUrl).pathname.split('/').pop(),
      type: 'transcription',
      status: 'processing'
    });

    // Update user credits
    await userUtils.updateUser(req.user.id, { credits: user.credits - 1 });

    try {
      // Download the file from URL
      const filePath = await openaiService.downloadFileFromUrl(videoUrl);
      
      // Process with OpenAI
      const result = await openaiService.transcribeAudio(filePath);
      
      // Update the video record with results
      await videoUtils.updateVideo(newVideo.id, {
        status: 'completed',
        result: result,
        processed_url: `https://example.com/results/${newVideo.id}`
      });
      
      // Clean up temporary file
      const fs = require('fs');
      fs.unlinkSync(filePath);

      // Fetch the updated video to return
      const updatedVideo = await videoUtils.getVideoById(newVideo.id);
      res.json(updatedVideo);
    } catch (err) {
      console.error(err.message);
      
      // Update video status to failed
      await videoUtils.updateVideo(newVideo.id, { status: 'failed' });
      
      res.status(500).json({ msg: 'Processing failed', error: err.message });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/videos/translate
// @desc     Translate a video/audio file
// @access   Private
router.post('/translate', auth, [
  body('videoUrl', 'Video URL is required').not().isEmpty(),
  body('targetLanguage', 'Target language is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { videoUrl, targetLanguage } = req.body;

    // Initialize Supabase utilities
    const userUtils = new UserUtils(req.supabase);
    const videoUtils = new VideoUtils(req.supabase);

    // Check user credits
    const user = await userUtils.getUserById(req.user.id);
    if (user.credits <= 0) {
      return res.status(400).json({ msg: 'Insufficient credits' });
    }

    // Create a new video record
    const newVideo = await videoUtils.createVideo({
      userId: req.user.id,
      originalUrl: videoUrl,
      title: `Translation (${targetLanguage}): ` + new URL(videoUrl).pathname.split('/').pop(),
      type: 'translation',
      status: 'processing'
    });

    // Update user credits
    await userUtils.updateUser(req.user.id, { credits: user.credits - 1 });

    try {
      // Download the file from URL
      const filePath = await openaiService.downloadFileFromUrl(videoUrl);
      
      // Process with OpenAI
      const result = await openaiService.translateAudio(filePath);
      
      // Update the video record with results
      await videoUtils.updateVideo(newVideo.id, {
        status: 'completed',
        result: result,
        processed_url: `https://example.com/results/${newVideo.id}`
      });
      
      // Clean up temporary file
      const fs = require('fs');
      fs.unlinkSync(filePath);

      // Fetch the updated video to return
      const updatedVideo = await videoUtils.getVideoById(newVideo.id);
      res.json(updatedVideo);
    } catch (err) {
      console.error(err.message);
      
      // Update video status to failed
      await videoUtils.updateVideo(newVideo.id, { status: 'failed' });
      
      res.status(500).json({ msg: 'Processing failed', error: err.message });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/videos
// @desc     Get all user videos
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const videoUtils = new VideoUtils(req.supabase);
    const videos = await videoUtils.getVideosByUserId(req.user.id);
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;