const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const mime = require('mime-types');
const Material = require('../models/Material');
const { protect, adminOnly } = require('../middleware/auth');
const {
  isR2Configured,
  uploadBuffer,
  deleteObject,
  getObjectSignedUrl,
  inferContentType
} = require('../services/storage/r2Storage');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const dangerousTypes = /\.exe$|\.bat$|\.cmd$|\.sh$|\.app$/i;
    if (dangerousTypes.test(file.originalname)) {
      cb(new Error('??????? ???? ????! .exe, .bat, .cmd, .sh ??????? ?????? ?????????.'));
      return;
    }

    cb(null, true);
  },
  limits: { fileSize: Number(process.env.FILE_MAX_BYTES || 100 * 1024 * 1024) }
});

function buildLegacyLocalFile(material) {
  if (!material?.filePath) return null;
  const isHttpUrl = /^https?:\/\//i.test(material.filePath);
  return {
    provider: isHttpUrl ? 'r2' : 'local',
    fileName: material.fileName || path.basename(material.filePath),
    filePath: isHttpUrl ? '' : material.filePath,
    publicUrl: isHttpUrl ? material.filePath : '',
    fileType: material.fileType || path.extname(material.filePath).replace('.', '').toLowerCase(),
    fileSize: material.fileSize || 0,
    contentType: inferContentType(material.fileName || material.filePath)
  };
}

function resolvePrimaryFile(material) {
  if (Array.isArray(material.files) && material.files.length > 0) {
    return material.files[0];
  }

  return buildLegacyLocalFile(material);
}

async function saveLocalFromBuffer(file) {
  const uploadsDir = path.join(__dirname, '../uploads');
  await fsp.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.originalname);
  const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueFileName);

  await fsp.writeFile(filePath, file.buffer);

  return {
    provider: 'local',
    fileName: file.originalname,
    filePath,
    fileType: ext.replace('.', '').toLowerCase(),
    contentType: file.mimetype || inferContentType(file.originalname),
    fileSize: file.size
  };
}

router.post('/upload', protect, adminOnly, upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '????(???) ??????????'
      });
    }

    const { title, description, classNumber, quarter, category, subject } = req.body;

    if (!title || !classNumber || !quarter || !category) {
      return res.status(400).json({
        success: false,
        message: '???????, ?????, ?????? ???? ????????? ????????'
      });
    }

    const allowLocalFallback = process.env.ALLOW_LOCAL_STORAGE_FALLBACK === 'true';
    if (!isR2Configured && !allowLocalFallback) {
      return res.status(503).json({
        success: false,
        message: 'R2 storage ?????????????? ???. R2 env ????????????? ?????????.'
      });
    }

    const filesArray = [];

    for (const file of req.files) {
      if (isR2Configured) {
        const uploaded = await uploadBuffer({
          buffer: file.buffer,
          originalName: file.originalname,
          folder: 'materials',
          contentType: file.mimetype
        });

        filesArray.push({
          provider: uploaded.provider,
          objectKey: uploaded.objectKey,
          publicUrl: uploaded.publicUrl || '',
          fileName: file.originalname,
          fileType: path.extname(file.originalname).replace('.', '').toLowerCase(),
          contentType: uploaded.contentType,
          fileSize: file.size,
          filePath: ''
        });
      } else {
        filesArray.push(await saveLocalFromBuffer(file));
      }
    }

    const firstFile = filesArray[0];

    const material = await Material.create({
      title,
      description,
      classNumber: parseInt(classNumber, 10),
      quarter: parseInt(quarter, 10),
      category,
      subject,
      files: filesArray,
      // legacy fields for backward compatibility
      fileName: firstFile.fileName,
      filePath: firstFile.filePath || firstFile.publicUrl,
      fileType: firstFile.fileType,
      fileSize: firstFile.fileSize,
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
      message: '???? ?????? ??????',
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { classNumber, quarter, category, subject } = req.query;

    const filter = {};

    if (classNumber) filter.classNumber = parseInt(classNumber, 10);
    if (quarter) filter.quarter = parseInt(quarter, 10);
    if (category) filter.category = category;
    if (subject) filter.subject = subject;

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '????????????? ??? ??????',
      error: error.message
    });
  }
});

router.get('/preview/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '???????? ?????????'
      });
    }

    const file = resolvePrimaryFile(material);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: '???? ???? ?????????'
      });
    }

    if (file.provider === 'r2' && file.objectKey) {
      const signedUrl = await getObjectSignedUrl(file.objectKey, { expiresIn: 900 });
      return res.redirect(signedUrl);
    }

    if (file.provider === 'r2' && file.publicUrl) {
      return res.redirect(file.publicUrl);
    }

    if (!file.filePath || !fs.existsSync(file.filePath)) {
      return res.status(404).json({
        success: false,
        message: '???? ???????? ?????????'
      });
    }

    res.setHeader('Content-Type', file.contentType || mime.lookup(file.fileName) || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');

    const stream = fs.createReadStream(file.filePath);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: '?????? ??? ??????? ???? ????? ?????',
          error: err.message
        });
      }
    });
    stream.pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '?????? ??????? ??????',
        error: error.message
      });
    }
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '???????? ?????????'
      });
    }

    const file = resolvePrimaryFile(material);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: '???? ???? ?????????'
      });
    }

    material.downloads += 1;
    await material.save();

    if (file.provider === 'r2' && file.objectKey) {
      const signedUrl = await getObjectSignedUrl(file.objectKey, {
        expiresIn: 900,
        downloadFileName: file.fileName
      });
      return res.redirect(signedUrl);
    }

    if (file.provider === 'r2' && file.publicUrl) {
      return res.redirect(file.publicUrl);
    }

    if (!file.filePath || !fs.existsSync(file.filePath)) {
      return res.status(404).json({
        success: false,
        message: '???? ???????? ?????????'
      });
    }

    res.download(file.filePath, file.fileName, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: '?????? ?????? ??????? ???? ????? ?????',
          error: err.message
        });
      }
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '?????? ?????? ??????',
        error: error.message
      });
    }
  }
});

router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'fullName email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '???????? ?????????'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '?????????? ??? ??????',
      error: error.message
    });
  }
});

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
        message: '???????? ?????????'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '?????????? ??????? ??????',
      error: error.message
    });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '???????? ?????????'
      });
    }

    const files = Array.isArray(material.files) ? material.files : [];

    for (const file of files) {
      if (file.provider === 'r2' && file.objectKey) {
        try {
          await deleteObject(file.objectKey);
        } catch (err) {
          console.error('R2 delete error:', err.message);
        }
      } else if (file.filePath && fs.existsSync(file.filePath)) {
        try {
          fs.unlinkSync(file.filePath);
        } catch (err) {
          console.error('Local delete error:', err.message);
        }
      }
    }

    if (material.filePath && fs.existsSync(material.filePath)) {
      try {
        fs.unlinkSync(material.filePath);
      } catch (err) {
        console.error('Legacy local delete error:', err.message);
      }
    }

    await material.deleteOne();

    res.json({
      success: true,
      message: '???????? ????????'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '?????????? ????? ??????',
      error: error.message
    });
  }
});

module.exports = router;
