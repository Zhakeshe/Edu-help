const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { fullName, phone, message } = req.body;

    if (!fullName || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: '?????? ????????? ??????????'
      });
    }

    const feedback = await Feedback.create({
      fullName,
      phone,
      message
    });

    res.status(201).json({
      success: true,
      message: '???????????? ?????????!',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '????????? ?????? ??????',
      error: error.message
    });
  }
});

router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const stats = {
      total: await Feedback.countDocuments(),
      new: await Feedback.countDocuments({ status: '????' }),
      read: await Feedback.countDocuments({ status: '??????' }),
      responded: await Feedback.countDocuments({ status: '????? ???????' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '???????????? ??? ??????',
      error: error.message
    });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const feedbacks = await Feedback.find(filter)
      .populate('respondedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '???? ????????????? ??? ??????',
      error: error.message
    });
  }
});

router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('respondedBy', 'fullName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '???? ???????? ?????????'
      });
    }

    if (feedback.status === '????') {
      feedback.status = '??????';
      await feedback.save();
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '???? ?????????? ??? ??????',
      error: error.message
    });
  }
});

router.put('/:id/respond', protect, adminOnly, async (req, res) => {
  try {
    const { adminResponse } = req.body;

    if (!adminResponse) {
      return res.status(400).json({
        success: false,
        message: '????? ?????? ?????'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '???? ???????? ?????????'
      });
    }

    feedback.adminResponse = adminResponse;
    feedback.status = '????? ???????';
    feedback.respondedBy = req.user._id;
    feedback.respondedAt = Date.now();

    await feedback.save();

    const updatedFeedback = await Feedback.findById(req.params.id)
      .populate('respondedBy', 'fullName email');

    res.json({
      success: true,
      message: '????? ?????????',
      data: updatedFeedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '????? ?????? ??????',
      error: error.message
    });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '???? ???????? ?????????'
      });
    }

    res.json({
      success: true,
      message: '???? ???????? ????????'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '???? ?????????? ????? ??????',
      error: error.message
    });
  }
});

module.exports = router;
