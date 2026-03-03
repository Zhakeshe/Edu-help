const mongoose = require('mongoose');

const materialFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['r2', 'local'],
    default: 'r2'
  },
  objectKey: {
    type: String,
    default: ''
  },
  publicUrl: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  }
}, { _id: false });

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
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  files: {
    type: [materialFileSchema],
    default: []
  },
  // Legacy fields
  fileName: {
    type: String
  },
  filePath: {
    type: String
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Material', materialSchema);
