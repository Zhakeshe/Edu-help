const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token-ды алу
      token = req.headers.authorization.split(' ')[1];

      // Token-ды тексеру
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Пайдаланушыны табу - алдымен User моделінен (OTP + миграцияланған админдер)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        // User моделінде жоқ болса, ескі Admin моделінен іздеу (backward compatibility)
        if (decoded.role === 'admin') {
          req.admin = await Admin.findById(decoded.id).select('-password');
          req.user = req.admin; // Жалпы қолдану үшін

          if (!req.admin) {
            return res.status(401).json({
              success: false,
              message: 'Рұқсат жоқ, пайдаланушы табылмады'
            });
          }
        } else {
          return res.status(401).json({
            success: false,
            message: 'Рұқсат жоқ, пайдаланушы табылмады'
          });
        }
      } else {
        // User табылды - admin болса req.admin-ке де қою
        if (req.user.role === 'admin') {
          req.admin = req.user;
        }
      }

      next();
    } catch (error) {
      console.error('Auth қатесі:', error);
      return res.status(401).json({
        success: false,
        message: 'Рұқсат жоқ, қате token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Рұқсат жоқ, token жоқ'
    });
  }
};

// Тек админдерге рұқсат
const adminOnly = async (req, res, next) => {
  if (req.admin || req.user?.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Тек админдерге рұқсат'
    });
  }
};

module.exports = { protect, adminOnly };
