const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB қосылу
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduhelp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const AITool = require('./models/AITool');

// 🎯 ТЕГІН AI құралдар тізімі
const freeAITools = [
  // 🖼️ СУРЕТ ГЕНЕРАЦИЯЛАУ
  {
    name: 'Bing Image Creator',
    description: 'Microsoft-тан ТЕГІН сурет генератор. DALL-E технологиясымен жұмыс істейді. Күніне 15 сурет тегін!',
    category: 'Сурет генерациялау',
    url: 'https://www.bing.com/create',
    features: [
      'Күніне 15 сурет тегін',
      'Жоғары сапа',
      'Тіркелусіз жұмыс істейді',
      'Қазақ тілінде prompt жазуға болады'
    ],
    isPremium: false,
    rating: 5,
    isActive: true,
    logo: '🎨'
  },
  {
    name: 'Leonardo.ai',
    description: 'Күніне 150 credit тегін. Презентацияларға, постерлерге керемет.',
    category: 'Сурет генерациялау',
    url: 'https://leonardo.ai',
    features: [
      '150 credit/күн тегін',
      'Әртүрлі стильдер',
      'Жоғары сапалы суреттер',
      'Бірнеше model таңдауға болады'
    ],
    isPremium: false,
    rating: 5,
    isActive: true,
    logo: '🖌️'
  },
  {
    name: 'Ideogram',
    description: 'Мәтін бар суреттерді жақсы жасайды. Күніне 25 сурет тегін.',
    category: 'Сурет генерациялау',
    url: 'https://ideogram.ai',
    features: [
      '25 сурет/күн тегін',
      'Мәтінді суретке қосу',
      'Постер дизайны',
      'Жарнама баннерлері'
    ],
    isPremium: false,
    rating: 4.5,
    isActive: true,
    logo: '✨'
  },
  {
    name: 'Playground AI',
    description: 'Күніне 1000 сурет тегін генерациялауға болады!',
    category: 'Сурет генерациялау',
    url: 'https://playgroundai.com',
    features: [
      '1000 сурет/күн ТЕГІН',
      'Әр түрлі filter-лер',
      'Editing құралдары',
      'Коммерциялық қолдануға рұқсат'
    ],
    isPremium: false,
    rating: 4.8,
    isActive: true,
    logo: '🎪'
  },
  {
    name: 'Craiyon (DALL-E mini)',
    description: 'Толығымен ТЕГІН, шексіз генерация!',
    category: 'Сурет генерациялау',
    url: 'https://www.craiyon.com',
    features: [
      'Толығымен тегін',
      'Шексіз генерация',
      'Тіркелу қажет емес',
      'Жылдам генерация'
    ],
    isPremium: false,
    rating: 4,
    isActive: true,
    logo: '🖍️'
  },

  // 📝 МӘТІН ГЕНЕРАЦИЯЛАУ
  {
    name: 'ChatGPT 3.5',
    description: 'OpenAI-дан ТЕГІН ChatGPT. ҚМЖ, тапсырма, тест жасауға өте жақсы.',
    category: 'Мәтін генерациялау',
    url: 'https://chat.openai.com',
    features: [
      'Тегін нұсқа бар',
      'ҚМЖ жазуға көмектеседі',
      'Тапсырмалар жасайды',
      'Тест сұрақтарын генерациялайды'
    ],
    isPremium: false,
    rating: 5,
    isActive: true,
    logo: '🤖'
  },
  {
    name: 'Microsoft Copilot',
    description: 'Microsoft-тан толығымен ТЕГІН AI чат-бот. GPT-4 технологиясымен!',
    category: 'Мәтін генерациялау',
    url: 'https://copilot.microsoft.com',
    features: [
      'Толығымен тегін',
      'GPT-4 қолданады',
      'Интернеттен іздейді',
      'Сурет генерациялау да бар'
    ],
    isPremium: false,
    rating: 5,
    isActive: true,
    logo: '💼'
  },
  {
    name: 'Google Gemini',
    description: 'Google-дан ТЕГІН AI. Ұзын мәтіндермен жұмыс істейді.',
    category: 'Мәтін генерациялау',
    url: 'https://gemini.google.com',
    features: [
      'Тегін қолдану',
      'Ұзын мәтіндер',
      'Google іздеу интеграциясы',
      'Көптілді қолдау'
    ],
    isPremium: false,
    rating: 4.8,
    isActive: true,
    logo: '💎'
  },
  {
    name: 'Claude.ai (тегін)',
    description: 'Anthropic-тан ТЕГІН AI. Ұзын мәтіндермен өте жақсы жұмыс істейді.',
    category: 'Мәтін генерациялау',
    url: 'https://claude.ai',
    features: [
      'Тегін нұсқа',
      '100,000+ токен context',
      'Файлдармен жұмыс',
      'Академиялық жазу'
    ],
    isPremium: false,
    rating: 4.9,
    isActive: true,
    logo: '🎭'
  },
  {
    name: 'Perplexity AI',
    description: 'ТЕГІН AI іздеу жүйесі. Дереккөздермен жауап береді.',
    category: 'Мәтін генерациялау',
    url: 'https://www.perplexity.ai',
    features: [
      'Толығымен тегін',
      'Дереккөздері бар',
      'Нақты ақпарат',
      'Зерттеуге өте жақсы'
    ],
    isPremium: false,
    rating: 4.7,
    isActive: true,
    logo: '🔍'
  },
  {
    name: 'HuggingChat',
    description: 'Толығымен ашық код, ТЕГІН AI чат.',
    category: 'Мәтін генерациялау',
    url: 'https://huggingface.co/chat',
    features: [
      'Толығымен тегін',
      'Ашық код',
      'Жоқ шектеулер',
      'Әр түрлі модельдер'
    ],
    isPremium: false,
    rating: 4.3,
    isActive: true,
    logo: '🤗'
  },

  // 🎬 ВИДЕО
  {
    name: 'Runway ML (тегін)',
    description: 'Күніне 125 credit тегін. Видео генерациялау және editing.',
    category: 'Видео генерациялау',
    url: 'https://runwayml.com',
    features: [
      '125 credit/күн тегін',
      'AI видео генерация',
      'Green screen',
      'Video editing'
    ],
    isPremium: false,
    rating: 4.6,
    isActive: true,
    logo: '🎬'
  },
  {
    name: 'Pika Labs',
    description: 'ТЕГІН AI видео генератор. Discord арқылы жұмыс істейді.',
    category: 'Видео генерациялау',
    url: 'https://pika.art',
    features: [
      'Тегін қолдану',
      'Мәтіннен видео',
      'Суреттен видео',
      'Әртүрлі стильдер'
    ],
    isPremium: false,
    rating: 4.4,
    isActive: true,
    logo: '⚡'
  },

  // 🎵 АУДИО
  {
    name: 'ElevenLabs (тегін)',
    description: 'ТЕГІН дыбыс генерациясы. Айына 10,000 character тегін.',
    category: 'Аудио генерациялау',
    url: 'https://elevenlabs.io',
    features: [
      '10,000 character/ай тегін',
      'Табиғи дауыс',
      'Көптілді',
      'Voice cloning (premium)'
    ],
    isPremium: false,
    rating: 4.8,
    isActive: true,
    logo: '🎙️'
  },
  {
    name: 'TTSMaker',
    description: 'Толығымен ТЕГІН Text-to-Speech. Шексіз қолдану!',
    category: 'Аудио генерациялау',
    url: 'https://ttsmaker.com',
    features: [
      'Толығымен тегін',
      'Шексіз генерация',
      'Қазақ тілі бар',
      'MP3 жүктеу'
    ],
    isPremium: false,
    rating: 4.5,
    isActive: true,
    logo: '🔊'
  },

  // 📊 ПРЕЗЕНТАЦИЯ
  {
    name: 'Gamma.app',
    description: 'ТЕГІН AI презентация жасау. Мәтіннен автоматты слайдтар.',
    category: 'Басқа',
    url: 'https://gamma.app',
    features: [
      'Тегін нұсқа бар',
      'Автоматты слайдтар',
      'Әдемі дизайн',
      'Экспорт PDF/PPT'
    ],
    isPremium: false,
    rating: 4.7,
    isActive: true,
    logo: '📊'
  }
];

// Деректер базасына қосу
async function seedAITools() {
  try {
    console.log('🗑️  Ескі AI құралдарды өшіру...');
    await AITool.deleteMany({});

    console.log('✨ Жаңа ТЕГІН AI құралдарды қосу...');
    await AITool.insertMany(freeAITools);

    console.log(`✅ ${freeAITools.length} ТЕГІН AI құрал қосылды!`);
    console.log('\n📋 Қосылған құралдар:');

    const grouped = freeAITools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(grouped).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} құрал`);
    });

    console.log('\n🎉 Барлығы дайын! Енді барлық AI құралдар ТЕГІН!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Қате:', error);
    process.exit(1);
  }
}

// Скриптті іске қосу
seedAITools();
