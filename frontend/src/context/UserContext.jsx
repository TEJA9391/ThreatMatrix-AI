import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const DEFAULT_USER = {
  name: 'SECURE_ADMIN',
  email: 'admin_user@threatmatrix.ai',
  role: 'Super Admin',
  level: '7',
  bio: 'Lead Cyber Threat Intelligence Analyst specializing in Neural Anomaly Detection and Global Risk Mitigation.',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  notifications: false,
  twoFactor: true,
  stealthMode: false,
  keyRotation: true,
  socPurge: false,
  adminConsole: true
};

import axios from 'axios';

export function UserProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tm_auth') === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('tm_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
  });

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        username,
        password
      });
      if (response.data.success) {
        const loggedUser = response.data.user;
        setIsAuthenticated(true);
        setUser(loggedUser);
        localStorage.setItem('tm_auth', 'true');
        localStorage.setItem('tm_user', JSON.stringify(loggedUser));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Access authorization failure.';
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, role, level, bio, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        username,
        email,
        role,
        level,
        bio,
        password
      });
      if (response.data.success) {
        const registeredUser = response.data.user;
        setIsAuthenticated(true);
        setUser(registeredUser);
        localStorage.setItem('tm_auth', 'true');
        localStorage.setItem('tm_user', JSON.stringify(registeredUser));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration handshake failure.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(DEFAULT_USER);
    localStorage.setItem('tm_auth', 'false');
    localStorage.removeItem('tm_user');
  };

  const updateUser = async (newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('tm_user', JSON.stringify(updated));
      
      // Sync DB in background
      axios.post('http://localhost:5001/api/auth/update', {
        username: updated.name,
        email: updated.email,
        role: updated.role,
        level: updated.level,
        bio: updated.bio,
        avatar: updated.avatar
      }).catch(err => console.error("DB Update Sync Error:", err));

      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
