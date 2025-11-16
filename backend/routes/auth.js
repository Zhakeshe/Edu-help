const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// JWT token генерациялау
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Админ тіркеу (алғашқы рет үшін)
// @access  Public (кейін өшіруге болады)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Админ бар ма тексеру
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Админ бұрын тіркелген'
      });
    }

    // Жаңа админ жасау
    const admin = await Admin.create({
      username,
      email,
      password
    });

    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        token: generateToken(admin._id)
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

// @route   POST /api/auth/login
// @desc    Админ кіру
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Админді табу
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Логин немесе құпия сөз қате'
      });
    }

    // Құпия сөзді тексеру
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Логин немесе құпия сөз қате'
      });
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        token: generateToken(admin._id)
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

// @route   GET /api/auth/me
// @desc    Қазіргі админді алу
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.admin
  });
});

module.exports = router;
