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
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// @route   POST /api/upload
// @desc    Файл(дар) жүктеу (бірнеше файл қолдауымен)
// @access  Private (Тек админдер)
router.post('/upload', protect, adminOnly, upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Файл(дар) таңдалмады'
      });
    }

    const { title, description, classNumber, quarter, category, subject } = req.body;

    // Барлық файлдарды files массивіне жинау
    const filesArray = req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: path.extname(file.originalname).toLowerCase().replace('.', ''),
      fileSize: file.size
    }));

    // Backward compatibility үшін - бірінші файлды негізгі полярға қосамыз
    const firstFile = req.files[0];
    const fileType = path.extname(firstFile.originalname).toLowerCase().replace('.', '');

    const material = await Material.create({
      title,
      description,
      classNumber: parseInt(classNumber),
      quarter: parseInt(quarter),
      category,
      subject,
      // Бірнеше файл
      files: filesArray,
      // Backward compatibility үшін
      fileName: firstFile.originalname,
      filePath: firstFile.path,
      fileType,
      fileSize: firstFile.size,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: material,
      filesCount: filesArray.length
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

// @route   GET /api/materials/preview/:id
// @desc    Материалды браузерде көру (preview)
// @access  Public
router.get('/preview/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Материал табылмады'
      });
    }

    // MIME type анықтау
    const fs = require('fs');
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript'
    };

    const contentType = mimeTypes[material.fileType] || 'application/octet-stream';

    // Файлды оқу және жіберу
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline'); // Браузерде ашу
    fs.createReadStream(material.filePath).pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Файлды көрсету қатесі',
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
