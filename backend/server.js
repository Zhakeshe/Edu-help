const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Environment variables жүктеу
dotenv.config();

// Express қосымшасын жасау
const app = express();

// Database қосылу
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статикалық файлдарға қол жеткізу
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ai-tools', require('./routes/aitools'));
app.use('/api/feedback', require('./routes/feedback'));

// Негізгі роут
app.get('/', (req, res) => {
  res.json({
    message: '🎓 EduHelp API - Қош келдіңіз!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      materials: '/api/materials',
      classes: '/api/classes',
      aiTools: '/api/ai-tools',
      feedback: '/api/feedback'
    }
  });
});

// 404 қатесін өңдеу
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут табылмады'
  });
});

// Қателерді өңдеу
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Сервер қатесі',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║                                        ║
    ║   🎓  EduHelp Backend Server          ║
    ║                                        ║
    ║   🚀  Server: http://localhost:${PORT}   ║
    ║   📚  Status: Running                  ║
    ║                                        ║
    ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
