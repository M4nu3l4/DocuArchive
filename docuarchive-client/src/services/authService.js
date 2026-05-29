import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = "https://localhost:7292/api";
const AUTH_URL = `${API_BASE_URL}/Auth`;

export const login = async (credentials) => {
  const response = await axios.post(`${AUTH_URL}/login`, credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post("/Auth/register", userData);
  return response.data;
};

export const saveAuthData = (authData) => {
  localStorage.setItem("docuarchive-token", authData.token);
  localStorage.setItem("docuarchive-user", JSON.stringify(authData));

  if (authData.preferredLanguage) {
    localStorage.setItem("docuarchive-language", authData.preferredLanguage);
  }

  if (authData.preferredTheme) {
    localStorage.setItem("docuarchive-theme", authData.preferredTheme);
  }
};

export const updateStoredUserPreferences = (preferences) => {
  const storedUser = getCurrentUser();

  if (!storedUser) return;

  const updatedUser = {
    ...storedUser,
    preferredLanguage:
      preferences.preferredLanguage ?? storedUser.preferredLanguage,
    preferredTheme: preferences.preferredTheme ?? storedUser.preferredTheme,
  };

  localStorage.setItem("docuarchive-user", JSON.stringify(updatedUser));
};

export const getToken = () => {
  return localStorage.getItem("docuarchive-token");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("docuarchive-user");

  if (!user) return null;

  return JSON.parse(user);
};

export const updateUserPreferences = async (preferences) => {
  const response = await axiosInstance.put("/Auth/preferences", preferences);

  updateStoredUserPreferences(preferences);

  if (preferences.preferredLanguage) {
    localStorage.setItem("docuarchive-language", preferences.preferredLanguage);
  }

  if (preferences.preferredTheme) {
    localStorage.setItem("docuarchive-theme", preferences.preferredTheme);
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("docuarchive-token");
  localStorage.removeItem("docuarchive-user");
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};