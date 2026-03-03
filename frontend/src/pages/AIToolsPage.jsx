import { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';
import {
  AlertCircle,
  Bot,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Presentation,
  Send,
  Sparkles,
  User as UserIcon
} from 'lucide-react';

const CHAT_STORAGE_KEY = 'eduhelp_ai_chat_history_v2';
const MAX_HISTORY = 20;

function resolveAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return buildApiUrl(url);
}

function extractFallbackTools(error) {
  return error?.response?.data?.fallback?.freeTools || [];
}

function extractErrorMessage(error, fallbackText) {
  return error?.response?.data?.message || fallbackText;
}

function downloadAsText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const initialKmzhForm = {
  subject: '',
  classNumber: '',
  quarter: '',
  theme: '',
  objectives: ''
};

const initialPresentationForm = {
  subject: '',
  theme: '',
  slides: '8',
  details: ''
};

const initialBundleForm = {
  subject: '',
  classNumber: '',
  quarter: '',
  theme: '',
  objectives: '',
  slidesCount: '8',
  worksheetLevel: 'standard'
};

const tabItems = [
  { id: 'chat', label: 'AI Chat' },
  { id: 'kmzh', label: 'KMZH' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'bundle', label: 'Bundle Generator' }
];

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackTools, setFallbackTools] = useState([]);

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });
  const messageEndRef = useRef(null);

  const [kmzhForm, setKmzhForm] = useState(initialKmzhForm);
  const [presentationForm, setPresentationForm] = useState(initialPresentationForm);
  const [bundleForm, setBundleForm] = useState(initialBundleForm);

  const [generatedContent, setGeneratedContent] = useState(null);
  const [bundleResult, setBundleResult] = useState(null);

  const chatHistoryPayload = useMemo(() => {
    return messages.slice(-MAX_HISTORY).map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  }, [messages]);

  const resetFeedback = () => {
    setError('');
    setFallbackTools([]);
  };

  const saveMessages = (nextMessages) => {
    setMessages(nextMessages);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextMessages));
    } catch (_) {
      // no-op
    }
    requestAnimationFrame(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleApiFailure = (err, fallbackText) => {
    setError(extractErrorMessage(err, fallbackText));
    setFallbackTools(extractFallbackTools(err));
  };

  const sendChatMessage = async (event) => {
    event.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: chatInput.trim()
    };

    const nextMessages = [...messages, userMessage];
    saveMessages(nextMessages);
    setChatInput('');
    setLoading(true);
    resetFeedback();

    try {
      const response = await axios.post('/api/ai/chat', {
        message: userMessage.content,
        history: chatHistoryPayload
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data?.response || 'No response'
      };

      saveMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      handleApiFailure(err, 'Failed to generate chat response');
      const failedMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Generation failed. Check fallback tools below.'
      };
      saveMessages([...nextMessages, failedMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: `Image prompt: ${chatInput.trim()}`
    };

    const nextMessages = [...messages, userMessage];
    saveMessages(nextMessages);
    const prompt = chatInput.trim();
    setChatInput('');
    setLoading(true);
    resetFeedback();

    try {
      const response = await axios.post('/api/ai/generate-image', { prompt });
      const imageUrl = resolveAssetUrl(response.data?.imageUrl);
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data?.message || 'Image generated',
        type: 'image',
        imageUrl
      };
      saveMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      handleApiFailure(err, 'Failed to generate image');
      const failedMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Image generation failed. Check fallback tools below.'
      };
      saveMessages([...nextMessages, failedMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKmzh = async (event) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();
    setGeneratedContent(null);

    try {
      const response = await axios.post('/api/ai/generate-kmzh', kmzhForm);
      setGeneratedContent({
        type: 'kmzh',
        content: response.data?.content || '',
        filename: response.data?.filename || 'kmzh.txt'
      });
    } catch (err) {
      handleApiFailure(err, 'Failed to generate KMZH');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePresentation = async (event) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();
    setGeneratedContent(null);

    try {
      const response = await axios.post('/api/ai/generate-presentation', presentationForm);
      setGeneratedContent({
        type: 'presentation',
        content: response.data?.content || '',
        filename: response.data?.filename || 'presentation.txt',
        pptxUrl: resolveAssetUrl(response.data?.pptxUrl || '')
      });
    } catch (err) {
      handleApiFailure(err, 'Failed to generate presentation');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBundle = async (event) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();
    setBundleResult(null);

    try {
      const payload = {
        ...bundleForm,
        slidesCount: Number(bundleForm.slidesCount || 8)
      };
      const response = await axios.post('/api/ai/generate-bundle', payload);
      setBundleResult(response.data?.data || null);
    } catch (err) {
      handleApiFailure(err, 'Failed to generate bundle');
    } finally {
      setLoading(false);
    }
  };

  const renderFallbackTools = () => {
    if (!fallbackTools.length) return null;

    return (
      <div className="glass-card p-5 border border-amber-300 bg-amber-50">
        <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Free AI fallback tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fallbackTools.map((tool) => (
            <a
              key={`${tool.name}-${tool.url}`}
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg border border-amber-200 bg-white hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{tool.name}</p>
                  <p className="text-xs text-gray-500">{tool.category}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-amber-700" />
              </div>
              <p className="mt-2 text-sm text-gray-700">{tool.description}</p>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold gradient-text mb-1">AI Tools</h1>
        <p className="text-gray-600">
          Gemini-first generation with free fallback tools and Bundle Generator.
        </p>
      </div>

      <div className="glass-card p-2 flex flex-wrap gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError('');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-300 bg-red-50 text-red-700 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="glass-card p-5 h-[520px] overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                Start a prompt for text or image generation.
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.type === 'image' && msg.imageUrl && (
                    <div className="mt-3 space-y-2">
                      <img
                        src={msg.imageUrl}
                        alt="Generated"
                        className="rounded-lg max-h-72 border border-gray-200"
                      />
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm underline"
                      >
                        Open image
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            <div ref={messageEndRef} />
          </div>

          <form onSubmit={sendChatMessage} className="glass-card p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Type message or image prompt..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={generateImage}
                disabled={loading || !chatInput.trim()}
                className="px-4 py-2 rounded-lg border-2 border-primary-500 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={loading || !chatInput.trim()}
                className="btn-primary disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'kmzh' && (
        <div className="space-y-4">
          <form onSubmit={handleGenerateKmzh} className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              KMZH generator
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="input-field"
                placeholder="Subject"
                value={kmzhForm.subject}
                onChange={(event) => setKmzhForm((prev) => ({ ...prev, subject: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Class number"
                value={kmzhForm.classNumber}
                onChange={(event) => setKmzhForm((prev) => ({ ...prev, classNumber: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Quarter"
                value={kmzhForm.quarter}
                onChange={(event) => setKmzhForm((prev) => ({ ...prev, quarter: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Theme"
                value={kmzhForm.theme}
                onChange={(event) => setKmzhForm((prev) => ({ ...prev, theme: event.target.value }))}
                required
              />
            </div>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Objectives"
              value={kmzhForm.objectives}
              onChange={(event) => setKmzhForm((prev) => ({ ...prev, objectives: event.target.value }))}
            />
            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate KMZH
            </button>
          </form>

          {generatedContent?.type === 'kmzh' && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">KMZH output</h3>
                <button
                  onClick={() => downloadAsText(generatedContent.filename, generatedContent.content)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm whitespace-pre-wrap">
                {generatedContent.content}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'presentation' && (
        <div className="space-y-4">
          <form onSubmit={handleGeneratePresentation} className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Presentation className="h-5 w-5 text-primary-600" />
              Presentation generator
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="input-field"
                placeholder="Subject"
                value={presentationForm.subject}
                onChange={(event) => setPresentationForm((prev) => ({ ...prev, subject: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Theme"
                value={presentationForm.theme}
                onChange={(event) => setPresentationForm((prev) => ({ ...prev, theme: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Slides count"
                value={presentationForm.slides}
                onChange={(event) => setPresentationForm((prev) => ({ ...prev, slides: event.target.value }))}
                required
              />
            </div>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Details"
              value={presentationForm.details}
              onChange={(event) => setPresentationForm((prev) => ({ ...prev, details: event.target.value }))}
            />
            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate presentation
            </button>
          </form>

          {generatedContent?.type === 'presentation' && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => downloadAsText(generatedContent.filename, generatedContent.content)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download summary
                </button>
                {generatedContent.pptxUrl && (
                  <a
                    href={generatedContent.pptxUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg border-2 border-primary-500 text-primary-600 hover:bg-primary-50 inline-flex items-center gap-2"
                  >
                    <Presentation className="h-4 w-4" />
                    Download PPTX
                  </a>
                )}
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm whitespace-pre-wrap">
                {generatedContent.content}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bundle' && (
        <div className="space-y-4">
          <form onSubmit={handleGenerateBundle} className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              Bundle Generator
            </h2>
            <p className="text-sm text-gray-600">
              Generate KMZH + presentation + worksheet markdown + worksheet PDF in one request.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="input-field"
                placeholder="Subject"
                value={bundleForm.subject}
                onChange={(event) => setBundleForm((prev) => ({ ...prev, subject: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Class number"
                value={bundleForm.classNumber}
                onChange={(event) => setBundleForm((prev) => ({ ...prev, classNumber: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Quarter"
                value={bundleForm.quarter}
                onChange={(event) => setBundleForm((prev) => ({ ...prev, quarter: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Theme"
                value={bundleForm.theme}
                onChange={(event) => setBundleForm((prev) => ({ ...prev, theme: event.target.value }))}
                required
              />
              <input
                className="input-field"
                placeholder="Slides count"
                value={bundleForm.slidesCount}
                onChange={(event) => setBundleForm((prev) => ({ ...prev, slidesCount: event.target.value }))}
              />
              <select
                className="input-field"
                value={bundleForm.worksheetLevel}
                onChange={(event) => setBundleForm((prev) => ({ ...prev, worksheetLevel: event.target.value }))}
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Objectives"
              value={bundleForm.objectives}
              onChange={(event) => setBundleForm((prev) => ({ ...prev, objectives: event.target.value }))}
            />

            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate bundle
            </button>
          </form>

          {bundleResult && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-lg">Bundle output</h3>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { key: 'kmzh', label: 'KMZH TXT', icon: FileText },
                  { key: 'presentation', label: 'Presentation PPTX', icon: Presentation },
                  { key: 'worksheetMarkdown', label: 'Worksheet Markdown', icon: FileText },
                  { key: 'worksheetPdf', label: 'Worksheet PDF', icon: FileText }
                ].map((item) => {
                  const file = bundleResult.bundle?.[item.key];
                  const Icon = item.icon;
                  if (!file?.url) return null;
                  return (
                    <a
                      key={item.key}
                      href={resolveAssetUrl(file.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-lg border border-gray-200 hover:border-primary-400 transition-colors bg-white flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{file.fileName}</p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-primary-600" />
                    </a>
                  );
                })}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">KMZH preview</p>
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs whitespace-pre-wrap max-h-80">
                    {bundleResult.preview?.kmzhText || '-'}
                  </pre>
                </div>
                <div>
                  <p className="font-medium mb-2">Worksheet markdown preview</p>
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs whitespace-pre-wrap max-h-80">
                    {bundleResult.preview?.worksheetMarkdown || '-'}
                  </pre>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Slides preview</p>
                <div className="space-y-2">
                  {(bundleResult.preview?.slides || []).map((slide, index) => (
                    <div key={`${slide.title}-${index}`} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <p className="font-medium">{index + 1}. {slide.title}</p>
                      <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                        {(slide.content || []).map((line, contentIndex) => (
                          <li key={`${index}-${contentIndex}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {renderFallbackTools()}
    </div>
  );
}
