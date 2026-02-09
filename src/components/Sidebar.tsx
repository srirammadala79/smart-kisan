"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CloudSun,
    TrendingUp,
    Calculator,
    Store,
    Bot,
    BookOpen,
    LogOut,
    Menu,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const sidebarItems = [
    { icon: LayoutDashboard, label: "sidebar.dashboard", href: "/dashboard" },
    { icon: CloudSun, label: "sidebar.weather", href: "/dashboard/weather" },
    { icon: TrendingUp, label: "sidebar.market", href: "/dashboard/market" },
    { icon: Calculator, label: "sidebar.loans", href: "/dashboard/loans" },
    { icon: Store, label: "sidebar.marketplace", href: "/dashboard/marketplace" },
    { icon: Bot, label: "sidebar.assistant", href: "/dashboard/assistant" },
    { icon: BookOpen, label: "sidebar.resources", href: "/dashboard/resources" },
    { icon: FileText, label: "Schemes", href: "/dashboard/schemes" },
    { icon: Calculator, label: "sidebar.tools", href: "/dashboard/tools" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, isAuthenticated, user } = useAuth();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="md:hidden p-4 bg-background border-b flex justify-between items-center">
                <span className="font-bold text-lg text-primary">{t("app.title")}</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Menu />
                </Button>
            </div>

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-background to-amber-50/50 dark:from-background dark:to-stone-900/50 border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col">
                    <div className="flex flex-col border-b px-6 py-4 gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                            <span className="text-2xl">🌱</span>
                            <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                {t("app.title")}
                            </span>
                        </Link>
                        {isAuthenticated && (
                            <Link href="/dashboard/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                👋 Welcome back, {user?.name || "Farmer"}
                            </Link>
                        )}
                        {!isAuthenticated && (
                            <div className="text-sm font-medium text-muted-foreground">
                                👋 Welcome, Guest
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="grid gap-1 px-2">
                            {sidebarItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                        pathname === item.href
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                            : "text-muted-foreground hover:translate-x-1"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {t(item.label as any)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="border-t p-4 space-y-2">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm text-muted-foreground">Language</span>
                            <LanguageSwitcher />
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            {t("sidebar.signout")}
                        </Button>
                    </div>
                </div>
            </div>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
