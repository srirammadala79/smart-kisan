"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Tractor,
    IndianRupee,
    Calendar,
    Clock,
    CreditCard,
    Briefcase,
    Info
} from "lucide-react";
import { useFarm } from "@/contexts/FarmContext";
import { useAuth } from "@/contexts/AuthContext";
import { EditProfileDialog } from "@/components/EditProfileDialog";

export default function ProfilePage() {
    const { applications, entries } = useFarm();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("all");
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Filter items based on active tab
    const allItems = [
        ...applications.map(app => ({ ...app, itemType: 'Application' })),
        ...entries.map(entry => ({ ...entry, itemType: 'Note', date: entry.date }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredItems = allItems.filter(item => {
        if (activeTab === "all") return true;
        if (activeTab === "notes") return item.itemType === 'Note';
        if (item.itemType === 'Application') {
            const app = item as any; // Type assertion for simplicity
            if (activeTab === "loans") return app.type === "Loan";
            if (activeTab === "rentals") return app.type === "Rental";
            if (activeTab === "bookings") return app.type === "Booking";
        }
        return false;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return "bg-green-100 text-green-800 hover:bg-green-100";
            case 'Rejected': return "bg-red-100 text-red-800 hover:bg-red-100";
            case 'Completed': return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            default: return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Loan': return <IndianRupee className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
            case 'Rental': return <Tractor className="h-6 w-6 text-green-600 dark:text-green-400" />;
            case 'Booking': return <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
            default: return <FileText className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

            {/* User Details Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-background overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    <div className="h-32 w-32 rounded-full bg-white dark:bg-black p-1 shadow-md shrink-0">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-5xl font-bold text-white shadow-inner">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{user?.name || "Guest User"}</h2>
                            <p className="text-muted-foreground font-medium">{user?.role || "Farmer"}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm mt-4">
                            <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-black/5 dark:border-white/5">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-md"><Mail className="h-4 w-4" /></div>
                                <span className="truncate">{user?.email}</span>
                            </div>
                            {user?.phone && (
                                <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-black/5 dark:border-white/5">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-md"><Phone className="h-4 w-4" /></div>
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user?.location && (
                                <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-black/5 dark:border-white/5">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-md"><MapPin className="h-4 w-4" /></div>
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </div>
                        {user?.bio && (
                            <div className="mt-6 p-4 bg-background/60 backdrop-blur-sm rounded-xl border text-sm flex gap-3 text-left">
                                <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                                <p className="leading-relaxed text-muted-foreground">{user.bio}</p>
                            </div>
                        )}
                    </div>
                    <Button variant="default" className="shadow-md" onClick={() => setIsEditProfileOpen(true)}>Edit Profile</Button>
                </CardContent>
            </Card>

            <EditProfileDialog
                open={isEditProfileOpen}
                onOpenChange={setIsEditProfileOpen}
            />

            {/* Applications History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Activity History</h2>
                </div>

                {/* Custom Tabs */}
                <div className="flex space-x-1 rounded-lg bg-muted p-1 overflow-x-auto">
                    {['all', 'loans', 'rentals', 'bookings', 'notes'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[80px] rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="grid gap-4">
                    {filteredItems.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No activity found in this category.
                            </CardContent>
                        </Card>
                    ) : (
                        filteredItems.map((item: any) => (
                            item.itemType === 'Note' ? (
                                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-amber-400">
                                    <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                                        <div className="flex gap-4 items-start">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl shrink-0">
                                                <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="font-semibold text-lg">{item.cropName || "General Note"}</h3>
                                                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">Note</Badge>
                                                    {item.completed && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-2 flex gap-6 flex-wrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <Briefcase className="h-3.5 w-3.5" /> {item.activity}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" /> {new Date(item.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {item.notes && (
                                                    <div className="mt-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg text-sm text-muted-foreground border border-black/5 dark:border-white/5">
                                                        {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-blue-500">
                                    <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                                        <div className="flex gap-4 items-start">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl shrink-0">
                                                {getIcon(item.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-lg">{item.itemName}</h3>
                                                    <Badge variant="secondary" className={getStatusColor(item.status)}>
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-2 flex gap-6 flex-wrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <FileText className="h-3.5 w-3.5" /> {item.type}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" /> {new Date(item.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded border">
                                                        #{item.bookingId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right pl-4 border-l border-dashed border-gray-200 dark:border-gray-800 md:ml-4">
                                            {item.amount && (
                                                <div className="font-bold text-xl text-primary">₹{parseInt(item.amount.replace(/[^0-9]/g, '') || '0').toLocaleString()}</div>
                                            )}
                                            {item.duration && (
                                                <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end mt-1">
                                                    <Clock className="h-3.5 w-3.5" /> {item.duration}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
