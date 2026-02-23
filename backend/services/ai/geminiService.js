const axios = require('axios');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function extractGeminiText(data) {
  const candidate = data?.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  return part?.text || '';
}

async function callGemini(prompt, options = {}) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    const err = new Error('GEMINI_API_KEY табылмады');
    err.code = 'GEMINI_KEY_MISSING';
    throw err;
  }

  const temperature = options.temperature ?? 0.7;
  const maxOutputTokens = options.maxTokens ?? 2048;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens
      }
    });

    const text = extractGeminiText(response.data);
    if (!text) {
      const err = new Error('Gemini бос жауап қайтарды');
      err.code = 'GEMINI_EMPTY_RESPONSE';
      throw err;
    }

    return text;
  } catch (error) {
    const apiMessage = error.response?.data?.error?.message;
    const err = new Error(apiMessage || error.message || 'Gemini API қатесі');
    err.code = error.code || 'GEMINI_REQUEST_FAILED';
    throw err;
  }
}

function stripJsonFences(text) {
  return (text || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
}

async function callGeminiJson(prompt, options = {}) {
  const text = await callGemini(prompt, options);
  const cleaned = stripJsonFences(text);
  return JSON.parse(cleaned);
}

module.exports = {
  callGemini,
  callGeminiJson,
  stripJsonFences
};
