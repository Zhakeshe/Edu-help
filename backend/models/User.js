const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Аты-жөніңізді енгізіңіз'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email енгізіңіз'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Дұрыс email енгізіңіз']
  },
  password: {
    type: String,
    required: [true, 'Құпия сөз енгізіңіз'],
    minlength: [6, 'Құпия сөз кем дегенде 6 символ болуы керек']
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // API кілттері - пайдаланушы өзі қосады
  apiKeys: {
    gemini: { type: String, default: '' },
    openai: { type: String, default: '' },
    anthropic: { type: String, default: '' }
  },
  // Статистика
  stats: {
    materialsDownloaded: { type: Number, default: 0 },
    aiToolsUsed: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Құпия сөзді хэштеу
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Құпия сөзді тексеру
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
