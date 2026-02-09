"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface NotebookEntry {
    id: string;
    cropName: string;
    activity: string; // e.g., Sowing, Fertilizing, Harvest
    date: string; // ISO date string
    notes?: string;
    completed: boolean;
}

export interface Application {
    id: string;
    type: 'Loan' | 'Rental' | 'Booking';
    itemName: string; // e.g., "Personal Loan", "Tractor", "Harvester"
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
    bookingId: string;
    amount?: string;
    duration?: string;
}

interface FarmContextType {
    entries: NotebookEntry[];
    addEntry: (entry: Omit<NotebookEntry, "id" | "completed">) => void;
    toggleEntry: (id: string) => void;
    deleteEntry: (id: string) => void;
    applications: Application[];
    addApplication: (app: Omit<Application, "id" | "date">) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

import { useAuth } from "./AuthContext";

export function FarmProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);

        if (!user) {
            setEntries([]);
            setApplications([]);
            return;
        }

        // Load Notebook Entries
        const storedEntries = localStorage.getItem(`farm_notebook_entries_${user.id}`);
        if (storedEntries) {
            try {
                const parsed = JSON.parse(storedEntries);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const validEntries = parsed.filter((entry: NotebookEntry) => {
                    const entryTime = new Date(entry.date).setHours(0, 0, 0, 0);
                    return entryTime >= today.getTime();
                });
                setEntries(validEntries);
            } catch (e) {
                console.error("Failed to parse notebook entries", e);
                setEntries([]);
            }
        } else {
            // FALLBACK: Check for legacy global data (Migration)
            const globalEntries = localStorage.getItem("farm_notebook_entries");
            if (globalEntries) {
                try {
                    const parsed = JSON.parse(globalEntries);
                    // Filter logic...
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const validEntries = parsed.filter((entry: NotebookEntry) => {
                        const entryTime = new Date(entry.date).setHours(0, 0, 0, 0);
                        return entryTime >= today.getTime();
                    });
                    setEntries(validEntries);
                    // Clear global data after claiming it? 
                    // decided: YES, to avoid duplication for subsequent users.
                    localStorage.removeItem("farm_notebook_entries");
                } catch (e) {
                    setEntries([]);
                }
            } else {
                setEntries([]);
            }
        }

        // Load Applications
        const storedApps = localStorage.getItem(`farm_applications_${user.id}`);
        if (storedApps) {
            try {
                setApplications(JSON.parse(storedApps));
            } catch (e) {
                console.error("Failed to parse applications", e);
                setApplications([]);
            }
        } else {
            // FALLBACK: Check for legacy global data (Migration)
            const globalApps = localStorage.getItem("farm_applications");
            if (globalApps) {
                try {
                    setApplications(JSON.parse(globalApps));
                    localStorage.removeItem("farm_applications");
                } catch (e) {
                    setApplications([]);
                }
            } else {
                setApplications([]);
            }
        }
        setIsLoaded(true);
    }, [user]);

    useEffect(() => {
        if (isLoaded && user) {
            localStorage.setItem(`farm_notebook_entries_${user.id}`, JSON.stringify(entries));
            localStorage.setItem(`farm_applications_${user.id}`, JSON.stringify(applications));
        }
    }, [entries, applications, isLoaded, user]);

    const addApplication = (app: Omit<Application, "id" | "date">) => {
        const newApp: Application = {
            ...app,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        setApplications(prev => [newApp, ...prev]);
    };

    const addEntry = (entry: Omit<NotebookEntry, "id" | "completed">) => {
        const newEntry = {
            ...entry,
            id: crypto.randomUUID(),
            completed: false
        };
        setEntries(prev => [newEntry, ...prev]);
    };

    const toggleEntry = (id: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
    };

    const deleteEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    return (
        <FarmContext.Provider value={{
            entries,
            addEntry,
            toggleEntry,
            deleteEntry,
            applications,
            addApplication
        }}>
            {children}
        </FarmContext.Provider>
    );
}

export function useFarm() {
    const context = useContext(FarmContext);
    if (context === undefined) {
        throw new Error("useFarm must be used within a FarmProvider");
    }
    return context;
}

