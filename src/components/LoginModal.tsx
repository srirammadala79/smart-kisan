"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function LoginModal() {
    const { showLoginModal, setShowLoginModal } = useAuth();
    const router = useRouter();

    if (!showLoginModal) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card p-6 shadow-xl border border-border"
                >
                    <button
                        onClick={() => setShowLoginModal(false)}
                        className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted/50 transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground">
                            Authentication Required
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            If you already have credentials, please Sign In. Otherwise, create a new account to access full features.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setShowLoginModal(false);
                                router.push("/auth/signin");
                            }}
                            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => {
                                setShowLoginModal(false);
                                router.push("/auth/signup");
                            }}
                            className="w-full rounded-xl border border-input bg-background px-4 py-3 font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
