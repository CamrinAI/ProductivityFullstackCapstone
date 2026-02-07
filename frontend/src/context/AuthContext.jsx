import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize token from localStorage on mount
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken) => {
    const tokenToUse = authToken || token;
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        setToken(null);
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
      localStorage.removeItem('access_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, company = '') => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, company })
      });
      const data = await res.json();
      
      console.log('Register response:', data);
      
      if (data.success) {
        const { user, access_token } = data;
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        setUser(user);
        setLoading(false);
        return { success: true, user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      console.log('Login response:', data);
      
      if (data.success) {
        const { user, access_token } = data;
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        setUser(user);
        setLoading(false);
        return { success: true, user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
