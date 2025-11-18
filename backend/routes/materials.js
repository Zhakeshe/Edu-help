const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const { protect, adminOnly } = require('../middleware/auth');

// Multer конфигурациясы
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Барлық файл типтеріне рұқсат беру
  // Тек қауіпті файлдарды блоктау (.exe, .bat, .sh, т.б.)
  const dangerousTypes = /\.exe$|\.bat$|\.cmd$|\.sh$|\.app$/i;
  const isDangerous = dangerousTypes.test(file.originalname);

  if (isDangerous) {
    cb(new Error('Қауіпті файл типі! .exe, .bat, .cmd, .sh файлдар рұқсат етілмейді.'));
  } else {
    cb(null, true); // Барлық басқа файлдарға рұқсат
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// @route   POST /api/upload
// @desc    Файл жүктеу
// @access  Private (Тек админдер)
router.post('/upload', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл таңдалмады'
      });
    }

    const { title, description, classNumber, quarter, category, subject } = req.body;

    const fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const material = await Material.create({
      title,
      description,
      classNumber: parseInt(classNumber),
      quarter: parseInt(quarter),
      category,
      subject,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType,
      fileSize: req.file.size,
      uploadedBy: req.user._id  // req.admin емес, req.user қолданамыз
    });

    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Файл жүктеу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/materials
// @desc    Барлық материалдарды алу (фильтрлеумен)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { classNumber, quarter, category, subject } = req.query;

    let filter = {};

    if (classNumber) filter.classNumber = parseInt(classNumber);
    if (quarter) filter.quarter = parseInt(quarter);
    if (category) filter.category = category;
    if (subject) filter.subject = subject;

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Материалдарды алу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/materials/download/:id
// @desc    Материалды жүктеп алу
// @access  Public
router.get('/download/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Материал табылмады'
      });
    }

    // Жүктеу санағышын көбейту
    material.downloads += 1;
    await material.save();

    res.download(material.filePath, material.fileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Файлды жүктеу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/materials/:id
// @desc    Бір материалды алу
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'username email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Материал табылмады'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Материалды алу қатесі',
      error: error.message
    });
  }
});

// @route   PUT /api/materials/:id
// @desc    Материалды жаңарту
// @access  Private (Тек админдер)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Материал табылмады'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Материалды жаңарту қатесі',
      error: error.message
    });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Материалды өшіру
// @access  Private (Тек админдер)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Материал табылмады'
      });
    }

    // Файлды файл жүйесінен өшіру
    const fs = require('fs');
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }

    await material.deleteOne();

    res.json({
      success: true,
      message: 'Материал өшірілді'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Материалды өшіру қатесі',
      error: error.message
    });
  }
});

module.exports = router;
