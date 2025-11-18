const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// API кілттері
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Public папкаларын жасау
const presentationsDir = path.join(__dirname, '../public/presentations');
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(presentationsDir)) {
  fs.mkdirSync(presentationsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
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
Сіз білім беру саласындағы кәсіби мұғалімсіз. Қазақстан Республикасының жаңартылған білім беру бағдарламасы бойынша толық ҚМЖ (Қысқа мерзімді жоспар) жасаңыз.

**Сабақ туралы мәліметтер:**
- Пән: ${subject}
- Сынып: ${classNumber}-сынып
- Тоқсан: ${quarter}-тоқсан
- Сабақтың тақырыбы: ${theme}
${objectives ? `- Мақсаттар: ${objectives}` : ''}

**ҚМЖ құрылымы (толық мазмұнды):**

**1. Жалпы мәліметтер**
   - Мектеп атауы: [Мектеп атауы]
   - Күні: [Күні]
   - Мұғалімнің аты-жөні: [Мұғалімнің аты-жөні]
   - Сынып: ${classNumber}-сынып
   - Қатысқандар саны: ___ Қатыспағандар: ___
   - Сабақтың тақырыбы: ${theme}

**2. Оқу мақсаттары (3-5 нақты мақсат)**
   - Білімділік: [Оқушылар не білу керек]
   - Дағдылық: [Оқушылар не істей алу керек]
   - Құндылық: [Қандай құндылықтар қалыптасады]

**3. Сабақтың барысы (40-45 минут)**

   **Кіріспе бөлім (5-7 минут):**
   - Ұйымдастыру кезеңі (1-2 мин)
   - Үй тапсырмасын тексеру (2-3 мин)
   - Психологиялық ахуал туғызу (1-2 мин)
   - Сабақтың мақсатымен таныстыру (1 мин)

   **Негізгі бөлім (25-30 минут):**

   *Жаңа материалды меңгерту (10-12 мин):*
   - Қысқаша түсіндірме
   - Бейне/аудио материалдар
   - Диаграммалар, кестелер
   - Мысалдар мен тапсырмалар

   *Практикалық жұмыс (10-12 мин):*
   - Жеке жұмыс: [Тапсырма сипаттамасы]
   - Жұптық жұмыс: [Тапсырма сипаттамасы]
   - Топтық жұмыс: [Тапсырма сипаттамасы]

   *Бекіту (5-6 мин):*
   - Қайталау сұрақтары
   - Ойын элементтері
   - Кері байланыс

   **Қорытынды бөлім (5-8 минут):**
   - Сабақты қорыту (2-3 мин)
   - Рефлексия (2-3 мин)
   - Бағалау (1-2 мин)
   - Үй тапсырмасын түсіндіру (1 мин)

**4. Әдіс-тәсілдер мен стратегиялар**
   - Деңгейлеп оқыту
   - Сын тұрғысынан ойлау
   - Диалогтық оқыту
   - Топтық жұмыс
   - АКТ қолдану
   - Формативті бағалау

**5. Ресурстар мен құрал-жабдықтар**
   - Оқулық: [Атауы, беті]
   - Көрнекіліктер: [Тізім]
   - Техникалық құралдар: [Интерактивті тақта, проектор, т.б.]
   - Қосымша материалдар: [Карточкалар, плакаттар, т.б.]
   - Интернет ресурстары: [Сілтемелер]

**6. Саралау (дифференциация)**
   - Үлгерімі жоғары оқушыларға: [Қиын тапсырмалар]
   - Үлгерімі орташа оқушыларға: [Стандартты тапсырмалар]
   - Қолдау қажет оқушыларға: [Көмек, қосымша түсіндірме]

**7. Бағалау критерийлері**

   *Формативті бағалау:*
   - Ауызша сұрақтар
   - Өзін-өзі бағалау
   - Өзара бағалау
   - Кері байланыс

   *Критерийлер:*
   - "Өте жақсы" (5): [Сипаттама]
   - "Жақсы" (4): [Сипаттама]
   - "Қанағаттанарлық" (3): [Сипаттама]

**8. Рефлексия**
   - Стикерлер (бағдаршам әдісі)
   - Бес саусақ әдісі
   - "Білемін-Білдім-Білгім келеді" кестесі

**9. Үй тапсырмасы**
   - Негізгі тапсырма: [Толық сипаттама]
   - Шығармашылық тапсырма (қосымша): [Сипаттама]
   - Оқулық: § ___, бет ___, жаттығу ___

**10. Қосымша ескертулер**
   - Қауіпсіздік техникасы
   - Денсаулық сақтау технологиялары
   - Құндылықтарды дарыту

---

**МАҢЫЗДЫ ЕРЕЖЕЛЕР:**
- Барлық мәтін қазақ тілінде болуы керек
- Кәсіби, нақты және толық болуы керек
- ${classNumber}-сынып деңгейіне сай
- Заманауи оқыту әдістерін қолдану
- Практикалық тапсырмалар нақты болуы керек
- Уақыт бөлінісі дұрыс болуы керек
`;

    const content = await callGemini(prompt, 0.7, 8000); // Толық ҚМЖ үшін көп token

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

    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    let slideData;
    try {
      slideData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse қатесі:', parseError);
      console.error('AI жауабы:', aiResponse);

      // Егер JSON parse болмаса, мәтін форматында қайтарамыз
      return res.status(500).json({
        success: false,
        message: 'AI жауабын parse ету қатесі. Қайтадан көріңіз.',
        debug: aiResponse.substring(0, 500)
      });
    }

    if (!slideData.slides || !Array.isArray(slideData.slides)) {
      return res.status(500).json({
        success: false,
        message: 'AI дұрыс емес форматта жауап берді. Қайтадан көріңіз.'
      });
    }

    // 2. PPTX файл жасау
    const pptx = new PptxGenJS();

    // Presentation settings
    pptx.author = 'Edu-help';
    pptx.company = 'Edu-help Platform';
    pptx.subject = subject;
    pptx.title = theme;

    // Әр слайдқа түрлі-түсті gradient colors
    const colorSchemes = [
      { primary: '3B82F6', secondary: '1D4ED8', accent: 'DBEAFE', text: '1E3A8A' }, // Blue
      { primary: '8B5CF6', secondary: '6D28D9', accent: 'EDE9FE', text: '5B21B6' }, // Purple
      { primary: 'EC4899', secondary: 'BE185D', accent: 'FCE7F3', text: '9F1239' }, // Pink
      { primary: '10B981', secondary: '047857', accent: 'D1FAE5', text: '065F46' }, // Green
      { primary: 'F59E0B', secondary: 'D97706', accent: 'FEF3C7', text: '92400E' }, // Amber
      { primary: 'EF4444', secondary: 'B91C1C', accent: 'FEE2E2', text: '7F1D1D' }, // Red
      { primary: '06B6D4', secondary: '0E7490', accent: 'CFFAFE', text: '164E63' }, // Cyan
      { primary: 'A855F7', secondary: '7E22CE', accent: 'F3E8FF', text: '6B21A8' }, // Violet
    ];

    slideData.slides.forEach((slideInfo, index) => {
      const slide = pptx.addSlide();
      const colorScheme = colorSchemes[index % colorSchemes.length];
      const isLastSlide = index === slideData.slides.length - 1;

      if (index === 0) {
        // ====== ТИТУЛДЫҚ СЛАЙД ======

        // Gradient background (2 түсті gradient)
        slide.addShape('rect', {
          x: 0, y: 0, w: 10, h: 5.625,
          fill: { type: 'solid', color: colorScheme.accent }
        });

        // Декоративті үлкен дөңгелек (жоғарыда оң жақта)
        slide.addShape('ellipse', {
          x: 7.5, y: -1, w: 4, h: 4,
          fill: { type: 'solid', color: colorScheme.primary, transparency: 20 },
          line: { type: 'none' }
        });

        // Декоративті кіші дөңгелек (төменде сол жақта)
        slide.addShape('ellipse', {
          x: -0.5, y: 4, w: 2.5, h: 2.5,
          fill: { type: 'solid', color: colorScheme.secondary, transparency: 30 },
          line: { type: 'none' }
        });

        // Негізгі тақырып (үлкен шрифт, bold)
        slide.addText(slideInfo.title, {
          x: 1, y: 1.8, w: 8, h: 1.5,
          fontSize: 48,
          bold: true,
          color: colorScheme.primary,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial'
        });

        // Пән атауы (орташа шрифт)
        slide.addText(subject, {
          x: 1, y: 3.4, w: 8, h: 0.5,
          fontSize: 28,
          color: colorScheme.text,
          align: 'center',
          fontFace: 'Arial'
        });

        // Footer жолағы
        slide.addShape('rect', {
          x: 0, y: 5.2, w: 10, h: 0.425,
          fill: { type: 'solid', color: colorScheme.primary }
        });

        slide.addText('📚 Edu-help Platform', {
          x: 0.5, y: 5.25, w: 9, h: 0.35,
          fontSize: 16,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle',
          italic: true,
          fontFace: 'Arial'
        });

      } else if (isLastSlide) {
        // ====== ҚОРЫТЫНДЫ СЛАЙД ======

        // Background
        slide.addShape('rect', {
          x: 0, y: 0, w: 10, h: 5.625,
          fill: { type: 'solid', color: colorScheme.accent }
        });

        // Үлкен градиентті жолақ
        slide.addShape('rect', {
          x: 0, y: 1.5, w: 10, h: 2.5,
          fill: { type: 'solid', color: colorScheme.primary, transparency: 10 }
        });

        // Қорытынды мәтін
        slide.addText(slideInfo.title, {
          x: 1, y: 2, w: 8, h: 1,
          fontSize: 40,
          bold: true,
          color: colorScheme.primary,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial'
        });

        // Қорытынды пункттері
        if (slideInfo.content && slideInfo.content.length > 0) {
          const bulletText = slideInfo.content.map(item => ({
            text: item,
            options: { bullet: { code: '✓' }, fontSize: 18, color: colorScheme.text, paraSpaceBefore: 10 }
          }));

          slide.addText(bulletText, {
            x: 2, y: 3.2, w: 6, h: 2,
            fontSize: 18,
            color: colorScheme.text,
            fontFace: 'Arial'
          });
        }

        // Рахмет мәтіні
        slide.addText('🎓 Назарларыңызға рахмет!', {
          x: 1, y: 4.8, w: 8, h: 0.5,
          fontSize: 22,
          bold: true,
          color: colorScheme.secondary,
          align: 'center',
          fontFace: 'Arial'
        });

      } else {
        // ====== ҚАЛЫПТЫ КОНТЕНТ СЛАЙДТАРЫ ======

        // Ашық түсті background
        slide.addShape('rect', {
          x: 0, y: 0, w: 10, h: 5.625,
          fill: { type: 'solid', color: 'FFFFFF' }
        });

        // Header жолағы (gradient)
        slide.addShape('rect', {
          x: 0, y: 0, w: 10, h: 1.1,
          fill: { type: 'solid', color: colorScheme.primary }
        });

        // Декоративті accent жолақ
        slide.addShape('rect', {
          x: 0, y: 0, w: 0.3, h: 1.1,
          fill: { type: 'solid', color: colorScheme.secondary }
        });

        // Слайд нөмірі (header-де)
        slide.addText(`${index}/${slideData.slides.length - 1}`, {
          x: 8.5, y: 0.3, w: 1, h: 0.5,
          fontSize: 14,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial'
        });

        // Слайд тақырыбы (header-де)
        slide.addText(slideInfo.title, {
          x: 0.5, y: 0.3, w: 7.5, h: 0.5,
          fontSize: 30,
          bold: true,
          color: 'FFFFFF',
          align: 'left',
          valign: 'middle',
          fontFace: 'Arial'
        });

        // Сол жақта түрлі-түсті декоративті жолақ
        slide.addShape('rect', {
          x: 0.5, y: 1.5, w: 0.15, h: 3.5,
          fill: { type: 'solid', color: colorScheme.accent }
        });

        // Content bullets (жақсартылған)
        const bulletText = slideInfo.content.map((item, i) => ({
          text: item,
          options: {
            bullet: { code: '●' },
            fontSize: 20,
            color: colorScheme.text,
            paraSpaceBefore: 14,
            paraSpaceAfter: 6
          }
        }));

        slide.addText(bulletText, {
          x: 1.2, y: 1.7, w: 8, h: 3.5,
          fontSize: 20,
          color: colorScheme.text,
          fontFace: 'Arial',
          lineSpacing: 24
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

// @route   POST /api/ai/generate-image
// @desc    Сурет генерациялау (Hugging Face Stable Diffusion)
// @access  Private
router.post('/generate-image', protect, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Сурет сипаттамасы қажет'
      });
    }

    if (!HUGGINGFACE_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'HUGGINGFACE_API_KEY .env файлында жоқ. Әкімші қосуы керек.'
      });
    }

    // Hugging Face Inference API - Stable Diffusion XL Turbo (жылдам және сапалы)
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo',
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        validateStatus: (status) => status < 600, // Accept all responses to handle errors
        timeout: 60000 // 60 секунд timeout
      }
    );

    // Қате тексеру
    if (response.status !== 200) {
      // Buffer-ді JSON-ға айналдыру
      const errorText = Buffer.from(response.data).toString('utf-8');
      let errorMessage = 'Сурет генерация қатесі';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText;
      }

      // Model loading қатесі
      if (response.status === 503) {
        return res.status(503).json({
          success: false,
          message: 'Модель жүктелуде. 20-30 секундтан кейін қайталап көріңіз.',
          isLoading: true
        });
      }

      // Model deprecated/removed қатесі
      if (response.status === 410) {
        return res.status(410).json({
          success: false,
          message: 'Модель қолжетімді емес. Әкімшіге хабарласыңыз.'
        });
      }

      // API key қатесі
      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({
          success: false,
          message: 'API кілті қате немесе жарамсыз. Әкімші .env файлын тексеруі керек.'
        });
      }

      console.error(`Hugging Face API қатесі [${response.status}]:`, errorMessage);

      return res.status(response.status).json({
        success: false,
        message: errorMessage
      });
    }

    // Суретті файлға сақтау
    const timestamp = Date.now();
    const imageFilename = `image_${timestamp}.png`;
    const imagePath = path.join(imagesDir, imageFilename);

    fs.writeFileSync(imagePath, response.data);

    res.json({
      success: true,
      imageUrl: `/images/${imageFilename}`,
      message: 'Сурет сәтті жасалды!'
    });

  } catch (error) {
    console.error('Сурет генерация қатесі:', error.message);

    res.status(500).json({
      success: false,
      message: 'Сурет генерация қатесі: ' + (error.message || 'Белгісіз қате')
    });
  }
});

module.exports = router;
