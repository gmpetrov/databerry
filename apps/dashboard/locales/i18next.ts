import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// German Translations:
import chatbubbleDe from './de/chatbubble.json';
import crispDe from './de/crisp.json';
// English Translations:
import chatbubbleEn from './en/chatbubble.json';
import crispEn from './en/crisp.json';

type SupportedLanguages = 'en' | 'de';

const EnglishRessource = {
  chatbubble: chatbubbleEn,
  crisp: crispEn,
};

type Translation = typeof EnglishRessource;

const resources: Record<SupportedLanguages, Translation> = {
  en: EnglishRessource,
  de: {
    chatbubble: chatbubbleDe,
    crisp: crispDe,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['de', 'en'],
    nonExplicitSupportedLngs: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: [],
    },
  });

export default i18n;
