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
    const users = (await localforage.getItem('users')) || [];
    const foundUser = users.find(
      u => (u.username === identifier || u.email === identifier) && u.password === password
    );

    if (foundUser) {
      const { password, ...safeUser } = foundUser;
      await localforage.setItem('activeUser', safeUser);
      setUser(safeUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const register = async (userData) => {
    const users = (await localforage.getItem('users')) || [];
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, message: 'Username already taken' };
    }
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser = { ...userData, id: crypto.randomUUID(), createdAt: new Date() };
    users.push(newUser);
    await localforage.setItem('users', users);
    
    // Auto login
    const { password, ...safeUser } = newUser;
    await localforage.setItem('activeUser', safeUser);
    setUser(safeUser);
    
    return { success: true };
  };

  const updateProfile = async (updates) => {
    const users = (await localforage.getItem('users')) || [];
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, ...updates };
      }
      return u;
    });

    await localforage.setItem('users', updatedUsers);
    
    const currentUser = updatedUsers.find(u => u.id === user.id);
    const { password, ...safeUser } = currentUser;
    await localforage.setItem('activeUser', safeUser);
    setUser(safeUser);
    return { success: true };
  };

  const logout = async () => {
    await localforage.removeItem('activeUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
