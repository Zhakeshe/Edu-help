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

      // Role-ге қарай пайдаланушыны табу
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
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Рұқсат жоқ, пайдаланушы табылмады'
          });
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
