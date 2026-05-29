import { toast } from "react-toastify";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTranslation } from "../context/useTranslation";
import { updateUserPreferences } from "../services/authService";

function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useAppSettings();
  const { t } = useTranslation();

  const handleThemeChange = async () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);

    try {
      await updateUserPreferences({
        preferredLanguage: language,
        preferredTheme: newTheme,
      });

      toast.success("Preferenze salvate");
    } catch (error) {
      console.error(error);
      toast.error("Errore salvataggio preferenze");
    }
  };

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;

    setLanguage(newLanguage);

    try {
      await updateUserPreferences({
        preferredLanguage: newLanguage,
        preferredTheme: theme,
      });

      toast.success("Preferenze salvate");
    } catch (error) {
      console.error(error);
      toast.error("Errore salvataggio preferenze");
    }
  };

  return (
    <div className="app-page">
      <h1 className="fw-bold mb-1">{t.settingsTitle}</h1>

      <p className="text-muted mb-4">{t.settingsSubtitle}</p>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-4">{t.interfacePreferences}</h5>

          <div className="mb-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="darkModeSwitch"
                checked={theme === "dark"}
                onChange={handleThemeChange}
              />

              <label className="form-check-label" htmlFor="darkModeSwitch">
                {t.darkMode}
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              {t.applicationLanguage}
            </label>

            <select
              className="form-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          <hr />

          <h5 className="fw-bold mb-3">{t.system}</h5>

          <p className="text-muted mb-0">{t.appVersion}</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;