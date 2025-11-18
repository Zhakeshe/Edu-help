const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String, // email немесе телефон нөмірі
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 минут
    index: { expires: 0 } // MongoDB TTL index - автоматты өшіру
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Индекс - жылдам іздеу үшін
otpSchema.index({ identifier: 1, code: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 }); // 10 минуттан кейін өшіру

module.exports = mongoose.model('OTP', otpSchema);
