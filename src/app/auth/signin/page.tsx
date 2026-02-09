"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Sprout, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, error } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            // Error is handled in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-300 via-emerald-500 to-teal-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <Card className="w-full max-w-sm relative z-10 border-0 shadow-2xl bg-white/90 dark:bg-black/80 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-2 bg-primary/20 rounded-full">
                            <Sprout className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Sign in</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to access your farm dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="farmer@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02]" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
