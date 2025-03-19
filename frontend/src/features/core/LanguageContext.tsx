import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the available languages
export type Language = 'tr' | 'en' | 'ar';

// Define the structure of our context
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations for our application
const translations: Record<Language, Record<string, string>> = {
  tr: {
    'feedback.question': 'Deneyiminiz nasıldı?',
    'complaint.title': 'Müşterilerimizin %100 memnun olmasını istiyoruz. Lütfen neden kötü bir deneyim yaşadığınızı bize bildirin, böylece hizmetimizi geliştirebiliriz.',
    'complaint.name': 'Adınızı giriniz',
    'complaint.phone': 'Telefon numaranız',
    'complaint.email': 'E-posta adresinizi giriniz',
    'complaint.review': 'Lütfen deneyiminizi detaylı olarak paylaşın...',
    'complaint.consent': 'Kişisel Verilerin İşlenmesine İzin Veriyorum',
    'complaint.submit': 'Gönder',
    'complaint.submitting': 'Gönderiliyor...',
    'complaint.food': 'Yiyecek',
    'complaint.service': 'Hizmet',
    'complaint.atmosphere': 'Atmosfer',
    'complaint.required': 'Zorunlu alan',
    'review.title': 'Fikirleriniz bizim için değerli! Geri bildirimleriniz bize daha iyi hizmet vermemize yardımcı olacaktır.',
    'language': 'TR'
  },
  en: {
    'feedback.question': 'How was your experience?',
    'complaint.title': 'We want our customers to be 100% satisfied. Please let us know why you had a bad experience, so we can improve our service.',
    'complaint.name': 'Enter your name',
    'complaint.phone': 'Phone number',
    'complaint.email': 'Enter your email address',
    'complaint.review': 'Please share your experience in detail...',
    'complaint.consent': 'I consent to the processing of personal data',
    'complaint.submit': 'Submit',
    'complaint.submitting': 'Submitting...',
    'complaint.food': 'Food',
    'complaint.service': 'Service',
    'complaint.atmosphere': 'Atmosphere',
    'complaint.required': 'Required field',
    'review.title': 'Your opinions are valuable to us! Your feedback will help us provide better service.',
    'language': 'EN'
  },
  ar: {
    'feedback.question': 'كيف كانت تجربتك؟',
    'complaint.title': 'نريد أن يكون عملاؤنا راضين بنسبة 100٪. يرجى إخبارنا بسبب تجربتك السيئة، حتى نتمكن من تحسين خدمتنا.',
    'complaint.name': 'أدخل اسمك',
    'complaint.phone': 'رقم الهاتف',
    'complaint.email': 'أدخل عنوان بريدك الإلكتروني',
    'complaint.review': 'يرجى مشاركة تجربتك بالتفصيل...',
    'complaint.consent': 'أوافق على معالجة البيانات الشخصية',
    'complaint.submit': 'إرسال',
    'complaint.submitting': 'جار الإرسال...',
    'complaint.food': 'الطعام',
    'complaint.service': 'الخدمة',
    'complaint.atmosphere': 'الأجواء',
    'complaint.required': 'حقل مطلوب',
    'review.title': 'آراؤكم قيمة بالنسبة لنا! ستساعدنا ملاحظاتكم على تقديم خدمة أفضل.',
    'language': 'عربي'
  }
};

// Provider component that wraps our app and makes language context available
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr');

  // Translate function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
