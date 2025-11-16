const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// Gemini API кілті (әкімші .env файлына қосады)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Public презентациялар папкасын жасау
const presentationsDir = path.join(__dirname, '../public/presentations');
if (!fs.existsSync(presentationsDir)) {
  fs.mkdirSync(presentationsDir, { recursive: true });
}

// Gemini API helper function
async function callGemini(prompt, temperature = 0.7, maxTokens = 2048) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY .env файлында жоқ. Әкімші қосуы керек.');
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API қатесі:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Gemini API қатесі');
  }
}

// @route   POST /api/ai/chat
// @desc    Gemini чат (ChatGPT сияқты)
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Хабарлама қажет'
      });
    }

    // Тарихты қосып, толық prompt жасау
    let fullPrompt = 'Сіз білім беру материалдарын дайындауға көмектесетін AI көмекшісіз. Сұрақтарға қазақ тілінде жауап беріңіз.\n\n';

    // Соңғы тарих (контекст үшін)
    if (history.length > 0) {
      fullPrompt += 'Чат тарихы:\n';
      history.forEach(msg => {
        const role = msg.role === 'user' ? 'Пайдаланушы' : 'Көмекші';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
      fullPrompt += '\n';
    }

    fullPrompt += `Пайдаланушы: ${message}\nКөмекші:`;

    const response = await callGemini(fullPrompt, 0.8, 2048);

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('Chat қатесі:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Chat қатесі'
    });
  }
});

// @route   POST /api/ai/generate-kmzh
// @desc    ҚМЖ (Қысқа мерзімді жоспар) генерациялау
// @access  Private
router.post('/generate-kmzh', protect, async (req, res) => {
  try {
    const { subject, classNumber, quarter, theme, objectives } = req.body;

    if (!subject || !classNumber || !quarter || !theme) {
      return res.status(400).json({
        success: false,
        message: 'Барлық қажетті өрістерді толтырыңыз'
      });
    }

    const prompt = `
Мына мәліметтерге сүйене отырып, толық ҚМЖ (Қысқа мерзімді жоспар) жаса:

Пән: ${subject}
Сынып: ${classNumber}
Тоқсан: ${quarter}
Тақырып: ${theme}
${objectives ? `Мақсаттар: ${objectives}` : ''}

ҚМЖ мына бөлімдерді қамтуы керек:
1. Сабақтың тақырыбы
2. Оқу мақсаттары
3. Сабақтың барысы (Ұйымдастыру, Жаңа материал, Бекіту, Қорытынды)
4. Әдіс-тәсілдер
5. Ресурстар
6. Бағалау критерийлері
7. Үй тапсырмасы

Толық, қазақ тілінде, кәсіби нұсқа жаса.
`;

    const content = await callGemini(prompt, 0.7, 3000);

    const filename = `${subject}_${classNumber}сынып_${quarter}тоқсан_${theme.replace(/\s+/g, '_')}.txt`;

    res.json({
      success: true,
      content: content,
      filename: filename
    });

  } catch (error) {
    console.error('ҚМЖ генерация қатесі:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'ҚМЖ генерация қатесі'
    });
  }
});

// @route   POST /api/ai/generate-presentation
// @desc    Презентация .PPTX генерациялау
// @access  Private
router.post('/generate-presentation', protect, async (req, res) => {
  try {
    const { subject, theme, slides, details } = req.body;

    if (!subject || !theme || !slides) {
      return res.status(400).json({
        success: false,
        message: 'Барлық қажетті өрістерді толтырыңыз'
      });
    }

    // 1. Gemini-ден слайд мазмұнын алу
    const prompt = `
Мына мәліметтерге сүйене отырып, ${slides} слайдтан тұратын презентацияны JSON форматында жаса:

Пән: ${subject}
Тақырып: ${theme}
${details ? `Қосымша ақпарат: ${details}` : ''}

МАҢЫЗДЫ: Жауапты МІНДЕТТІ түрде мына JSON форматында бер:
{
  "slides": [
    {
      "title": "Слайд атауы (қысқа)",
      "content": [
        "Бірінші пункт",
        "Екінші пункт",
        "Үшінші пункт"
      ]
    }
  ]
}

Ережелер:
- Дәл ${slides} слайд жаса
- Әрбір слайдтың атауы қысқа болсын (5-8 сөз)
- Әрбір слайдта 3-5 пункт болсын
- Барлық мәтін қазақ тілінде
- 1-слайд: Титулдық (тақырып)
- Соңғы слайд: Қорытынды
- Мәтін түсінікті және білім беру мақсатына сай
`;

    const aiResponse = await callGemini(prompt, 0.7, 4000);

    // JSON parse (Gemini кейде ```json ``` қосып жібереді, оны алып тастаймыз)
    let jsonText = aiResponse.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n/, '').replace(/\n```$/, '');
    }

    const slideData = JSON.parse(jsonText);

    // 2. PPTX файл жасау
    const pptx = new PptxGenJS();

    // Presentation settings
    pptx.author = 'Edu-help';
    pptx.company = 'Edu-help Platform';
    pptx.subject = subject;
    pptx.title = theme;

    // Theme colors
    const primaryColor = '4F46E5';  // Indigo
    const secondaryColor = '7C3AED'; // Purple
    const textColor = '1F2937';     // Gray-800

    slideData.slides.forEach((slideInfo, index) => {
      const slide = pptx.addSlide();

      // Background gradient
      slide.background = { color: 'F9FAFB' };

      if (index === 0) {
        // Титулдық слайд
        slide.addText(slideInfo.title, {
          x: 0.5,
          y: 2.0,
          w: 9.0,
          h: 1.5,
          fontSize: 44,
          bold: true,
          color: primaryColor,
          align: 'center',
          valign: 'middle'
        });

        slide.addText(subject, {
          x: 0.5,
          y: 3.8,
          w: 9.0,
          h: 0.5,
          fontSize: 24,
          color: textColor,
          align: 'center'
        });

        // Footer
        slide.addText('Edu-help Platform', {
          x: 0.5,
          y: 5.0,
          w: 9.0,
          h: 0.3,
          fontSize: 14,
          color: '6B7280',
          align: 'center',
          italic: true
        });
      } else {
        // Қалыпты слайдтар
        // Header with gradient box
        slide.addShape('rect', {
          x: 0,
          y: 0,
          w: 10,
          h: 1.0,
          fill: { type: 'solid', color: primaryColor }
        });

        slide.addText(slideInfo.title, {
          x: 0.5,
          y: 0.25,
          w: 9.0,
          h: 0.5,
          fontSize: 28,
          bold: true,
          color: 'FFFFFF',
          align: 'left',
          valign: 'middle'
        });

        // Content bullets
        const bulletText = slideInfo.content.map(item => ({
          text: item,
          options: { bullet: true, fontSize: 18, color: textColor, paraSpaceBefore: 12 }
        }));

        slide.addText(bulletText, {
          x: 1.0,
          y: 1.8,
          w: 8.0,
          h: 3.5,
          fontSize: 18,
          color: textColor
        });

        // Slide number
        slide.addText(`${index + 1} / ${slideData.slides.length}`, {
          x: 8.5,
          y: 5.2,
          w: 1.0,
          h: 0.3,
          fontSize: 12,
          color: '9CA3AF',
          align: 'right'
        });
      }
    });

    // 3. Файлды сақтау
    const timestamp = Date.now();
    const pptxFilename = `${subject}_${theme.replace(/\s+/g, '_')}_${timestamp}.pptx`;
    const pptxPath = path.join(presentationsDir, pptxFilename);

    await pptx.writeFile({ fileName: pptxPath });

    // 4. Text content (preview үшін)
    let textContent = '';
    slideData.slides.forEach((slideInfo, index) => {
      textContent += `═══════════════════════\n`;
      textContent += `СЛАЙД ${index + 1}: ${slideInfo.title}\n`;
      textContent += `═══════════════════════\n`;
      slideInfo.content.forEach(item => {
        textContent += `• ${item}\n`;
      });
      textContent += `\n`;
    });

    res.json({
      success: true,
      content: textContent,
      filename: `${subject}_${theme.replace(/\s+/g, '_')}_презентация.txt`,
      pptxUrl: `/presentations/${pptxFilename}`,
      message: 'Презентация .PPTX форматында дайын!'
    });

  } catch (error) {
    console.error('Презентация генерация қатесі:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Презентация генерация қатесі'
    });
  }
});

module.exports = router;
