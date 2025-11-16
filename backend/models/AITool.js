const mongoose = require('mongoose');

const aiToolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Сурет генерациялау', 'Мәтін генерациялау', 'Видео генерациялау', 'Аудио генерациялау', 'Басқа']
  },
  url: {
    type: String,
    trim: true
  },
  apiEndpoint: {
    type: String,
    trim: true
  },
  apiKey: {
    type: String,
    select: false // API кілтін қалыпты сұрауларда көрсетпейміз
  },
  features: [{
    type: String
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('AITool', aiToolSchema);
