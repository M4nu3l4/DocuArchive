import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
  saveAuthData,
} from "../services/authService";

import { useAppSettings } from "./AppSettingsContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { applyUserPreferences } = useAppSettings();

  const [user, setUser] = useState(null);

  const [authenticated, setAuthenticated] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const loggedUser = getCurrentUser();

        if (loggedUser && isAuthenticated()) {
          setUser(loggedUser);
          setAuthenticated(true);

          applyUserPreferences(loggedUser);
        }
      } catch (error) {
        console.error("Errore inizializzazione auth:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginUser = async (credentials) => {
    const authData = await login(credentials);

    saveAuthData(authData);

    setUser(authData);
    setAuthenticated(true);

    applyUserPreferences(authData);

    return authData;
  };

  const logoutUser = () => {
    logout();

    setUser(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        authLoading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}