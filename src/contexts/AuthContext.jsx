import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pariman_token');
    if (token) {
      api.getMe()
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('pariman_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password);
    localStorage.setItem('pariman_token', token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const { token, user } = await api.register(data);
    localStorage.setItem('pariman_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('pariman_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
