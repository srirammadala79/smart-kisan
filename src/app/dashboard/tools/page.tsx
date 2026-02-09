"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Zap, Truck, Settings, Hammer, Info, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarm } from "@/contexts/FarmContext";
import { tools } from "@/data/tools";

export default function ToolsPage() {
    const { t } = useLanguage();
    const { addApplication } = useFarm();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");

    const categories = ["All", "Heavy Machinery", "Smart Tech", "Tractors", "Attachments"];

    const filteredTools = tools.filter(tool =>
        (filter === "All" || tool.category === filter) &&
        (tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const [selectedTool, setSelectedTool] = useState<any>(null);
    const [rentalDuration, setRentalDuration] = useState(1);
    const [rentalDate, setRentalDate] = useState("");
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const handleViewDetails = (url: string) => {
        if (url) window.open(url, '_blank');
    };

    const handleRent = (tool: any) => {
        if (tool.rental === "N/A") return; // Cannot rent items without rental price
        setSelectedTool(tool);
        setRentalDuration(1);
        setRentalDate(new Date().toISOString().split('T')[0]);
        setBookingSuccess(false);
        setIsRentalModalOpen(true);
    };

    const handleBuy = (tool: any) => {
        setSelectedTool(tool);
        setBookingSuccess(false);
        setIsBuyModalOpen(true);
    };

    const confirmRental = () => {
        // Simulate API call
        setTimeout(() => {
            const bookingId = `RNT-${Math.floor(Math.random() * 10000)}`;
            addApplication({
                type: 'Rental',
                itemName: selectedTool?.name || "Tool Rental",
                status: 'Approved',
                bookingId: bookingId,
                amount: selectedTool?.rental,
                duration: `${rentalDuration} Days`
            });
            setBookingSuccess(true);
            setTimeout(() => {
                setIsRentalModalOpen(false);
                setBookingSuccess(false);
                setSelectedTool(null);
            }, 2000);
        }, 1000);
    };

    const confirmBuy = () => {
        // Simulate API call
        setTimeout(() => {
            const bookingId = `ADV-${Math.floor(Math.random() * 10000)}`;
            addApplication({
                type: 'Booking',
                itemName: selectedTool?.name || "Advance Booking",
                status: 'Pending',
                bookingId: bookingId,
                amount: "₹10,000" // Advance amount
            });
            setBookingSuccess(true);
            setTimeout(() => {
                setIsBuyModalOpen(false);
                setBookingSuccess(false);
                setSelectedTool(null);
            }, 3000);
        }, 1500);
    };

    const calculateCost = () => {
        if (!selectedTool) return 0;
        const rate = parseInt(selectedTool.rental.replace(/[^0-9]/g, ''));
        if (isNaN(rate)) return 0;
        return rate * rentalDuration;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("tools.title")}</h1>
                    <p className="text-muted-foreground">{t("tools.subtitle")}</p>
                </div>
                <Button className="gap-2">
                    <Truck className="h-4 w-4" /> {t("tools.request_rental")}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Input
                        placeholder={t("tools.search_placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <Wrench className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            {(() => {
                                const catLabelMap: Record<string, string> = {
                                    "All": "all",
                                    "Heavy Machinery": "machinery",
                                    "Smart Tech": "smart_tech",
                                    "Tractors": "tractors",
                                    "Attachments": "attachments"
                                };
                                return t(`tools.category.${catLabelMap[cat] || cat.toLowerCase()}` as any);
                            })()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {filteredTools.map((tool) => (
                    <Card key={tool.id} className="group relative overflow-hidden h-96 border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-xl cursor-default">
                        {/* Full Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${tool.image})` }}
                        />

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Top content (Badge & Price) */}
                        <div className="relative z-10 flex justify-between items-start p-6">
                            <span className="backdrop-blur-md bg-white/20 text-white border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                                {tool.category}
                            </span>
                            {tool.category === "Smart Tech" && <Zap className="h-6 w-6 text-yellow-400 drop-shadow-md animate-pulse" />}
                        </div>

                        {/* Bottom Content (Title, Desc, Actions) */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                            <div className="mt-auto transform transition-transform duration-300 group-hover:-translate-y-2">
                                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{tool.name}</h3>
                                <p className="text-gray-200 text-sm line-clamp-2 mb-4 group-hover:text-white transition-colors">{tool.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-white/90 text-sm border-t border-white/20 pt-4">
                                    <div>
                                        <p className="text-xs uppercase text-gray-400 font-semibold">{t("tools.buy")}</p>
                                        <p className="font-bold text-lg">{tool.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase text-gray-400 font-semibold">{t("tools.rental")}</p>
                                        <p className="font-bold text-primary-foreground">{tool.rental}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions - Slide up on hover */}
                            <div className="space-y-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <Button
                                    variant="outline"
                                    className="w-full bg-white/20 hover:bg-white/40 text-black border-white/40 backdrop-blur-md"
                                    onClick={() => handleViewDetails(tool.url)}
                                >
                                    {t("tools.view_details")}
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="secondary"
                                        className="w-full bg-white/90 hover:bg-white text-black font-semibold"
                                        onClick={() => handleBuy(tool)}
                                    >
                                        {t("tools.buy")}
                                    </Button>
                                    <Button
                                        className="w-full font-semibold shadow-lg"
                                        onClick={() => handleRent(tool)}
                                        disabled={tool.rental === "N/A"}
                                    >
                                        {tool.rental === "N/A" ? "Buy Only" : t("tools.rent_now")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Rental Application Modal */}
            {isRentalModalOpen && selectedTool && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-xl shadow-2xl max-w-md w-full overflow-hidden border animate-in zoom-in-95 duration-200">
                        <div className="p-6 space-y-4">
                            {!bookingSuccess ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold">Rental Application</h2>
                                            <p className="text-sm text-muted-foreground">Complete details to rent this equipment.</p>
                                        </div>
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                            {selectedTool.rental}
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg flex gap-4 items-center">
                                        <div className="h-16 w-16 bg-cover bg-center rounded-md shrink-0" style={{ backgroundImage: `url(${selectedTool.image})` }} />
                                        <div>
                                            <h3 className="font-semibold">{selectedTool.name}</h3>
                                            <p className="text-xs text-muted-foreground">{selectedTool.category}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">Start Date</label>
                                            <Input
                                                type="date"
                                                value={rentalDate}
                                                onChange={(e) => setRentalDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">Duration (Hours/Acres based on rate)</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={rentalDuration}
                                                onChange={(e) => setRentalDuration(parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Rate</span>
                                            <span>{selectedTool.rental}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Estimated Cost</span>
                                            <span>₹{calculateCost().toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsRentalModalOpen(false)}>Cancel</Button>
                                        <Button className="flex-1" onClick={confirmRental}>Confirm Booking</Button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-8 text-center space-y-4">
                                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Truck className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-700">Booking Confirmed!</h3>
                                    <p className="text-muted-foreground">
                                        Your request for <strong>{selectedTool.name}</strong> has been sent to the provider.
                                        Booking ID: <span className="font-mono text-foreground">#RT-{Math.floor(Math.random() * 10000)}</span>
                                    </p>
                                    <Button className="w-full mt-4" onClick={() => setIsRentalModalOpen(false)}>Close</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Advance Booking / Buy Modal */}
            {isBuyModalOpen && selectedTool && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-xl shadow-2xl max-w-md w-full overflow-hidden border animate-in zoom-in-95 duration-200">
                        <div className="p-6 space-y-4">
                            {!bookingSuccess ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold">Showroom Advance Booking</h2>
                                            <p className="text-sm text-muted-foreground">Submit required documents to book this item.</p>
                                        </div>
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                            ADVANCE
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg flex gap-4 items-center">
                                        <div className="h-16 w-16 bg-cover bg-center rounded-md shrink-0" style={{ backgroundImage: `url(${selectedTool.image})` }} />
                                        <div>
                                            <h3 className="font-semibold">{selectedTool.name}</h3>
                                            <p className="text-xs text-muted-foreground">{selectedTool.category}</p>
                                            <p className="font-bold text-sm mt-1">{selectedTool.price}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-sm font-medium text-foreground">Required Documents</div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {['Aadhar Card', 'Pan Card', 'Land Record (Pattadar)'].map((doc) => (
                                                <div key={doc} className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                                                    <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                    </div>
                                                    <span className="text-sm flex-1">{doc}</span>
                                                    <Button variant="ghost" size="sm" className="h-6 text-xs">Upload</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="flex gap-2">
                                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>This is an advance booking application. The showroom will contact you for verification and payment.</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsBuyModalOpen(false)}>Cancel</Button>
                                        <Button className="flex-1" onClick={confirmBuy}>Submit Application</Button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-8 text-center space-y-4">
                                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-700">Application Submitted!</h3>
                                    <p className="text-muted-foreground">
                                        Your advance booking request for <strong>{selectedTool.name}</strong> has been received by the showroom.
                                        Application ID: <span className="font-mono text-foreground">#BK-{Math.floor(Math.random() * 10000)}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">You will receive a call within 24 hours.</p>
                                    <Button className="w-full mt-4" onClick={() => setIsBuyModalOpen(false)}>Close</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

