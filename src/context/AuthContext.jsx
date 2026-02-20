import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const savedUser = await localforage.getItem('activeUser');
      if (savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        await localforage.setItem('activeUser', data.user);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (res.ok) {
        await localforage.setItem('activeUser', data.user);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, updates })
      });
      const data = await res.json();

      if (res.ok) {
        await localforage.setItem('activeUser', data.user);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Update failed' };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (res.ok) {
        await logout();
        return { success: true };
      }
      const data = await res.json();
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Deletion failed' };
    }
  };

  const logout = async () => {
    await localforage.removeItem('activeUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, deleteAccount, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
