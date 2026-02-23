const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
connectDB();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || 400),
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS policy violation'));
  },
  credentials: true
}));

app.use('/api', apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Legacy local static (read only). New uploads use R2.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/presentations', express.static(path.join(__dirname, 'public/presentations')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ai-tools', require('./routes/aitools'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => {
  res.json({
    message: 'EduHelp API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      materials: '/api/materials',
      classes: '/api/classes',
      aiTools: '/api/ai-tools',
      feedback: '/api/feedback'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '??????? ?????????'
  });
});

app.use((err, req, res, next) => {
  if (err.message === 'CORS policy violation') {
    return res.status(403).json({
      success: false,
      message: 'CORS ??????? ???'
    });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '?????? ??????',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`EduHelp backend: http://localhost:${PORT}`);
  });
}

module.exports = app;
