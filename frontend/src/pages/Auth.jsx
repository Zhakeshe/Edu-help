import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User, Shield } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password, isAdminLogin);
      } else {
        if (formData.password.length < 6) {
          setError('Құпия сөз кем дегенде 6 символ болуы керек');
          setLoading(false);
          return;
        }
        result = await register(formData.fullName, formData.email, formData.password);
      }

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-2xl mb-4 shadow-2xl">
            {isAdminLogin ? (
              <Shield className="h-12 w-12 text-white" />
            ) : (
              <User className="h-12 w-12 text-white" />
            )}
          </div>
          <h2 className="text-4xl font-bold mb-2">
            <span className="gradient-text">
              {isLogin ? 'Қош келдіңіз!' : 'Тіркелу'}
            </span>
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Аккаунтыңызға кіріңіз' : 'Жаңа аккаунт жасаңыз'}
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-card p-2 mb-6 flex gap-2">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              isLogin
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Кіру
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setIsAdminLogin(false);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              !isLogin
                ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Тіркелу
          </button>
        </div>

        {/* Form */}
        <div className="glass-card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - тек тіркелу кезінде */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Аты-жөні
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="Толық аты-жөніңіз"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Құпия сөз
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Кем дегенде 6 символ
                </p>
              )}
            </div>

            {/* Admin checkbox - тек кіру кезінде */}
            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminLogin"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="adminLogin" className="ml-2 block text-sm text-gray-700">
                  Админ ретінде кіру
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="spinner border-white" style={{ width: '20px', height: '20px' }} />
              ) : (
                <>
                  {isLogin ? (
                    <LogIn className="h-5 w-5" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                  <span>{isLogin ? 'Кіру' : 'Тіркелу'}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                Аккаунт жоқ па?{' '}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setIsAdminLogin(false);
                  }}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Тіркелу
                </button>
              </p>
            ) : (
              <p>
                Аккаунт бар ма?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Кіру
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Тіркелу арқылы сіз біздің шарттармен келісесіз</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
