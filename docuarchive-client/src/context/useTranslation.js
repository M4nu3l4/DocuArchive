import { useAppSettings } from "./AppSettingsContext";
import { translations } from "../locales/translations";

export function useTranslation() {
  const { language } = useAppSettings();

  const t = translations[language] || translations.it;

  return { t, language };
}