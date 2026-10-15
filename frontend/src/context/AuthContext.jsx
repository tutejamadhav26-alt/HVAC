import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('airconiq_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('airconiq_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const userData = await fetchCurrentUser(token);
          if (userData) {
            setUser(userData);
            localStorage.setItem('airconiq_user', JSON.stringify(userData));
          } else {
            logout();
          }
        } catch (e) {
          console.warn('Session verification fallback to cached user');
        }
      }
      setIsLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const accessToken = data.access_token;
    const userInfo = {
      email,
      full_name: data.full_name || email,
      role: data.user_role || 'staff'
    };

    setToken(accessToken);
    setUser(userInfo);
    localStorage.setItem('airconiq_token', accessToken);
    localStorage.setItem('airconiq_user', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('airconiq_token');
    localStorage.removeItem('airconiq_user');
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (allowedRoles.includes('*')) return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      role: user?.role || 'guest',
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
