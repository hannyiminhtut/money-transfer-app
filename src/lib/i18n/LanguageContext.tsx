"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load saved language on mount
        const saved = localStorage.getItem('app-language') as Language;
        if (saved && (saved === 'en' || saved === 'my')) {
            setLanguageState(saved);
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    // Prevent hydration mismatch by rendering safely after mount,
    // or return early with the default language while avoiding layout shift where possible.
    // We'll just render it normally; to avoid major hydration mismatches on text, 
    // users can suppressHydrationWarning on root html or wait for mount.
    // We will just let Next.js reconcile it.

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
