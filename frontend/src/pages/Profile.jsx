import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, Save, Check, AlertCircle, Sparkles } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, saveApiKeys } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    avatar: user?.avatar || ''
  });

  const [apiKeysData, setApiKeysData] = useState({
    gemini: user?.apiKeys?.gemini || '',
    openai: user?.apiKeys?.openai || '',
    anthropic: user?.apiKeys?.anthropic || ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const result = await updateProfile(profileData);

    if (result.success) {
      setStatus({ type: 'success', message: 'Профиль жаңартылды!' });
    } else {
      setStatus({ type: 'error', message: result.message });
    }

    setLoading(false);
  };

  const handleApiKeysUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const result = await saveApiKeys(apiKeysData);

    if (result.success) {
      setStatus({ type: 'success', message: result.message });
    } else {
      setStatus({ type: 'error', message: result.message });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-full">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Профиль</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Жалпы ақпарат</span>
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'api-keys'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Key className="h-5 w-5" />
            <span>API кілттері</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'profile' && (
        <div className="glass-card p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Жеке ақпарат</h2>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Аты-жөні
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="input-field"
                placeholder="Толық аты-жөні"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL (опциялық)
              </label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="input-field bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email өзгертуге болмайды</p>
            </div>

            {status.type && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{status.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="spinner border-white" style={{ width: '20px', height: '20px' }} />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Сақтау</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold">API кілттері</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 API кілттері не үшін?</h3>
            <p className="text-sm text-blue-800 mb-2">
              AI құралдарды пайдалану үшін өз API кілттеріңізді қосыңыз:
            </p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>Gemini:</strong> <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">makersuite.google.com</a></li>
              <li><strong>OpenAI:</strong> platform.openai.com/api-keys</li>
              <li><strong>Anthropic:</strong> console.anthropic.com</li>
            </ul>
          </div>

          <form onSubmit={handleApiKeysUpdate} className="space-y-6">
            {/* Gemini */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🌟 Google Gemini API Key (Ұсынылады - ТЕГІН!)
              </label>
              <input
                type="text"
                value={apiKeysData.gemini}
                onChange={(e) => setApiKeysData({ ...apiKeysData, gemini: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="AIza..."
              />
              <p className="text-xs text-gray-500 mt-1">
                ✅ Тегін (күніне 60 сұрау) - <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Кілт алу</a>
              </p>
            </div>

            {/* OpenAI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key (Опциялық)
              </label>
              <input
                type="text"
                value={apiKeysData.openai}
                onChange={(e) => setApiKeysData({ ...apiKeysData, openai: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="sk-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Ақылы - platform.openai.com/api-keys
              </p>
            </div>

            {/* Anthropic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anthropic Claude API Key (Опциялық)
              </label>
              <input
                type="text"
                value={apiKeysData.anthropic}
                onChange={(e) => setApiKeysData({ ...apiKeysData, anthropic: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="sk-ant-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Ақылы - console.anthropic.com
              </p>
            </div>

            {status.type && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{status.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="spinner border-white" style={{ width: '20px', height: '20px' }} />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>API кілттерін сақтау</span>
                </>
              )}
            </button>
          </form>

          {/* Stats */}
          {user?.stats && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-4">📊 Статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {user.stats.materialsDownloaded || 0}
                  </div>
                  <div className="text-sm text-gray-600">Жүктелген материалдар</div>
                </div>
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-600">
                    {user.stats.aiToolsUsed || 0}
                  </div>
                  <div className="text-sm text-gray-600">AI құралдар қолданылды</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
