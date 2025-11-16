import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, Check, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    avatar: user?.avatar || ''
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

      {/* Profile Form */}
      <div className="glass-card p-8">
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
    </div>
  );
};

export default Profile;
