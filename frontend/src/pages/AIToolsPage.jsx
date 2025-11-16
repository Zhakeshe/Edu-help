import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Send,
  Sparkles,
  Download,
  FileText,
  Presentation,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  Bot,
  User as UserIcon,
  Plus,
  MessageSquare,
  Edit3,
  X
} from 'lucide-react';

const AIToolsPage = () => {
  const [activeTab, setActiveTab] = useState('chat');

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // ҚМЖ генерация state
  const [kmzhData, setKmzhData] = useState({
    subject: '',
    classNumber: '',
    quarter: '',
    theme: '',
    objectives: ''
  });

  // Презентация генерация state
  const [presentationData, setPresentationData] = useState({
    subject: '',
    theme: '',
    slides: '5',
    details: ''
  });

  const [generatedContent, setGeneratedContent] = useState(null);

  // Load conversations on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('eduhelp_conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);

      // Load last conversation
      if (parsed.length > 0) {
        const lastConv = parsed[0];
        setCurrentConversationId(lastConv.id);
        setMessages(lastConv.messages);
      }
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('eduhelp_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: 'Жаңа чат',
      messages: [],
      createdAt: new Date().toISOString()
    };

    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
  };

  const switchConversation = (convId) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConversationId(convId);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (convId) => {
    if (window.confirm('Чатты өшіруге сенімдісіз бе?')) {
      const updatedConvs = conversations.filter(c => c.id !== convId);
      setConversations(updatedConvs);

      if (convId === currentConversationId) {
        if (updatedConvs.length > 0) {
          setCurrentConversationId(updatedConvs[0].id);
          setMessages(updatedConvs[0].messages);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }

      if (updatedConvs.length === 0) {
        localStorage.removeItem('eduhelp_conversations');
      }
    }
  };

  const updateConversationTitle = (convId, newTitle) => {
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, title: newTitle } : c
    ));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/ai/chat', {
        message: inputMessage,
        history: messages.slice(-10)
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Update conversation
      if (currentConversationId) {
        setConversations(prev => prev.map(c => {
          if (c.id === currentConversationId) {
            // Auto-generate title from first message
            const title = c.messages.length === 0
              ? inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : '')
              : c.title;

            return { ...c, messages: updatedMessages, title };
          }
          return c;
        }));
      } else {
        // Create new conversation
        const newConv = {
          id: Date.now().toString(),
          title: inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : ''),
          messages: updatedMessages,
          createdAt: new Date().toISOString()
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
      }

    } catch (error) {
      console.error('Chat қатесі:', error);
      setError(error.response?.data?.message || 'Қате орын алды. Backend іске қосылғанына көз жеткізіңіз.');
    } finally {
      setLoading(false);
    }
  };

  const generateKMZH = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedContent(null);

    try {
      const res = await axios.post('/api/ai/generate-kmzh', kmzhData);
      setGeneratedContent({
        type: 'kmzh',
        content: res.data.content,
        filename: res.data.filename
      });
    } catch (error) {
      console.error('ҚМЖ генерация қатесі:', error);
      setError(error.response?.data?.message || 'Генерация қатесі');
    } finally {
      setLoading(false);
    }
  };

  const generatePresentation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedContent(null);

    try {
      const res = await axios.post('/api/ai/generate-presentation', presentationData);
      setGeneratedContent({
        type: 'presentation',
        content: res.data.content,
        filename: res.data.filename,
        pptxUrl: res.data.pptxUrl // Backend will generate .pptx file
      });
    } catch (error) {
      console.error('Презентация генерация қатесі:', error);
      setError(error.response?.data?.message || 'Генерация қатесі');
    } finally {
      setLoading(false);
    }
  };

  const downloadContent = () => {
    if (!generatedContent) return;

    const blob = new Blob([generatedContent.content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generatedContent.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadPPTX = () => {
    if (!generatedContent?.pptxUrl) return;
    window.open(generatedContent.pptxUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">AI Нейросеть</h1>
            <p className="text-gray-600">Edu-help Боты арқылы материалдар жасау</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'chat'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Bot className="h-5 w-5" />
            <span>Чат</span>
          </button>
          <button
            onClick={() => setActiveTab('kmzh')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'kmzh'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>ҚМЖ Генерация</span>
          </button>
          <button
            onClick={() => setActiveTab('presentation')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'presentation'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Presentation className="h-5 w-5" />
            <span>Презентация</span>
          </button>
        </div>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex gap-4">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-80 glass-card p-4 flex flex-col" style={{ height: '600px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Чаттар</h3>
                <button
                  onClick={createNewConversation}
                  className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                  title="Жаңа чат"
                >
                  <Plus className="h-5 w-5 text-primary-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Әлі чат жоқ
                  </p>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        conv.id === currentConversationId
                          ? 'bg-primary-100 border border-primary-300'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => switchConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <MessageSquare className="h-4 w-4 mt-1 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {conv.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conv.messages.length} хабар
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 glass-card p-6">
            {/* Chat header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-full">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Edu-help Боты</h2>
                  <p className="text-xs text-gray-500">Білім беру көмекшісі</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </button>
            </div>

            {/* Messages */}
            <div className="h-[450px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Bot className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">Edu-help Ботымен сөйлесуді бастаңыз</p>
                  <p className="text-sm">Кез келген сұрақ қойыңыз немесе материал сұраңыз</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-3 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-full flex-shrink-0">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <p className="text-xs font-semibold mb-2 text-primary-600">
                            Edu-help Боты
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString('kk-KZ')}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="bg-gray-600 p-2 rounded-full flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-full">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-semibold mb-2 text-primary-600">
                          Edu-help Боты
                        </p>
                        <div className="flex items-center space-x-2">
                          <Loader className="h-5 w-5 animate-spin text-primary-500" />
                          <span className="text-gray-600">Жазып жатыр...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Хабарламаңызды жазыңыз..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                <span>Жіберу</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'kmzh' && (
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6">ҚМЖ Генерациялау</h2>

          <form onSubmit={generateKMZH} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пән
                </label>
                <input
                  type="text"
                  value={kmzhData.subject}
                  onChange={(e) => setKmzhData({ ...kmzhData, subject: e.target.value })}
                  className="input-field"
                  placeholder="Математика"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сынып
                </label>
                <select
                  value={kmzhData.classNumber}
                  onChange={(e) => setKmzhData({ ...kmzhData, classNumber: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Таңдаңыз</option>
                  {[2,3,4,5,6,7,8,9,10,11].map(num => (
                    <option key={num} value={num}>{num} сынып</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тоқсан
                </label>
                <select
                  value={kmzhData.quarter}
                  onChange={(e) => setKmzhData({ ...kmzhData, quarter: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Таңдаңыз</option>
                  <option value="1">1 тоқсан</option>
                  <option value="2">2 тоқсан</option>
                  <option value="3">3 тоқсан</option>
                  <option value="4">4 тоқсан</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тақырып
                </label>
                <input
                  type="text"
                  value={kmzhData.theme}
                  onChange={(e) => setKmzhData({ ...kmzhData, theme: e.target.value })}
                  className="input-field"
                  placeholder="Көбейту кестесі"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сабақтың мақсаты (опциялық)
              </label>
              <textarea
                value={kmzhData.objectives}
                onChange={(e) => setKmzhData({ ...kmzhData, objectives: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Оқушылар көбейту кестесін үйренеді..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {generatedContent?.type === 'kmzh' && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">ҚМЖ дайын!</span>
                  </div>
                  <button
                    type="button"
                    onClick={downloadContent}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Жүктеу</span>
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {generatedContent.content}
                  </pre>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Генерациялануда...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>ҚМЖ жасау</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'presentation' && (
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6">Презентация Генерациялау</h2>

          <form onSubmit={generatePresentation} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пән
              </label>
              <input
                type="text"
                value={presentationData.subject}
                onChange={(e) => setPresentationData({ ...presentationData, subject: e.target.value })}
                className="input-field"
                placeholder="Математика"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тақырып
              </label>
              <input
                type="text"
                value={presentationData.theme}
                onChange={(e) => setPresentationData({ ...presentationData, theme: e.target.value })}
                className="input-field"
                placeholder="Пифагор теоремасы"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Слайдтар саны
              </label>
              <select
                value={presentationData.slides}
                onChange={(e) => setPresentationData({ ...presentationData, slides: e.target.value })}
                className="input-field"
                required
              >
                <option value="5">5 слайд</option>
                <option value="10">10 слайд</option>
                <option value="15">15 слайд</option>
                <option value="20">20 слайд</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Қосымша ақпарат (опциялық)
              </label>
              <textarea
                value={presentationData.details}
                onChange={(e) => setPresentationData({ ...presentationData, details: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Презентацияға қосқыңыз келетін ақпарат..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {generatedContent?.type === 'presentation' && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Презентация дайын!</span>
                  </div>
                  <div className="flex space-x-2">
                    {generatedContent.pptxUrl && (
                      <button
                        type="button"
                        onClick={downloadPPTX}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>.PPTX жүктеу</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={downloadContent}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>.TXT жүктеу</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {generatedContent.content}
                  </pre>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Генерациялануда...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Презентация жасау (.PPTX)</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIToolsPage;
