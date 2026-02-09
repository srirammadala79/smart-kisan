"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { FarmProvider } from "@/contexts/FarmContext";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    // Authenticated data is still used by the layout if available, 
    // but we no longer force redirect here to allow "view only" mode.
    // InteractionGuard in RootLayout handles the login prompt on click.

    // If not authenticated, we could return null or a loading spinner
    // But since the AuthContext initializes quickly from localStorage, 
    // we can just render. The useEffect will kick in if they are truly logged out.

    return (
        <FarmProvider>
            <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </FarmProvider>
    );
}
