import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: 'SECURE_ADMIN',
    email: 'admin_user@cyber.shield',
    role: 'Super Admin',
    level: '7',
    bio: 'Lead Cyber Threat Intelligence Analyst specializing in Neural Anomaly Detection and Global Risk Mitigation.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
    notifications: true,
    twoFactor: true,
    stealthMode: false,
    keyRotation: true,
    socPurge: false,
    adminConsole: true
  });

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
