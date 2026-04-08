"use client";

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TranslationKey } from '@/lib/i18n/translations';

interface TranslateProps {
    tKey: TranslationKey;
}

export function Translate({ tKey }: TranslateProps) {
    const { t } = useLanguage();
    return <>{t(tKey)}</>;
}
