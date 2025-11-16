const express = require('express');
const router = express.Router();
const axios = require('axios');
const AITool = require('../models/AITool');
const { protect } = require('../middleware/auth');

// @route   GET /api/ai-tools
// @desc    Барлық AI құралдарды алу
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let filter = { isActive: true };
    if (category) filter.category = category;

    const aiTools = await AITool.find(filter).sort({ rating: -1, usageCount: -1 });

    res.json({
      success: true,
      count: aiTools.length,
      data: aiTools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI құралдарды алу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/ai-tools/:id
// @desc    Бір AI құралды алу
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const aiTool = await AITool.findById(req.params.id);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI құралы табылмады'
      });
    }

    res.json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI құралды алу қатесі',
      error: error.message
    });
  }
});

// @route   POST /api/ai-tools
// @desc    Жаңа AI құралды қосу
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const aiTool = await AITool.create(req.body);

    res.status(201).json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI құралды қосу қатесі',
      error: error.message
    });
  }
});

// @route   PUT /api/ai-tools/:id
// @desc    AI құралды жаңарту
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const aiTool = await AITool.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI құралы табылмады'
      });
    }

    res.json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI құралды жаңарту қатесі',
      error: error.message
    });
  }
});

// @route   DELETE /api/ai-tools/:id
// @desc    AI құралды өшіру
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const aiTool = await AITool.findByIdAndDelete(req.params.id);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI құралы табылмады'
      });
    }

    res.json({
      success: true,
      message: 'AI құралы өшірілді'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI құралды өшіру қатесі',
      error: error.message
    });
  }
});

// @route   POST /api/ai-tools/:id/use
// @desc    AI құралды пайдалану (санағышты көбейту)
// @access  Public
router.post('/:id/use', async (req, res) => {
  try {
    const aiTool = await AITool.findById(req.params.id);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI құралы табылмады'
      });
    }

    aiTool.usageCount += 1;
    await aiTool.save();

    res.json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Қате',
      error: error.message
    });
  }
});

// @route   POST /api/ai-tools/generate/text
// @desc    Мәтін генерациялау (OpenAI/Anthropic/Google)
// @access  Public
router.post('/generate/text', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', provider = 'openai' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt қажет'
      });
    }

    let response;

    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        success: true,
        data: {
          text: response.data.choices[0].message.content,
          provider: 'OpenAI'
        }
      });
    } else if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        success: true,
        data: {
          text: response.data.content[0].text,
          provider: 'Anthropic Claude'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'API кілті қойылмаған немесе provider қолдауы жоқ'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Мәтін генерациялау қатесі',
      error: error.message
    });
  }
});

module.exports = router;
