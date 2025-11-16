import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Axios-қа token қосу
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadAdmin();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Админді жүктеу
  const loadAdmin = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setAdmin(res.data.data);
    } catch (error) {
      console.error('Админді жүктеу қатесі:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Логин
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      const { token, ...adminData } = res.data.data;

      localStorage.setItem('adminToken', token);
      setToken(token);
      setAdmin(adminData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Қате орын алды'
      };
    }
  };

  // Тіркеу
  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      const { token, ...adminData } = res.data.data;

      localStorage.setItem('adminToken', token);
      setToken(token);
      setAdmin(adminData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Қате орын алды'
      };
    }
  };

  // Шығу
  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    admin,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
