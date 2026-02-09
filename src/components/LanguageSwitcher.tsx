"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: "en", label: "English" },
        { code: "hi", label: "हिन्दी" },
        { code: "te", label: "తెలుగు" },
        { code: "ta", label: "தமிழ்" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[100px] justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{languages.find(l => l.code === language)?.label || "Language"}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as any)}
                        className={language === lang.code ? "bg-accent font-bold" : ""}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
