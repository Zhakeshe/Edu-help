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

    console.log('\n🔐 === OTP ТЕКСЕРУ БАСТАЛДЫ ===');
    console.log('Email:', identifier);
    console.log('Код:', code);
    console.log('FullName:', fullName || 'жоқ');

    if (!identifier || !code) {
      console.log('❌ Identifier немесе code жоқ');
      return res.status(400).json({
        success: false,
        message: 'Барлық өрістерді толтырыңыз'
      });
    }

    // Кодты табу
    console.log('🔍 Кодты іздеуде...');
    const otpRecord = await OTP.findOne({
      identifier: identifier.toLowerCase(),
      code: code.trim()
    });

    if (!otpRecord) {
      console.log('❌ Код табылмады немесе қате');
      return res.status(400).json({
        success: false,
        message: 'Қате код немесе мерзімі өтіп кеткен'
      });
    }

    console.log('✅ Код табылды');

    // Мерзімін тексеру
    if (otpRecord.expiresAt < new Date()) {
      console.log('❌ Кодтың мерзімі өтіп кеткен');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Кодтың мерзімі өтіп кеткен. Жаңа код сұраңыз.'
      });
    }

    console.log('✅ Код жарамды');

    // Пайдаланушы немесе админ бар ма тексеру
    console.log('🔍 Пайдаланушыны іздеуде...');
    let existingUser = await User.findOne({ email: identifier.toLowerCase() });

    if (existingUser) {
      console.log('✅ Бар пайдаланушы табылды:', existingUser.email, 'Role:', existingUser.role);
    }

    // Егер User-де жоқ болса, Admin моделінен іздейміз (ескі админдер үшін)
    let existingAdmin = null;
    if (!existingUser) {
      console.log('🔍 Admin моделінен іздеуде...');
      existingAdmin = await Admin.findOne({ email: identifier.toLowerCase() });
      if (existingAdmin) {
        console.log('✅ Ескі админ табылды:', existingAdmin.email);
      } else {
        console.log('ℹ️ Жаңа пайдаланушы - тіркелу қажет');
      }
    }

    let user;
    let isAdmin = false;

    if (existingUser) {
      // ========== БАР ПАЙДАЛАНУШЫ - КІРУ ==========
      console.log('📌 Бар пайдаланушы табылды:', existingUser.email);
      user = existingUser;

      try {
        // stats өрісін тікелей жаңарту (save() middleware-ін өткізіп жіберу үшін)
        await User.findByIdAndUpdate(
          user._id,
          {
            'stats.lastActive': Date.now()
          },
          { new: false } // Жаңартылған құжатты қайтармайды
        );
        console.log('✅ User stats жаңартылды');
      } catch (updateError) {
        console.error('❌ User.findByIdAndUpdate() қатесі:', updateError.message);
        // Қате болса да жалғастыру - stats жаңарту маңызды емес
        console.log('⚠️ Stats жаңарту қатесі өткізілді');
      }

      isAdmin = user.role === 'admin';

    } else if (existingAdmin) {
      // ========== БАР АДМИН (ескі Admin моделінен) - КІРУ ==========
      console.log('📌 Ескі админ табылды, миграциялау...');

      // Тағы бір рет User моделінен тексеру (race condition-нан қорғау)
      const doubleCheckUser = await User.findOne({ email: identifier.toLowerCase() });
      if (doubleCheckUser) {
        console.log('✅ User қазірдің өзінде бар екен, оны пайдаланамыз');
        user = doubleCheckUser;
      } else {
        // Admin моделінен User моделіне көшіреміз
        try {
          user = await User.create({
            fullName: existingAdmin.username || 'Админ',
            email: existingAdmin.email,
            authMethod: 'otp',
            role: 'admin'
          });
          console.log('✅ Админ миграцияланды');
        } catch (createError) {
          console.error('❌ Админ миграция қатесі:', createError.message);

          // Егер duplicate key қатесі болса, қайта іздейміз
          if (createError.code === 11000) {
            console.log('⚠️ Duplicate key, User-ді қайта іздеуде...');
            user = await User.findOne({ email: identifier.toLowerCase() });
            if (!user) {
              throw new Error('User жасау мүмкін болмады және табылмады');
            }
            console.log('✅ User табылды');
          } else {
            throw createError;
          }
        }
      }
      isAdmin = true;

    } else {
      // ========== ЖАҢА ПАЙДАЛАНУШЫ - ТІРКЕЛУ ==========
      console.log('📌 Жаңа пайдаланушы тіркелуде...');

      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Аты-жөніңізді енгізіңіз (тіркелу үшін)',
          requiresFullName: true
        });
      }

      try {
        user = await User.create({
          fullName: fullName.trim(),
          email: identifier.toLowerCase(),
          authMethod: 'otp',
          role: 'user' // Жаңа пайдаланушылар user ретінде тіркеледі
        });
        console.log('✅ Жаңа пайдаланушы тіркелді');
      } catch (createError) {
        console.error('❌ User.create() қатесі:', createError.message);

        // Егер duplicate key қатесі болса, бар пайдаланушыны пайдаланамыз
        if (createError.code === 11000) {
          console.log('⚠️ Duplicate key, User бар екен, оны іздеуде...');
          user = await User.findOne({ email: identifier.toLowerCase() });
          if (!user) {
            throw new Error('User жасау мүмкін болмады және табылмады');
          }
          console.log('✅ Бар User табылды');
        } else {
          throw createError;
        }
      }
    }

    // Кодты өшіру
    console.log('🗑️ Кодты өшіруде...');
    await OTP.deleteOne({ _id: otpRecord._id });

    // Token генерациялау
    console.log('🔑 Token генерациялауда...');
    const token = generateToken(user._id, user.role);

    const responseData = {
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
    };

    console.log('✅ OTP тексеру сәтті аяқталды!');
    console.log('User:', user.email, 'Role:', user.role);
    console.log('=== OTP ТЕКСЕРУ АЯҚТАЛДЫ ===\n');

    res.json(responseData);

  } catch (error) {
    console.error('\n❌ === OTP ТЕКСЕРУ ҚАТЕСІ ===');
    console.error('Қате хабары:', error.message);
    console.error('Қате стегі:', error.stack);
    console.error('=== ҚАТЕ АЯҚТАЛДЫ ===\n');

    res.status(500).json({
      success: false,
      message: 'Қате орын алды. Қайтадан көріңіз.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
