const express = require('express');
const router = express.Router();
const AITool = require('../models/AITool');
const { protect, adminOnly } = require('../middleware/auth');
const { callGemini } = require('../services/ai/geminiService');
const { getFreeToolsByCategory } = require('../services/ai/freeTools');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
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
      message: 'AI ?????????? ??? ??????',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const aiTool = await AITool.findById(req.params.id);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI ?????? ?????????'
      });
    }

    res.json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI ??????? ??? ??????',
      error: error.message
    });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const aiTool = await AITool.create(req.body);

    res.status(201).json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI ??????? ???? ??????',
      error: error.message
    });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const aiTool = await AITool.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI ?????? ?????????'
      });
    }

    res.json({
      success: true,
      data: aiTool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI ??????? ??????? ??????',
      error: error.message
    });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const aiTool = await AITool.findByIdAndDelete(req.params.id);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI ?????? ?????????'
      });
    }

    res.json({
      success: true,
      message: 'AI ?????? ????????'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI ??????? ????? ??????',
      error: error.message
    });
  }
});

router.post('/:id/use', async (req, res) => {
  try {
    const aiTool = await AITool.findById(req.params.id);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: 'AI ?????? ?????????'
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
      message: '????',
      error: error.message
    });
  }
});

// Soft-deprecated route: now proxied to Gemini-first
router.post('/generate/text', async (req, res) => {
  if (process.env.ENABLE_LEGACY_AI_TEXT_ROUTE === 'false') {
    return res.status(410).json({
      success: false,
      message: 'Legacy text route is disabled',
      errorCode: 'FEATURE_DISABLED'
    });
  }

  res.set('X-API-Deprecated', 'true');
  res.set('X-API-Deprecated-Message', 'Use /api/ai/chat or /api/ai/generate-bundle');

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt ?????'
      });
    }

    const text = await callGemini(prompt, {
      temperature: 0.7,
      maxTokens: 1024
    });

    res.json({
      success: true,
      data: {
        text,
        provider: 'Gemini'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message || '????? ????????? ??????',
      errorCode: 'GEMINI_UNAVAILABLE',
      fallback: {
        freeTools: getFreeToolsByCategory('text')
      }
    });
  }
});

module.exports = router;
