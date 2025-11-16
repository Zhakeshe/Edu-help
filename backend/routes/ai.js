const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   POST /api/ai/gemini/generate
// @desc    Gemini арқылы мәтін генерациялау
// @access  Private
router.post('/gemini/generate', protect, async (req, res) => {
  try {
    const { prompt, temperature = 0.7, maxTokens = 1000 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt қажет'
      });
    }

    // Пайдаланушының API кілтін алу
    const user = await User.findById(req.user._id);
    const geminiKey = user.apiKeys?.gemini;

    if (!geminiKey) {
      return res.status(400).json({
        success: false,
        message: 'Gemini API кілтін профильден қосыңыз',
        needsApiKey: true
      });
    }

    // Gemini API-ға сұрау
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Статистиканы жаңарту
    user.stats.aiToolsUsed += 1;
    await user.save();

    res.json({
      success: true,
      data: {
        text: generatedText,
        provider: 'Google Gemini',
        model: 'gemini-pro'
      }
    });

  } catch (error) {
    console.error('Gemini API қатесі:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Мәтін генерациялау қатесі',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// @route   POST /api/ai/test-key
// @desc    API кілтін тексеру
// @access  Private
router.post('/test-key', protect, async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Provider және API кілті қажет'
      });
    }

    let isValid = false;
    let errorMessage = '';

    if (provider === 'gemini') {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            contents: [{
              parts: [{
                text: 'Сәлем'
              }]
            }]
          }
        );
        isValid = true;
      } catch (error) {
        errorMessage = error.response?.data?.error?.message || 'Қате API кілті';
      }
    }

    res.json({
      success: isValid,
      message: isValid ? 'API кілті дұрыс!' : errorMessage,
      isValid
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Тексеру қатесі',
      error: error.message
    });
  }
});

// @route   POST /api/ai/image/generate
// @desc    Сурет генерациялау (болашақта)
// @access  Private
router.post('/image/generate', protect, async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: 'Бұл функция болашақта қосылады. Қазір тегін сілтемелерді қолданыңыз: Bing Image Creator, Leonardo.ai'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Қате',
      error: error.message
    });
  }
});

module.exports = router;
