"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // stored for local auth simulation
    phone?: string;
    location?: string;
    role?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    error: string | null;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Disabled auto-login from localStorage to satisfy the "Strict interaction" requirement.
        // The app will now always start in 'guest' mode until the user logs in via the interaction prompt.
        /*
        const storedUser = localStorage.getItem("farmer_app_current_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        */
    }, []);

    const getUsers = (): User[] => {
        const users = localStorage.getItem("farmer_app_users");
        return users ? JSON.parse(users) : [];
    };

    const login = async (email: string, password: string) => {
        setError(null);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const users = getUsers();
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const { password, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword as User);
            localStorage.setItem("farmer_app_current_user", JSON.stringify(userWithoutPassword));
            router.push("/dashboard");
        } else {
            // Check if user exists but password is wrong
            const userExists = users.find(u => u.email === email);
            if (userExists) {
                setError("Invalid password. Please try again.");
            } else {
                setError("Account not found. Please sign up.");
            }
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));

        const users = getUsers();

        if (users.some(u => u.email === email)) {
            setError("Account with this email already exists. Please sign in.");
            return;
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            name,
            email,
            password,
            // Default values for new fields
            phone: "",
            location: "",
            role: "Farmer", // Default role
            bio: ""
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem("farmer_app_users", JSON.stringify(updatedUsers));

        // Auto login after signup
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem("farmer_app_current_user", JSON.stringify(userWithoutPassword));

        router.push("/dashboard");
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        // Update local state
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        // Update current user in localStorage
        localStorage.setItem("farmer_app_current_user", JSON.stringify(updatedUser));

        // Update user in the list of all users
        const users = getUsers();
        const updatedUsers = users.map(u => u.email === user.email ? { ...u, ...data } : u);
        localStorage.setItem("farmer_app_users", JSON.stringify(updatedUsers));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("farmer_app_current_user");
        router.push("/auth/signin");
    };

    return (
        <AuthContext.Provider
            value={{ user, login, signup, updateProfile, logout, isAuthenticated: !!user, error, showLoginModal, setShowLoginModal }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
