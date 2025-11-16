const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// Gemini API кілті (әкімші .env файлына қосады)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini API helper function
async function callGemini(prompt, temperature = 0.7, maxTokens = 2048) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY .env файлында жоқ. Әкімші қосуы керек.');
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
// @desc    Презентация мәтінін генерациялау
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

    const prompt = `
Мына мәліметтерге сүйене отырып, презентация үшін слайд мәтіндерін жаса:

Пән: ${subject}
Тақырып: ${theme}
Слайдтар саны: ${slides}
${details ? `Қосымша ақпарат: ${details}` : ''}

Әрбір слайд үшін:
1. Слайд нөмірі және атауы
2. Негізгі мазмұн (bullet points)
3. Қосымша түсініктемелер

Презентация оқушыларға түсінікті, визуалды және білім беру мақсатына сай болуы керек.
Барлық мәтін қазақ тілінде болуы керек.

Форматы:
═══════════════════════
СЛАЙД 1: [Атауы]
═══════════════════════
• [Негізгі тезис 1]
• [Негізгі тезис 2]
• [Негізгі тезис 3]

Түсініктеме: [Қосымша ақпарат]

[Келесі слайдтар...]
`;

    const content = await callGemini(prompt, 0.7, 4000);

    const filename = `${subject}_${theme.replace(/\s+/g, '_')}_презентация.txt`;

    res.json({
      success: true,
      content: content,
      filename: filename
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
