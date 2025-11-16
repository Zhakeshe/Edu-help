const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// JWT token генерациялау
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/users/register
// @desc    Жаңа пайдаланушыны тіркеу
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Пайдаланушы бар ма тексеру
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Бұл email бұрын тіркелген'
      });
    }

    // Жаңа пайдаланушы жасау
    const user = await User.create({
      fullName,
      email,
      password,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Сервер қатесі',
      error: error.message
    });
  }
});

// @route   POST /api/users/login
// @desc    Пайдаланушы кіру
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    let user;
    let role = 'user';

    // Егер админ болса
    if (isAdmin) {
      user = await Admin.findOne({ email });
      role = 'admin';

      if (!user || user.email !== email) {
        // Username-мен де тексеру
        user = await Admin.findOne({ username: email });
      }
    } else {
      // Қалыпты пайдаланушы
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email немесе құпия сөз қате'
      });
    }

    // Құпия сөзді тексеру
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email немесе құпия сөз қате'
      });
    }

    // Соңғы белсенділікті жаңарту
    if (role === 'user') {
      user.stats.lastActive = Date.now();
      await user.save();
    }

    const userData = {
      id: user._id,
      fullName: user.fullName || user.username,
      email: user.email,
      role: role,
      avatar: user.avatar || '',
      apiKeys: user.apiKeys || {},
      token: generateToken(user._id, role)
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Сервер қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/users/me
// @desc    Қазіргі пайдаланушыны алу
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let user;

    if (req.admin) {
      user = req.admin;
    } else if (req.user) {
      user = req.user;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName || user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        apiKeys: user.apiKeys || {},
        stats: user.stats || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Қате',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Профильді жаңарту
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, avatar, apiKeys } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пайдаланушы табылмады'
      });
    }

    if (fullName) user.fullName = fullName;
    if (avatar) user.avatar = avatar;
    if (apiKeys) {
      user.apiKeys = {
        ...user.apiKeys,
        ...apiKeys
      };
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        apiKeys: user.apiKeys
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Профильді жаңарту қатесі',
      error: error.message
    });
  }
});

// @route   PUT /api/users/api-keys
// @desc    API кілттерін жаңарту
// @access  Private
router.put('/api-keys', protect, async (req, res) => {
  try {
    const { gemini, openai, anthropic } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пайдаланушы табылмады'
      });
    }

    if (gemini !== undefined) user.apiKeys.gemini = gemini;
    if (openai !== undefined) user.apiKeys.openai = openai;
    if (anthropic !== undefined) user.apiKeys.anthropic = anthropic;

    await user.save();

    res.json({
      success: true,
      message: 'API кілттері сақталды',
      data: {
        apiKeys: user.apiKeys
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API кілттерін сақтау қатесі',
      error: error.message
    });
  }
});

module.exports = router;
