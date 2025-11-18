const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  classNumber: {
    type: Number,
    required: true,
    min: 2,
    max: 11
  },
  quarter: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  category: {
    type: String,
    required: true,
    enum: ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары', 'Суреттер', 'Басқа']
  },
  subject: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String
    // enum алынды - кез келген файл типіне рұқсат
  },
  fileSize: {
    type: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Жаңарту датасын автоматты түрде өзгерту
materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Material', materialSchema);
