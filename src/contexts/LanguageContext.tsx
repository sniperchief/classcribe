'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ar' | 'hi';

type Translations = {
  [key: string]: {
    [lang in Language]: string;
  };
};

// Translation strings
export const translations: Translations = {
  // Dashboard
  'dashboard.greeting': {
    en: 'Hi',
    es: 'Hola',
    fr: 'Salut',
    de: 'Hallo',
    pt: 'Olá',
    zh: '你好',
    ar: 'مرحبا',
    hi: 'नमस्ते',
  },
  'dashboard.title': {
    en: 'Dashboard',
    es: 'Tablero',
    fr: 'Tableau de bord',
    de: 'Dashboard',
    pt: 'Painel',
    zh: '仪表板',
    ar: 'لوحة القيادة',
    hi: 'डैशबोर्ड',
  },
  'dashboard.lectures': {
    en: 'Your Lectures',
    es: 'Tus Clases',
    fr: 'Vos Cours',
    de: 'Ihre Vorlesungen',
    pt: 'Suas Aulas',
    zh: '你的讲座',
    ar: 'محاضراتك',
    hi: 'आपके व्याख्यान',
  },
  'dashboard.upload': {
    en: 'Upload Lecture Recording',
    es: 'Subir Grabación de Clase',
    fr: 'Télécharger l\'enregistrement',
    de: 'Vorlesungsaufnahme hochladen',
    pt: 'Enviar Gravação de Aula',
    zh: '上传讲座录音',
    ar: 'تحميل تسجيل المحاضرة',
    hi: 'व्याख्यान रिकॉर्डिंग अपलोड करें',
  },
  'dashboard.noLectures': {
    en: 'No lectures yet',
    es: 'Aún no hay clases',
    fr: 'Pas encore de cours',
    de: 'Noch keine Vorlesungen',
    pt: 'Ainda não há aulas',
    zh: '还没有讲座',
    ar: 'لا توجد محاضرات بعد',
    hi: 'अभी तक कोई व्याख्यान नहीं',
  },
  'dashboard.remaining': {
    en: 'lectures remaining',
    es: 'clases restantes',
    fr: 'cours restants',
    de: 'Vorlesungen übrig',
    pt: 'aulas restantes',
    zh: '剩余讲座',
    ar: 'المحاضرات المتبقية',
    hi: 'शेष व्याख्यान',
  },
  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    es: 'Tablero',
    fr: 'Tableau de bord',
    de: 'Dashboard',
    pt: 'Painel',
    zh: '仪表板',
    ar: 'لوحة القيادة',
    hi: 'डैशबोर्ड',
  },
  'nav.settings': {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    de: 'Einstellungen',
    pt: 'Configurações',
    zh: '设置',
    ar: 'الإعدادات',
    hi: 'सेटिंग्स',
  },
  'nav.upgrade': {
    en: 'Upgrade to Premium',
    es: 'Actualizar a Premium',
    fr: 'Passer à Premium',
    de: 'Auf Premium upgraden',
    pt: 'Atualizar para Premium',
    zh: '升级到高级版',
    ar: 'الترقية إلى بريميوم',
    hi: 'प्रीमियम में अपग्रेड करें',
  },
  'nav.logout': {
    en: 'Logout',
    es: 'Cerrar sesión',
    fr: 'Déconnexion',
    de: 'Abmelden',
    pt: 'Sair',
    zh: '登出',
    ar: 'تسجيل الخروج',
    hi: 'लॉग आउट',
  },
  // Settings
  'settings.title': {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    de: 'Einstellungen',
    pt: 'Configurações',
    zh: '设置',
    ar: 'الإعدادات',
    hi: 'सेटिंग्स',
  },
  'settings.account': {
    en: 'Account',
    es: 'Cuenta',
    fr: 'Compte',
    de: 'Konto',
    pt: 'Conta',
    zh: '账户',
    ar: 'الحساب',
    hi: 'खाता',
  },
  'settings.username': {
    en: 'Username',
    es: 'Nombre de usuario',
    fr: 'Nom d\'utilisateur',
    de: 'Benutzername',
    pt: 'Nome de usuário',
    zh: '用户名',
    ar: 'اسم المستخدم',
    hi: 'उपयोगकर्ता नाम',
  },
  'settings.email': {
    en: 'Email Address',
    es: 'Correo Electrónico',
    fr: 'Adresse e-mail',
    de: 'E-Mail-Adresse',
    pt: 'Endereço de E-mail',
    zh: '电子邮件地址',
    ar: 'عنوان البريد الإلكتروني',
    hi: 'ईमेल पता',
  },
  'settings.language': {
    en: 'Language',
    es: 'Idioma',
    fr: 'Langue',
    de: 'Sprache',
    pt: 'Idioma',
    zh: '语言',
    ar: 'اللغة',
    hi: 'भाषा',
  },
  'settings.selectLanguage': {
    en: 'Select Language',
    es: 'Seleccionar Idioma',
    fr: 'Sélectionner la Langue',
    de: 'Sprache auswählen',
    pt: 'Selecionar Idioma',
    zh: '选择语言',
    ar: 'اختر اللغة',
    hi: 'भाषा चुनें',
  },
  // Common
  'common.chooseFile': {
    en: 'Choose File',
    es: 'Elegir Archivo',
    fr: 'Choisir un fichier',
    de: 'Datei auswählen',
    pt: 'Escolher Arquivo',
    zh: '选择文件',
    ar: 'اختر ملف',
    hi: 'फ़ाइल चुनें',
  },
  'common.uploading': {
    en: 'Uploading...',
    es: 'Subiendo...',
    fr: 'Téléchargement...',
    de: 'Hochladen...',
    pt: 'Enviando...',
    zh: '上传中...',
    ar: 'جارٍ التحميل...',
    hi: 'अपलोड हो रहा है...',
  },
  'common.of': {
    en: 'of',
    es: 'de',
    fr: 'de',
    de: 'von',
    pt: 'de',
    zh: '的',
    ar: 'من',
    hi: 'का',
  },
};

export const languageNames: { [key in Language]: string } = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ar: 'العربية',
  hi: 'हिंदी',
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLang = localStorage.getItem('classcribe-language') as Language;
    if (savedLang && languageNames[savedLang]) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('classcribe-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation['en'] || key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Default translation function for SSR/SSG
const defaultT = (key: string): string => {
  const translation = translations[key];
  if (!translation) {
    return key;
  }
  return translation['en'] || key;
};

// Default context value for SSR/SSG
const defaultContextValue: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: defaultT,
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  // Return default value during SSR/SSG instead of throwing
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
