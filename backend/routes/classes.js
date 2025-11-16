const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// @route   GET /api/classes
// @desc    Барлық сыныптар тізімін алу (2-11)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const classes = [];

    for (let i = 2; i <= 11; i++) {
      const materialsCount = await Material.countDocuments({ classNumber: i });

      classes.push({
        number: i,
        name: `${i} сынып`,
        materialsCount,
        quarters: [
          {
            number: 1,
            name: '1-тоқсан',
            categories: ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары']
          },
          {
            number: 2,
            name: '2-тоқсан',
            categories: ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары']
          },
          {
            number: 3,
            name: '3-тоқсан',
            categories: ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары']
          },
          {
            number: 4,
            name: '4-тоқсан',
            categories: ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары']
          }
        ]
      });
    }

    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Сыныптарды алу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/classes/:classNumber
// @desc    Бір сыныптың деректерін алу
// @access  Public
router.get('/:classNumber', async (req, res) => {
  try {
    const classNumber = parseInt(req.params.classNumber);

    if (classNumber < 2 || classNumber > 11) {
      return res.status(400).json({
        success: false,
        message: 'Сынып нөмірі 2-ден 11-ге дейін болуы керек'
      });
    }

    const quarters = [];

    for (let q = 1; q <= 4; q++) {
      const categories = {};

      for (const category of ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары']) {
        const materials = await Material.find({
          classNumber,
          quarter: q,
          category
        }).select('title description fileName fileType createdAt downloads');

        categories[category] = materials;
      }

      quarters.push({
        number: q,
        name: `${q}-тоқсан`,
        materials: categories
      });
    }

    res.json({
      success: true,
      data: {
        classNumber,
        name: `${classNumber} сынып`,
        quarters
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Сынып деректерін алу қатесі',
      error: error.message
    });
  }
});

// @route   GET /api/classes/:classNumber/stats
// @desc    Сынып статистикасын алу
// @access  Public
router.get('/:classNumber/stats', async (req, res) => {
  try {
    const classNumber = parseInt(req.params.classNumber);

    const stats = {
      totalMaterials: await Material.countDocuments({ classNumber }),
      byQuarter: {},
      byCategory: {}
    };

    for (let q = 1; q <= 4; q++) {
      stats.byQuarter[`quarter${q}`] = await Material.countDocuments({
        classNumber,
        quarter: q
      });
    }

    for (const category of ['ҚМЖ', 'Презентациялар', 'Жұмыс парақтары']) {
      stats.byCategory[category] = await Material.countDocuments({
        classNumber,
        category
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Статистиканы алу қатесі',
      error: error.message
    });
  }
});

module.exports = router;
