import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signupApi, loginApi, getMeApi, getStoredToken, setStoredToken, removeStoredToken } from '../api/auth';
import { getLearningProfile } from '../api/learningDNA';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch current user's profile
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      return;
    }
    setLoadingProfile(true);
    try {
      const data = await getLearningProfile();
      setProfile(data);
    } catch (err) {
      // 404 means no profile created yet, which is normal for brand new users
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [token]);

  // Restore authenticated session on startup
  useEffect(() => {
    async function restoreSession() {
      const savedToken = getStoredToken();
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await getMeApi();
        setUser(userData);
        setToken(savedToken);
      } catch (err) {
        console.warn('Session expired or invalid, clearing stored credentials');
        removeStoredToken();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  // When user is authenticated, fetch their learning profile
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, fetchProfile]);

  // Handle unauthorized global events
  useEffect(() => {
    const handleUnauthorized = () => {
      removeStoredToken();
      setUser(null);
      setToken(null);
      setProfile(null);
    };

    window.addEventListener('adapt:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('adapt:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    setStoredToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const signup = async (name, email, password) => {
    const res = await signupApi({ name, email, password });
    setStoredToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.id || null,
        userName: user?.name || '',
        userEmail: user?.email || '',
        isAuthenticated: Boolean(user),
        loading,
        profile,
        loadingProfile,
        refreshProfile: fetchProfile,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
