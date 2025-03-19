import React from 'react';
import { useLanguage, Language } from '@/features/core/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex justify-end mb-4 gap-2">
      <Button 
        variant="ghost" 
        className={`px-2 py-1 ${language === 'tr' ? 'bg-primary text-primary-foreground' : ''}`}
        onClick={() => setLanguage('tr')}
      >
        TR
      </Button>
      <Button 
        variant="ghost" 
        className={`px-2 py-1 ${language === 'en' ? 'bg-primary text-primary-foreground' : ''}`}
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button 
        variant="ghost" 
        className={`px-2 py-1 ${language === 'ar' ? 'bg-primary text-primary-foreground' : ''}`}
        onClick={() => setLanguage('ar')}
      >
        عربي
      </Button>
    </div>
  );
};

export default LanguageSelector; 