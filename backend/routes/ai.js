const express = require('express');
const router = express.Router();
const axios = require('axios');
const PptxGenJS = require('pptxgenjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const { protect } = require('../middleware/auth');
const { callGemini, callGeminiJson } = require('../services/ai/geminiService');
const { freeTools, getFreeToolsByCategory } = require('../services/ai/freeTools');
const { uploadBuffer, isR2Configured, getObjectSignedUrl } = require('../services/storage/r2Storage');

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const presentationsDir = path.join(__dirname, '../public/presentations');
const imagesDir = path.join(__dirname, '../public/images');
fs.mkdirSync(presentationsDir, { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

function makeGeminiErrorResponse(category, error) {
  return {
    success: false,
    message: error.message || 'Gemini request failed',
    errorCode: error.code || 'GEMINI_UNAVAILABLE',
    fallback: {
      freeTools: category ? getFreeToolsByCategory(category) : freeTools
    }
  };
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function parseSlidesWithFallback(rawJson) {
  const slides = normalizeList(rawJson?.slides).map((slide, index) => ({
    title: String(slide?.title || `Slide ${index + 1}`),
    content: normalizeList(slide?.content).map((line) => String(line))
  }));

  return {
    slides: slides.length > 0 ? slides : [{ title: 'Slide 1', content: ['No content generated'] }]
  };
}

function stripMarkdownFence(value) {
  return String(value || '')
    .replace(/```markdown\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
}

function sanitizeFileBase(value) {
  return String(value || 'eduhelp')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 120) || 'eduhelp';
}

async function createPdfBufferFromText(title, text) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(text || '', { lineGap: 4 });
    doc.end();
  });
}

async function createPptxBuffer(subject, theme, slideData) {
  const pptx = new PptxGenJS();
  pptx.author = 'EduHelp';
  pptx.company = 'EduHelp';
  pptx.subject = subject;
  pptx.title = theme;

  const slides = normalizeList(slideData?.slides);
  slides.forEach((slideItem, index) => {
    const slide = pptx.addSlide();
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 0.8,
      fill: { color: '1D4ED8' }
    });

    slide.addText(slideItem.title || `Slide ${index + 1}`, {
      x: 0.4,
      y: 0.15,
      w: 9.2,
      h: 0.45,
      fontFace: 'Arial',
      fontSize: 22,
      bold: true,
      color: 'FFFFFF'
    });

    const bulletLines = normalizeList(slideItem.content);
    const contentText = bulletLines.length > 0
      ? bulletLines.map((line) => `• ${line}`).join('\n')
      : '• No content generated';

    slide.addText(contentText, {
      x: 0.8,
      y: 1.1,
      w: 8.6,
      h: 4.0,
      fontFace: 'Arial',
      fontSize: 18,
      color: '1F2937',
      valign: 'top'
    });
  });

  const tmpPath = path.join(
    os.tmpdir(),
    `eduhelp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pptx`
  );

  await pptx.writeFile({ fileName: tmpPath });
  const data = await fsp.readFile(tmpPath);
  await fsp.unlink(tmpPath).catch(() => {});
  return data;
}

async function uploadGeneratedAsset(buffer, originalName, folder, contentType) {
  if (!isR2Configured) {
    throw new Error('R2 storage is not configured');
  }

  const uploaded = await uploadBuffer({
    buffer,
    originalName,
    folder,
    contentType
  });

  const resolvedUrl = uploaded.publicUrl || await getObjectSignedUrl(uploaded.objectKey, { expiresIn: 60 * 60 * 24 });

  return {
    provider: uploaded.provider,
    objectKey: uploaded.objectKey,
    publicUrl: resolvedUrl,
    contentType: uploaded.contentType,
    fileName: originalName,
    fileSize: buffer.length
  };
}

function buildChatPrompt(message, history) {
  const lines = [];
  lines.push('You are an educational assistant for teachers.');
  lines.push('Respond in clear and practical format.');
  lines.push('');

  normalizeList(history).forEach((item) => {
    const role = item.role === 'user' ? 'Teacher' : 'Assistant';
    lines.push(`${role}: ${item.content}`);
  });

  lines.push('');
  lines.push(`Teacher: ${message}`);
  lines.push('Assistant:');
  return lines.join('\n');
}

function buildKmzhPrompt({ subject, classNumber, quarter, theme, objectives }) {
  return `
Create a detailed KMZH lesson plan for this class.

Subject: ${subject}
Class: ${classNumber}
Quarter: ${quarter}
Theme: ${theme}
Objectives: ${objectives || 'Use standard objectives for this theme'}

Output structure:
1) Lesson goals
2) Learning outcomes
3) Lesson phases
4) Teacher activity
5) Student activity
6) Assessment and reflection

Return plain text only.
`.trim();
}

function buildPresentationPrompt({ subject, theme, slides, details }) {
  return `
Generate JSON for a classroom presentation.

Subject: ${subject}
Theme: ${theme}
Slides count: ${slides}
Details: ${details || 'No extra details'}

Return strict JSON in this shape:
{
  "slides": [
    {
      "title": "Slide title",
      "content": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ]
}
`.trim();
}

function buildWorksheetPrompt({ subject, classNumber, quarter, theme, worksheetLevel }) {
  return `
Create a worksheet in Markdown format.

Subject: ${subject}
Class: ${classNumber}
Quarter: ${quarter}
Theme: ${theme}
Difficulty: ${worksheetLevel || 'standard'}

Include:
- title
- short instruction
- three tasks (easy/medium/hard)
- 10 practice questions
- answer key
`.trim();
}

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message is required'
      });
    }

    const prompt = buildChatPrompt(message, history);
    const text = await callGemini(prompt, { temperature: 0.8, maxTokens: 2048 });

    res.json({
      success: true,
      response: text
    });
  } catch (error) {
    res.status(503).json(makeGeminiErrorResponse('text', error));
  }
});

router.post('/generate-kmzh', protect, async (req, res) => {
  try {
    const { subject, classNumber, quarter, theme, objectives } = req.body;
    if (!subject || !classNumber || !quarter || !theme) {
      return res.status(400).json({
        success: false,
        message: 'subject, classNumber, quarter, theme are required'
      });
    }

    const content = await callGemini(
      buildKmzhPrompt({ subject, classNumber, quarter, theme, objectives }),
      { temperature: 0.7, maxTokens: 4096 }
    );

    const filename = `${sanitizeFileBase(`${subject}_${classNumber}_${quarter}_${theme}`)}_kmzh.txt`;

    res.json({
      success: true,
      content,
      filename
    });
  } catch (error) {
    res.status(503).json(makeGeminiErrorResponse('text', error));
  }
});

router.post('/generate-presentation', protect, async (req, res) => {
  try {
    const { subject, theme, slides, details } = req.body;
    if (!subject || !theme || !slides) {
      return res.status(400).json({
        success: false,
        message: 'subject, theme, slides are required'
      });
    }

    const slideCount = Math.max(1, Math.min(30, Number(slides) || 8));
    const presentationJson = parseSlidesWithFallback(
      await callGeminiJson(
        buildPresentationPrompt({ subject, theme, slides: slideCount, details }),
        { temperature: 0.7, maxTokens: 4000 }
      )
    );

    const pptxBuffer = await createPptxBuffer(subject, theme, presentationJson);
    const baseName = sanitizeFileBase(`${subject}_${theme}_${Date.now()}`);
    const pptxFileName = `${baseName}.pptx`;

    const textContent = presentationJson.slides
      .map((slide, index) => `Slide ${index + 1}: ${slide.title}\n${slide.content.map((x) => `- ${x}`).join('\n')}`)
      .join('\n\n');

    if (isR2Configured) {
      const uploaded = await uploadGeneratedAsset(
        pptxBuffer,
        pptxFileName,
        'presentations',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      );

      return res.json({
        success: true,
        content: textContent,
        filename: `${baseName}.txt`,
        pptxUrl: uploaded.publicUrl,
        message: 'Presentation generated'
      });
    }

    const localPath = path.join(presentationsDir, pptxFileName);
    await fsp.writeFile(localPath, pptxBuffer);

    res.json({
      success: true,
      content: textContent,
      filename: `${baseName}.txt`,
      pptxUrl: `/presentations/${pptxFileName}`,
      message: 'Presentation generated'
    });
  } catch (error) {
    res.status(503).json(makeGeminiErrorResponse('presentation', error));
  }
});

router.post('/generate-bundle', protect, async (req, res) => {
  try {
    if (process.env.ENABLE_BUNDLE_GENERATOR === 'false') {
      return res.status(404).json({
        success: false,
        message: 'Bundle generator is disabled by feature flag',
        errorCode: 'FEATURE_DISABLED'
      });
    }

    if (!isR2Configured) {
      return res.status(503).json({
        success: false,
        message: 'Bundle generator requires R2 storage',
        errorCode: 'R2_NOT_CONFIGURED',
        fallback: {
          freeTools: getFreeToolsByCategory('bundle')
        }
      });
    }

    const {
      subject,
      classNumber,
      quarter,
      theme,
      objectives,
      slidesCount = 8,
      worksheetLevel = 'standard'
    } = req.body;

    if (!subject || !classNumber || !quarter || !theme) {
      return res.status(400).json({
        success: false,
        message: 'subject, classNumber, quarter, theme are required'
      });
    }

    const safeSlidesCount = Math.max(1, Math.min(30, Number(slidesCount) || 8));

    const kmzhContent = await callGemini(
      buildKmzhPrompt({ subject, classNumber, quarter, theme, objectives }),
      { temperature: 0.7, maxTokens: 4096 }
    );

    const presentationJson = parseSlidesWithFallback(
      await callGeminiJson(
        buildPresentationPrompt({ subject, theme, slides: safeSlidesCount, details: objectives }),
        { temperature: 0.7, maxTokens: 4000 }
      )
    );

    const worksheetMarkdown = stripMarkdownFence(
      await callGemini(
        buildWorksheetPrompt({ subject, classNumber, quarter, theme, worksheetLevel }),
        { temperature: 0.7, maxTokens: 3000 }
      )
    );

    const pptxBuffer = await createPptxBuffer(subject, theme, presentationJson);
    const worksheetPdfBuffer = await createPdfBufferFromText(
      `${subject} - ${theme} (${classNumber})`,
      worksheetMarkdown
    );

    const fileBase = sanitizeFileBase(`${subject}_${classNumber}_${quarter}_${theme}_${Date.now()}`);
    const kmzhFileName = `${fileBase}_kmzh.txt`;
    const pptxFileName = `${fileBase}_presentation.pptx`;
    const worksheetMdFileName = `${fileBase}_worksheet.md`;
    const worksheetPdfFileName = `${fileBase}_worksheet.pdf`;

    const [kmzhUpload, pptxUpload, worksheetMdUpload, worksheetPdfUpload] = await Promise.all([
      uploadGeneratedAsset(Buffer.from(kmzhContent, 'utf8'), kmzhFileName, 'bundles', 'text/plain; charset=utf-8'),
      uploadGeneratedAsset(
        pptxBuffer,
        pptxFileName,
        'bundles',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ),
      uploadGeneratedAsset(
        Buffer.from(worksheetMarkdown, 'utf8'),
        worksheetMdFileName,
        'bundles',
        'text/markdown; charset=utf-8'
      ),
      uploadGeneratedAsset(worksheetPdfBuffer, worksheetPdfFileName, 'bundles', 'application/pdf')
    ]);

    res.json({
      success: true,
      data: {
        meta: {
          subject,
          classNumber,
          quarter,
          theme,
          worksheetLevel,
          slidesCount: safeSlidesCount
        },
        bundle: {
          kmzh: {
            fileName: kmzhFileName,
            url: kmzhUpload.publicUrl,
            contentType: kmzhUpload.contentType,
            size: kmzhUpload.fileSize
          },
          presentation: {
            fileName: pptxFileName,
            url: pptxUpload.publicUrl,
            contentType: pptxUpload.contentType,
            size: pptxUpload.fileSize
          },
          worksheetMarkdown: {
            fileName: worksheetMdFileName,
            url: worksheetMdUpload.publicUrl,
            contentType: worksheetMdUpload.contentType,
            size: worksheetMdUpload.fileSize
          },
          worksheetPdf: {
            fileName: worksheetPdfFileName,
            url: worksheetPdfUpload.publicUrl,
            contentType: worksheetPdfUpload.contentType,
            size: worksheetPdfUpload.fileSize
          }
        },
        preview: {
          kmzhText: kmzhContent.slice(0, 5000),
          worksheetMarkdown: worksheetMarkdown.slice(0, 5000),
          slides: presentationJson.slides || []
        }
      }
    });
  } catch (error) {
    res.status(503).json(makeGeminiErrorResponse('bundle', error));
  }
});

router.post('/generate-image', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'prompt is required'
      });
    }

    if (!HUGGINGFACE_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'HUGGINGFACE_API_KEY is not configured',
        errorCode: 'HUGGINGFACE_KEY_MISSING',
        fallback: {
          freeTools: getFreeToolsByCategory('image')
        }
      });
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        validateStatus: (status) => status < 600,
        timeout: 60000
      }
    );

    if (response.status !== 200) {
      let errorMessage = 'Image generation request failed';
      try {
        const text = Buffer.from(response.data).toString('utf-8');
        const parsed = JSON.parse(text);
        errorMessage = parsed.error || errorMessage;
      } catch (_) {
        // no-op
      }

      if (response.status === 503) {
        return res.status(503).json({
          success: false,
          message: 'Model is loading. Retry in 20-30 seconds.',
          isLoading: true,
          errorCode: 'HUGGINGFACE_MODEL_LOADING',
          fallback: {
            freeTools: getFreeToolsByCategory('image')
          }
        });
      }

      return res.status(response.status).json({
        success: false,
        message: errorMessage,
        errorCode: 'HUGGINGFACE_REQUEST_FAILED',
        fallback: {
          freeTools: getFreeToolsByCategory('image')
        }
      });
    }

    if (isR2Configured) {
      const filename = `image_${Date.now()}.png`;
      const uploaded = await uploadGeneratedAsset(response.data, filename, 'images', 'image/png');
      return res.json({
        success: true,
        imageUrl: uploaded.publicUrl,
        message: 'Image generated'
      });
    }

    const imageFilename = `image_${Date.now()}.png`;
    const imagePath = path.join(imagesDir, imageFilename);
    fs.writeFileSync(imagePath, response.data);

    res.json({
      success: true,
      imageUrl: `/images/${imageFilename}`,
      message: 'Image generated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Image generation failed',
      errorCode: 'HUGGINGFACE_RUNTIME_ERROR',
      fallback: {
        freeTools: getFreeToolsByCategory('image')
      }
    });
  }
});

module.exports = router;
