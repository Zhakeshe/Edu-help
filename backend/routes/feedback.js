const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Кері байланыс жіберу
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, message } = req.body;

    if (!fullName || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Барлық өрістерді толтырыңыз'
      });
    }

    const feedback = await Feedback.create({
      fullName,
      phone,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Хабарламаңыз жіберілді!',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Хабарлама жіберу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/feedback
// @desc    Барлық кері байланыстарды алу
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const feedbacks = await Feedback.find(filter)
      .populate('respondedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Кері байланыстарды алу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/:id
// @desc    Бір кері байланысты алу
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('respondedBy', 'username email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Кері байланыс табылмады'
      });
    }

    // Оқылды деп белгілеу
    if (feedback.status === 'жаңа') {
      feedback.status = 'оқылды';
      await feedback.save();
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Кері байланысты алу қатесі',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Кері байланысқа жауап беру
// @access  Private
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { adminResponse } = req.body;

    if (!adminResponse) {
      return res.status(400).json({
        success: false,
        message: 'Жауап мәтіні қажет'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Кері байланыс табылмады'
      });
    }

    feedback.adminResponse = adminResponse;
    feedback.status = 'жауап берілді';
    feedback.respondedBy = req.user._id;
    feedback.respondedAt = Date.now();

    await feedback.save();

    const updatedFeedback = await Feedback.findById(req.params.id)
      .populate('respondedBy', 'username email');

    res.json({
      success: true,
      message: 'Жауап жіберілді',
      data: updatedFeedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Жауап жіберу қатесі',
      error: error.message
    });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Кері байланысты өшіру
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Кері байланыс табылмады'
      });
    }

    res.json({
      success: true,
      message: 'Кері байланыс өшірілді'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Кері байланысты өшіру қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/stats/overview
// @desc    Кері байланыс статистикасы
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = {
      total: await Feedback.countDocuments(),
      new: await Feedback.countDocuments({ status: 'жаңа' }),
      read: await Feedback.countDocuments({ status: 'оқылды' }),
      responded: await Feedback.countDocuments({ status: 'жауап берілді' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Статистиканы алу қатесі',
      error: error.message
    });
  }
});

module.exports = router;
