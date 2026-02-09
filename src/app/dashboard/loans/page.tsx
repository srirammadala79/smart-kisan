"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarm } from "@/contexts/FarmContext";
import { StoreLocation } from "@/types";
import { calculateDistance } from "@/utils/distance";
import {
    MapPin,
    Navigation,
    Search,
    Landmark,
    ArrowRight,
    CheckCircle2,
    FileText,
    AlertCircle,
    Loader2,
    X
} from "lucide-react";

// Dynamically import Map
const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-secondary animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

interface LoanPlan {
    id: string;
    name: string;
    interestRate: number;
    maxAmount: number;
    tenureMonths: number;
    type: "Short Term" | "Long Term";
}

const LOAN_PLANS: LoanPlan[] = [
    { id: "kcc", name: "Kisan Credit Card (KCC)", interestRate: 7, maxAmount: 300000, tenureMonths: 12, type: "Short Term" },
    { id: "tractor", name: "Farm Mechanization Loan", interestRate: 9.5, maxAmount: 1000000, tenureMonths: 60, type: "Long Term" },
    { id: "land", name: "Land Purchase Scheme", interestRate: 8.5, maxAmount: 2000000, tenureMonths: 120, type: "Long Term" },
    { id: "dairy", name: "Dairy Entrepreneurship", interestRate: 8.0, maxAmount: 500000, tenureMonths: 36, type: "Long Term" }
];

export default function LoansPage() {
    const { t } = useLanguage();
    const { addApplication } = useFarm();

    // State
    const [userLocation, setUserLocation] = useState<[number, number]>([17.3850, 78.4867]);
    const [viewCenter, setViewCenter] = useState<[number, number]>([17.3850, 78.4867]);
    const [banks, setBanks] = useState<StoreLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<StoreLocation | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
    const [isApplicationOpen, setIsApplicationOpen] = useState(false);
    const [applicationStep, setApplicationStep] = useState(1); // 1: Form, 2: Success

    // Fetch Location & Banks
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setViewCenter([latitude, longitude]);
                    fetchBanks(latitude, longitude);
                },
                (err) => {
                    console.warn("Location denied", err);
                    fetchBanks(17.3850, 78.4867); // Default
                }
            );
        } else {
            fetchBanks(17.3850, 78.4867);
        }
    }, []);

    const fetchBanks = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="bank"](around:5000,${lat},${lng});
                  way["amenity"="bank"](around:5000,${lat},${lng});
                );
                out center;
            `;

            let mappedBanks: StoreLocation[] = [];
            let success = false;

            try {
                const res = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: query
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.elements) {
                        mappedBanks = data.elements
                            .filter((el: any) => el.tags && el.tags.name)
                            .map((el: any) => ({
                                id: el.id,
                                lat: el.lat || el.center.lat,
                                lng: el.lon || el.center.lon,
                                name: el.tags.name,
                                type: "Bank",
                                items: ["KCC", "Crop Loan", "Gold Loan"], // Generic items
                                distance: calculateDistance(lat, lng, el.lat || el.center.lat, el.lon || el.center.lon)
                            }));
                        success = true;
                    }
                }
            } catch (apiError) {
                console.warn("Overpass API call failed, falling back to mock data", apiError);
            }

            if (!success || mappedBanks.length === 0) {
                // Fallback: Generate mock banks
                mappedBanks = [
                    { id: "mb1", lat: lat + 0.005, lng: lng + 0.005, name: "State Bank of India (Rural)", type: "Bank", items: ["KCC", "Crop Loan"], distance: calculateDistance(lat, lng, lat + 0.005, lng + 0.005) },
                    { id: "mb2", lat: lat - 0.004, lng: lng + 0.002, name: "Grameena Bank", type: "Bank", items: ["Tractor Loan", "Gold Loan"], distance: calculateDistance(lat, lng, lat - 0.004, lng + 0.002) },
                    { id: "mb3", lat: lat + 0.002, lng: lng - 0.006, name: "Cooperative Society Bank", type: "Bank", items: ["Fertilizer Loan", "Seeds"], distance: calculateDistance(lat, lng, lat + 0.002, lng - 0.006) },
                    { id: "mb4", lat: lat - 0.003, lng: lng - 0.003, name: "Union Bank of India", type: "Bank", items: ["Land Loan", "KCC"], distance: calculateDistance(lat, lng, lat - 0.003, lng - 0.003) }
                ];
            }

            // Sort by distance
            mappedBanks.sort((a, b) => (a.distance || 0) - (b.distance || 0));

            setBanks(mappedBanks);
        } catch (error) {
            console.error("Critical error in fetchBanks", error);
            setBanks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBankClick = (bank: StoreLocation) => {
        setIsApplicationOpen(false); // Reset
        setSelectedBank(bank);
        setViewCenter([bank.lat, bank.lng]);

        // Scroll to details (mobile friendly)
        const details = document.getElementById("bank-details");
        if (details) details.scrollIntoView({ behavior: "smooth" });
    };

    const handleApply = (plan: LoanPlan) => {
        setSelectedPlan(plan);
        setApplicationStep(1);
        setIsApplicationOpen(true);
    };



    const submitApplication = () => {
        // Simulate API call
        setTimeout(() => {
            const bookingId = `LN-${Math.floor(Math.random() * 10000)}`;
            addApplication({
                type: 'Loan',
                itemName: selectedPlan?.name || "Bank Loan",
                status: 'Pending',
                bookingId: bookingId,
                amount: "100000", // This would come from form state in real app
                duration: `${selectedPlan?.tenureMonths} Months`
            });
            setApplicationStep(2);
        }, 1500);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col relative">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Landmark className="h-8 w-8 text-indigo-600" />
                        {t("loans.title") || "Bank Loans"}
                    </h1>
                    <p className="text-muted-foreground">
                        Find nearby banks and apply for agricultural loans securely.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left: Map & List */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                    <Card className="flex-1 overflow-hidden border-2 border-indigo-100 shadow-md">
                        <div className="h-full w-full relative">
                            <Map stores={banks} center={viewCenter} />
                            {loading && (
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-[1000]">
                                    <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span>Searching for banks...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Horizontal Bank List (Scrollable) */}
                    <div className="h-32 shrink-0">
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {banks.map(bank => (
                                <Card
                                    key={bank.id}
                                    className={`min-w-[200px] cursor-pointer transition-all hover:border-indigo-400 group border-indigo-100 dark:border-indigo-900 ${selectedBank?.id === bank.id ? 'border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'}`}
                                    onClick={() => handleBankClick(bank)}
                                >
                                    <CardContent className="p-4 flex flex-col justify-between h-full">
                                        <div className={`font-semibold truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400 ${selectedBank?.id === bank.id ? 'text-indigo-800 dark:text-indigo-300' : ''}`} title={bank.name}>{bank.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Navigation className="h-3 w-3 text-indigo-500" />
                                            {bank.distance} km away
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {banks.length === 0 && !loading && (
                                <div className="text-muted-foreground text-sm p-4 w-full text-center border rounded-lg border-dashed">
                                    No banks found nearby. Try searching in a different area.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Bank Details & Plans */}
                <div className="lg:col-span-1 overflow-y-auto" id="bank-details">
                    {selectedBank ? (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-background">
                                <CardHeader>
                                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">{selectedBank.name}</CardTitle>
                                    <CardDescription>Verified Partner Bank</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 mb-4">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">KCC Available</span>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">Fast Approval</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        This bank offers special agricultural loan schemes with subsidized interest rates for local farmers.
                                    </p>
                                </CardContent>
                            </Card>

                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Available Schemes
                            </h3>

                            <div className="space-y-3">
                                {LOAN_PLANS.map(plan => (
                                    <Card key={plan.id} className="hover:shadow-lg transition-all group border-l-4 border-l-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-700">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold group-hover:text-indigo-600 transition-colors">{plan.name}</h4>
                                                    <span className="text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded font-medium border border-indigo-100 dark:border-indigo-800">{plan.type}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{plan.interestRate}%</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Interest / Year</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                                <span className="bg-secondary px-1.5 py-0.5 rounded text-xs">Max ₹{(plan.maxAmount / 100000).toFixed(1)}L</span>
                                                <span className="text-xs">•</span>
                                                <span className="bg-secondary px-1.5 py-0.5 rounded text-xs">{plan.tenureMonths} Months</span>
                                            </div>
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600" size="sm" onClick={() => handleApply(plan)}>
                                                Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 border rounded-lg bg-muted/20 border-dashed">
                            <div className="bg-indigo-100 p-4 rounded-full">
                                <Landmark className="h-8 w-8 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Select a Bank</h3>
                                <p className="text-muted-foreground text-sm max-w-[200px] mx-auto mt-1">
                                    Click on a bank marker on the map or select from the list to view loan offers.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => fetchBanks(userLocation[0], userLocation[1])}>
                                Refresh Nearby Banks
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal (Custom Implementation) */}
            {isApplicationOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        {applicationStep === 1 ? (
                            <>
                                <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold leading-none tracking-tight">Apply for {selectedPlan?.name}</h3>
                                        <button onClick={() => setIsApplicationOpen(false)} className="text-muted-foreground hover:text-foreground">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Application to {selectedBank?.name}
                                    </p>
                                </div>
                                <div className="p-6 pt-0 space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Required Documents</h4>
                                        <ul className="text-sm space-y-2 border p-3 rounded-md bg-muted/30">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Aadhar Card
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Land Pattadar Passbook
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Bank Passbook Copy
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                Passport Size Photo (Upload later)
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Loan Amount Required (₹)</Label>
                                        <Input type="number" defaultValue={100000} max={selectedPlan?.maxAmount} />
                                        <p className="text-xs text-muted-foreground">Max limit: ₹{selectedPlan?.maxAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Purpose</Label>
                                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                            <option value="crop">Crop Cultivation</option>
                                            <option value="machinery">Machinery Purchase</option>
                                            <option value="irrigation">Irrigation Setup</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center p-6 pt-0">
                                    <div className="flex w-full justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsApplicationOpen(false)}>Cancel</Button>
                                        <Button onClick={submitApplication}>Submit Application</Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-10 flex flex-col items-center text-center space-y-4 relative">
                                <button onClick={() => setIsApplicationOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 animate-in zoom-in spin-in-180 duration-500">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-green-600">Application Submitted!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your application ID is <span className="font-mono font-bold text-foreground">#LN-{Math.floor(Math.random() * 10000)}</span>.
                                    <br />
                                    The bank representative will contact you shortly.
                                </p>
                                <Button className="mt-4" onClick={() => setIsApplicationOpen(false)}>Done</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
