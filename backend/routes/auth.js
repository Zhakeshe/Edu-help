const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/auth');
const { generateOTP, sendEmailOTP } = require('../utils/sendOTP');

// JWT token генерациялау
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
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
    data: req.admin || req.user
  });
});

// ========================================
// OTP AUTHENTICATION (Email/Phone + Code)
// ========================================

// @route   POST /api/auth/send-otp
// @desc    Email-ге код жіберу
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { identifier } = req.body; // identifier = email

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email енгізіңіз'
      });
    }

    // Email екенін тексеру
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);

    if (!isEmail) {
      return res.status(400).json({
        success: false,
        message: 'Дұрыс email енгізіңіз'
      });
    }

    // 6 санды код генерациялау
    const code = generateOTP();

    // Ескі кодтарды өшіру
    await OTP.deleteMany({ identifier: identifier.toLowerCase() });

    // Жаңа код сақтау
    await OTP.create({
      identifier: identifier.toLowerCase(),
      code,
      type: 'email',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 минут
    });

    // Email жіберу
    const sendResult = await sendEmailOTP(identifier, code);

    // Development mode-та кодты қайтарамыз
    if (sendResult.devMode) {
      return res.json({
        success: true,
        message: 'Код email-ге жіберілді',
        devMode: true,
        code: sendResult.code // Тек development-та
      });
    }

    if (!sendResult.success) {
      return res.status(400).json({
        success: false,
        message: sendResult.error || 'Код жіберу қатесі'
      });
    }

    res.json({
      success: true,
      message: 'Код email-ге жіберілді. 10 минут ішінде енгізіңіз.',
      expiresIn: 600 // секундтарда
    });

  } catch (error) {
    console.error('OTP жіберу қатесі:', error);
    res.status(500).json({
      success: false,
      message: 'Код жіберу қатесі. Қайтадан көріңіз.',
      error: error.message
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Кодты тексеру және кіру/тіркелу (USER және ADMIN үшін)
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, code, fullName } = req.body;

    if (!identifier || !code) {
      return res.status(400).json({
        success: false,
        message: 'Барлық өрістерді толтырыңыз'
      });
    }

    // Кодты табу
    const otpRecord = await OTP.findOne({
      identifier: identifier.toLowerCase(),
      code: code.trim()
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Қате код немесе мерзімі өтіп кеткен'
      });
    }

    // Мерзімін тексеру
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Кодтың мерзімі өтіп кеткен. Жаңа код сұраңыз.'
      });
    }

    // Пайдаланушы немесе админ бар ма тексеру
    let existingUser = await User.findOne({ email: identifier.toLowerCase() });

    // Егер User-де жоқ болса, Admin моделінен іздейміз (ескі админдер үшін)
    let existingAdmin = null;
    if (!existingUser) {
      existingAdmin = await Admin.findOne({ email: identifier.toLowerCase() });
    }

    let user;
    let isAdmin = false;

    if (existingUser) {
      // ========== БАР ПАЙДАЛАНУШЫ - КІРУ ==========
      user = existingUser;
      user.stats.lastActive = Date.now();
      await user.save();
      isAdmin = user.role === 'admin';

    } else if (existingAdmin) {
      // ========== БАР АДМИН (ескі Admin моделінен) - КІРУ ==========
      // Admin моделінен User моделіне көшіреміз
      user = await User.create({
        fullName: existingAdmin.username,
        email: existingAdmin.email,
        authMethod: 'otp',
        role: 'admin'
      });
      isAdmin = true;

    } else {
      // ========== ЖАҢА ПАЙДАЛАНУШЫ - ТІРКЕЛУ ==========
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Аты-жөніңізді енгізіңіз (тіркелу үшін)',
          requiresFullName: true
        });
      }

      user = await User.create({
        fullName: fullName.trim(),
        email: identifier.toLowerCase(),
        authMethod: 'otp',
        role: 'user' // Жаңа пайдаланушылар user ретінде тіркеледі
      });
    }

    // Кодты өшіру
    await OTP.deleteOne({ _id: otpRecord._id });

    // Token генерациялау
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      isNewUser: !existingUser && !existingAdmin,
      message: (existingUser || existingAdmin) ? 'Жүйеге кірдіңіз!' : 'Тіркелу сәтті өтті!',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('OTP тексеру қатесі:', error);
    res.status(500).json({
      success: false,
      message: 'Қате орын алды. Қайтадан көріңіз.',
      error: error.message
    });
  }
});

module.exports = router;
