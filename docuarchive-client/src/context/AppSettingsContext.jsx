import { createContext, useContext, useEffect, useState } from "react";

const AppSettingsContext = createContext();

export function AppSettingsProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("docuarchive-theme") || "light"
  );

  const [language, setLanguage] = useState(
    localStorage.getItem("docuarchive-language") || "it"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("docuarchive-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("docuarchive-language", language);
  }, [language]);

  const applyUserPreferences = (preferences) => {
    if (!preferences) return;

    if (preferences.preferredTheme) {
      setTheme(preferences.preferredTheme);
    }

    if (preferences.preferredLanguage) {
      setLanguage(preferences.preferredLanguage);
    }
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("docuarchive-theme", newTheme);
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("docuarchive-language", newLanguage);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("docuarchive-theme", nextTheme);
      return nextTheme;
    });
  };

  return (
    <AppSettingsContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        toggleTheme,
        language,
        setLanguage: updateLanguage,
        applyUserPreferences,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}