import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import kin from '../locales/kin.json';

const savedLanguage = localStorage.getItem('language');
const defaultLanguage = savedLanguage ? JSON.parse(savedLanguage) : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    kin: { translation: kin },
  },
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
