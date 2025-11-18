import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, User, Check, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const Auth = () => {
  // State
  const [step, setStep] = useState('input'); // 'input' | 'verify'
  const [identifier, setIdentifier] = useState(''); // email
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 санды код
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Countdown timer
  const [showFullNameInput, setShowFullNameInput] = useState(false);
  const [devCode, setDevCode] = useState(''); // Development mode үшін

  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);


  // Код жіберу
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/send-otp', {
        identifier: identifier.trim()
      });

      if (res.data.success) {
        setStep('verify');
        setTimer(600); // 10 минут = 600 секунд

        // Development mode-та кодты көрсету
        if (res.data.devMode && res.data.code) {
          setDevCode(res.data.code);
          console.log('🔑 Dev Code:', res.data.code);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Код жіберу қатесі');
    } finally {
      setLoading(false);
    }
  };

  // Кодты тексеру
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const codeString = code.join('');

    if (codeString.length !== 6) {
      setError('6 санды кодты толық енгізіңіз');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/verify-otp', {
        identifier: identifier.trim(),
        code: codeString,
        fullName: fullName.trim()
      });

      if (res.data.success) {
        // Token арқылы кіру
        loginWithToken(res.data.data.token, res.data.data);

        // Роліне қарап бағыттау
        const userRole = res.data.data.role;
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      const errorData = err.response?.data;

      // Жаңа пайдаланушы - аты-жөнін сұрау
      if (errorData?.requiresFullName) {
        setShowFullNameInput(true);
        setError(errorData.message);
      } else {
        setError(errorData?.message || 'Код тексеру қатесі');
      }
    } finally {
      setLoading(false);
    }
  };

  // Код input өзгергенде
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Тек сандар

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автоматты фокус келесі input-қа
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Backspace басқанда
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Қайта жіберу
  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    setDevCode('');
    handleSendCode({ preventDefault: () => {} });
  };

  // Timer форматы
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Артқа қайту
  const handleBack = () => {
    setStep('input');
    setCode(['', '', '', '', '', '']);
    setError('');
    setShowFullNameInput(false);
    setFullName('');
    setDevCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-2xl mb-4 shadow-2xl">
            <User className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-2">
            <span className="gradient-text">
              {step === 'input' ? 'Қош келдіңіз!' : 'Кодты енгізіңіз'}
            </span>
          </h2>
          <p className="text-gray-600">
            {step === 'input'
              ? 'Email енгізіңіз'
              : 'Код email-ге жіберілді'
            }
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 animate-slide-up">
          {step === 'input' ? (
            // ===== ҚАДАМ 1: Email/Phone енгізу =====
            <form onSubmit={handleSendCode} className="space-y-6">
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="input-field pl-10"
                    placeholder="email@example.com"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Сізге 6 санды код жіберіледі
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="spinner border-white" style={{ width: '20px', height: '20px' }} />
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Код жіберу</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // ===== ҚАДАМ 2: Код енгізу =====
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {/* Артқа қайту */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Артқа</span>
              </button>

              {/* Identifier көрсету */}
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Код жіберілді:</p>
                <p className="text-lg font-semibold text-gray-800">{identifier}</p>
              </div>

              {/* Timer */}
              {timer > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Код {formatTime(timer)} ішінде жарамды
                  </p>
                </div>
              )}

              {/* Development mode - код көрсету */}
              {devCode && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium">🔧 DEV MODE</p>
                  <p className="text-2xl font-bold text-yellow-900 text-center tracking-wider">
                    {devCode}
                  </p>
                </div>
              )}

              {/* Код енгізу (6 input) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  6 санды кодты енгізіңіз
                </label>
                <div className="flex justify-center space-x-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Аты-жөнін сұрау (жаңа user үшін) */}
              {showFullNameInput && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Аты-жөніңіз (жаңа аккаунт үшін)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={showFullNameInput}
                      className="input-field pl-10"
                      placeholder="Толық аты-жөніңіз"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm animate-fade-in">
                  {error}
                </div>
              )}

              {/* Тексеру батырмасы */}
              <button
                type="submit"
                disabled={loading || code.some(d => !d)}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="spinner border-white" style={{ width: '20px', height: '20px' }} />
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Кіру</span>
                  </>
                )}
              </button>

              {/* Қайта жіберу */}
              {timer === 0 && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full text-center text-primary-600 font-medium hover:underline"
                >
                  Қайта жіберу
                </button>
              )}
            </form>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Кіру арқылы сіз біздің шарттармен келісесіз</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
