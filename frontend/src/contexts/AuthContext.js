import React, { createContext, useState } from 'react';

/**
 * Authentication context that stores the current JWT token and user
 * information derived from it. The context provides helpers for
 * logging in and out. Upon login the token is persisted to local
 * storage so that the user remains logged in across page reloads.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const tk = localStorage.getItem('token');
    if (!tk) return null;
    try {
      const payload = JSON.parse(atob(tk.split('.')[1]));
      return { email: payload.sub, roles: payload.roles ? payload.roles.split(',') : [] };
    } catch (e) {
      return null;
    }
  });

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ email: payload.sub, roles: payload.roles ? payload.roles.split(',') : [] });
    } catch (e) {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;