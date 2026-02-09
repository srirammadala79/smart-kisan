import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InteractionGuard } from "@/components/InteractionGuard";
import { LoginModal } from "@/components/LoginModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriSmart - Farmer Assistant",
  description: "AI-powered farming assistant for weather, crops, and loans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <InteractionGuard />
            <LoginModal />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
