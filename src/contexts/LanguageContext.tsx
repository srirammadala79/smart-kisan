"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, TranslationKey } from "@/translations/locales";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    // Optional: Persist language selection
    useEffect(() => {
        const savedLang = localStorage.getItem("app-language") as Language;
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("app-language", lang);
    };

    const t = (key: TranslationKey): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
