"use client";

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'my' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 p-2 px-3 bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors text-sm font-semibold text-blue-100"
            title={language === 'en' ? 'Switch to Burmese' : 'Switch to English'}
        >
            <Languages className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">
                {language === 'en' ? 'မြန်မာ' : 'English'}
            </span>
        </button>
    );
}
