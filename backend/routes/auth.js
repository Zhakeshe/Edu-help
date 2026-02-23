const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/auth');
const { generateOTP, sendEmailOTP } = require('../utils/sendOTP');

const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 10 * 60 * 1000);
const OTP_SEND_COOLDOWN_MS = Number(process.env.OTP_SEND_COOLDOWN_MS || 60 * 1000);
const OTP_VERIFY_LOCK_MS = Number(process.env.OTP_VERIFY_LOCK_MS || 10 * 60 * 1000);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function generateToken(id, role = 'user') {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
}

function hashOTP(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function setDeprecatedHeaders(res, hint) {
  res.set('X-API-Deprecated', 'true');
  res.set('X-API-Deprecated-Message', hint || 'This endpoint will be removed in a future release');
}

// Deprecated: password-based admin bootstrap
router.post('/register', async (req, res) => {
  try {
    setDeprecatedHeaders(res, 'Admin password register is deprecated. Use OTP flow instead.');

    const { username, email, password } = req.body;
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: '????? ????? ?????????'
      });
    }

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
        token: generateToken(admin._id, 'admin')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '?????? ??????',
      error: error.message
    });
  }
});

// Deprecated: password-based admin login
router.post('/login', async (req, res) => {
  try {
    setDeprecatedHeaders(res, 'Admin password login is deprecated. Use OTP flow instead.');

    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '????? ?????? ????? ??? ????'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '????? ?????? ????? ??? ????'
      });
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        token: generateToken(admin._id, 'admin')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '?????? ??????',
      error: error.message
    });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.admin || req.user
  });
});

router.post('/send-otp', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email ?????????'
      });
    }

    const email = identifier.trim().toLowerCase();
    const isEmail = /^\S+@\S+\.\S+$/.test(email);

    if (!isEmail) {
      return res.status(400).json({
        success: false,
        message: '????? email ?????????'
      });
    }

    const existingOtp = await OTP.findOne({ identifier: email }).sort({ createdAt: -1 });
    if (existingOtp?.cooldownUntil && existingOtp.cooldownUntil > new Date()) {
      const retryAfterSec = Math.ceil((existingOtp.cooldownUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `????? ????? ?????? ???? ${retryAfterSec} ?????? ???????.`,
        retryAfter: retryAfterSec
      });
    }

    const code = generateOTP();
    const codeHash = hashOTP(code);

    await OTP.deleteMany({ identifier: email });

    await OTP.create({
      identifier: email,
      codeHash,
      type: 'email',
      attemptCount: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      cooldownUntil: new Date(Date.now() + OTP_SEND_COOLDOWN_MS),
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    });

    const sendResult = await sendEmailOTP(email, code);

    if (!sendResult.success && !sendResult.devMode) {
      return res.status(400).json({
        success: false,
        message: sendResult.error || '??? ?????? ??????'
      });
    }

    const response = {
      success: true,
      message: '??? email-?? ?????????. 10 ????? ?????? ?????????.',
      expiresIn: Math.floor(OTP_TTL_MS / 1000)
    };

    if (sendResult.devMode && sendResult.code) {
      response.devMode = true;
      response.code = sendResult.code;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '??? ?????? ??????. ???????? ???????.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, code, fullName } = req.body;

    if (!identifier || !code) {
      return res.status(400).json({
        success: false,
        message: '?????? ????????? ??????????'
      });
    }

    const email = identifier.trim().toLowerCase();
    const otpRecord = await OTP.findOne({ identifier: email }).select('+codeHash');

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: '???? ??? ?????? ??????? ???? ??????'
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: '?????? ??????? ???? ??????. ???? ??? ???????.'
      });
    }

    if (otpRecord.attemptCount >= otpRecord.maxAttempts && otpRecord.cooldownUntil && otpRecord.cooldownUntil > new Date()) {
      const retryAfterSec = Math.ceil((otpRecord.cooldownUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `??? ???? ?????????. ${retryAfterSec} ????????? ????? ??????????.`,
        retryAfter: retryAfterSec
      });
    }

    const isValidCode = otpRecord.codeHash === hashOTP(code.trim());

    if (!isValidCode) {
      otpRecord.attemptCount += 1;
      if (otpRecord.attemptCount >= otpRecord.maxAttempts) {
        otpRecord.cooldownUntil = new Date(Date.now() + OTP_VERIFY_LOCK_MS);
      }
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: '???? ??? ?????? ??????? ???? ??????'
      });
    }

    let existingUser = await User.findOne({ email });
    let existingAdmin = null;

    if (!existingUser) {
      existingAdmin = await Admin.findOne({ email });
    }

    let user = existingUser;

    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, {
        'stats.lastActive': Date.now()
      });
    } else if (existingAdmin) {
      const raceUser = await User.findOne({ email });
      if (raceUser) {
        user = raceUser;
      } else {
        try {
          user = await User.create({
            fullName: existingAdmin.username || '?????',
            email: existingAdmin.email,
            authMethod: 'otp',
            role: 'admin'
          });
        } catch (createError) {
          if (createError.code === 11000) {
            user = await User.findOne({ email });
          } else {
            throw createError;
          }
        }
      }
    } else {
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: '???-????????? ????????? (??????? ????)',
          requiresFullName: true
        });
      }

      try {
        user = await User.create({
          fullName: fullName.trim(),
          email,
          authMethod: 'otp',
          role: 'user'
        });
      } catch (createError) {
        if (createError.code === 11000) {
          user = await User.findOne({ email });
        } else {
          throw createError;
        }
      }
    }

    await OTP.deleteMany({ identifier: email });

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      isNewUser: !existingUser && !existingAdmin,
      message: (existingUser || existingAdmin) ? '?????? ????????!' : '??????? ????? ????!',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '???? ???? ????. ???????? ???????.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
