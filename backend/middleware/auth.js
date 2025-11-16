const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token-ды алу
      token = req.headers.authorization.split(' ')[1];

      // Token-ды тексеру
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Админді табу
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Рұқсат жоқ, админ табылмады'
        });
      }

      next();
    } catch (error) {
      console.error('Auth қатесі:', error);
      return res.status(401).json({
        success: false,
        message: 'Рұқсат жоқ, қате token'
        });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Рұқсат жоқ, token жоқ'
    });
  }
};

module.exports = { protect };
