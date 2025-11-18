import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

// Axios базалық конфигурациясы
axios.defaults.baseURL = API_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Axios-қа token қосу
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Пайдаланушыны жүктеу
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data.data);
    } catch (error) {
      console.error('Пайдаланушыны жүктеу қатесі:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Тіркелу (User)
  const register = async (fullName, email, password) => {
    try {
      const res = await axios.post('/api/users/register', {
        fullName,
        email,
        password
      });

      const { token, ...userData } = res.data.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Қате орын алды'
      };
    }
  };

  // Кіру (User немесе Admin)
  const login = async (email, password, isAdmin = false) => {
    try {
      const res = await axios.post('/api/users/login', {
        email,
        password,
        isAdmin
      });

      const { token, ...userData } = res.data.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Қате орын алды'
      };
    }
  };

  // Профильді жаңарту
  const updateProfile = async (data) => {
    try {
      const res = await axios.put('/api/users/profile', data);
      setUser(res.data.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Қате орын алды'
      };
    }
  };

  // API кілттерін сақтау
  const saveApiKeys = async (apiKeys) => {
    try {
      const res = await axios.put('/api/users/api-keys', apiKeys);
      setUser({
        ...user,
        apiKeys: res.data.data.apiKeys
      });
      return { success: true, message: 'API кілттері сақталды!' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Қате орын алды'
      };
    }
  };

  // Шығу
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Token арқылы кіру (OTP үшін)
  const loginWithToken = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    loginWithToken, // OTP үшін
    updateProfile,
    saveApiKeys,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
