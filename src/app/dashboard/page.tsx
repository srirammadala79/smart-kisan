"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CloudSun, TrendingUp, Sprout, AlertCircle, Plus, ClipboardList, Trash2, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { INITIAL_CROPS } from "./market/page";
import { useFarm } from "@/contexts/FarmContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const userName = user?.name || "Farmer";

    // Notebook Context
    const { entries, addEntry, deleteEntry } = useFarm();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCrop, setNewCrop] = useState("");
    const [newActivity, setNewActivity] = useState("");
    const [newDate, setNewDate] = useState("");

    const [weather, setWeather] = useState<{ temp: number, condition: string, city: string } | null>(null);

    // Get top 5 crops for the chart
    const cropData = INITIAL_CROPS.slice(0, 5).map(c => ({
        name: c.name,
        price: c.price,
        fill: c.trend === 'up' ? '#22c55e' : c.trend === 'down' ? '#ef4444' : '#eab308'
    }));

    useEffect(() => {
        const fetchWeatherData = async (latitude: number, longitude: number, fallbackCity?: string) => {
            try {
                // 1. Fetch Weather
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&weathercode=true`);
                const weatherData = await weatherRes.json();
                const current = weatherData.current_weather;

                // 2. Fetch City Name (Reverse Geocoding)
                let cityName = fallbackCity || "Your Location";
                if (!fallbackCity) {
                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, { headers: { 'User-Agent': 'FarmerApp/1.0' } });
                        const geoData = await geoRes.json();
                        cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || "Unknown Location";
                    } catch (geoErr) {
                        console.error("Geocoding failed", geoErr);
                        cityName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                    }
                }

                // Basic Condition Map
                const wmo: Record<number, string> = { 0: "Clear", 1: "Mainly Clear", 2: "Cloudy", 3: "Overcast", 45: "Fog", 61: "Rain", 63: "Rain", 80: "Showers", 95: "Storm" };

                setWeather({
                    temp: Math.round(current.temperature),
                    condition: wmo[current.weathercode] || "Variable",
                    city: cityName
                });
            } catch (e) {
                console.warn("Dashboard weather fetch failed, using fallback", e);
                // Fallback weather data
                setWeather({
                    temp: 28,
                    condition: "Mainly Clear",
                    city: fallbackCity || "Miyapur"
                });
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(latitude, longitude);
                },
                (err) => {
                    console.warn("Location access denied or unavailable. Using default location.", err.message);
                    // Default to Hyderabad
                    fetchWeatherData(17.3850, 78.4867, "Hyderabad (Default)");
                }
            );
        } else {
            fetchWeatherData(17.3850, 78.4867, "Hyderabad (Default)");
        }
    }, []);

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCrop && newActivity && newDate) {
            addEntry({
                cropName: newCrop,
                activity: newActivity,
                date: newDate,
                notes: ""
            });
            setIsAddOpen(false);
            setNewCrop("");
            setNewActivity("");
            setNewDate("");
        }
    };

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t("dashboard.welcome")}{userName}</h2>
                <p className="text-muted-foreground">
                    {t("dashboard.subtitle")}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-orange-100 to-amber-100 border-orange-200 dark:from-orange-950/40 dark:to-amber-950/40 dark:border-orange-800/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("dashboard.weather")}</CardTitle>
                        <CloudSun className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        {weather ? (
                            <>
                                <div className="text-2xl font-bold text-orange-950 dark:text-orange-50">{weather.temp}°C</div>
                                <p className="text-xs text-orange-800/80 dark:text-orange-200/80">
                                    {weather.condition} • {weather.city}
                                </p>
                            </>
                        ) : (
                            <div className="animate-pulse">
                                <div className="h-8 w-16 bg-black/10 rounded mb-1"></div>
                                <p className="text-xs text-muted-foreground">Loading specific location...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-200 dark:from-emerald-950/40 dark:to-green-950/40 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("dashboard.market")}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">Rice ↑ 5%</div>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
                            +₹120 since yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("dashboard.upcoming")}</CardTitle>
                        <Sprout className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            // Find nearest future entry
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const upcoming = entries
                                .filter(e => new Date(e.date) >= today)
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                            if (upcoming) {
                                const daysLeft = Math.ceil((new Date(upcoming.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <>
                                        <div className="text-2xl font-bold text-blue-950 dark:text-blue-50">{daysLeft === 0 ? "Today" : `${daysLeft} Days`}</div>
                                        <p className="text-xs text-blue-800/80 dark:text-blue-200/80 truncate" title={`${upcoming.activity} - ${upcoming.cropName}`}>
                                            {upcoming.activity}: {upcoming.cropName}
                                        </p>
                                    </>
                                );
                            }
                            return (
                                <>
                                    <div className="text-2xl font-bold text-blue-950 dark:text-blue-50">No Events</div>
                                    <p className="text-xs text-blue-800/80 dark:text-blue-200/80">
                                        Add task in notebook
                                    </p>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-rose-100 to-red-100 border-rose-200 dark:from-rose-950/40 dark:to-red-950/40 dark:border-rose-800/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("dashboard.alerts")}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-950 dark:text-rose-50">2 Warnings</div>
                        <p className="text-xs text-rose-800/80 dark:text-rose-200/80">
                            Heavy rain expected tomorrow
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 dark:from-slate-900/50 dark:to-slate-800/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t("dashboard.crop_prices")}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cropData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                                        {cropData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* FARM NOTEBOOK / REMINDERS WIDGET (Replaces 'Recent Activity') */}
                <Card className="col-span-3 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100 dark:from-teal-950/20 dark:to-cyan-950/20 dark:border-teal-800/30 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-teal-600" />
                            <CardTitle>{t("dashboard.notebook")}</CardTitle>
                        </div>
                        <Button size="sm" variant={isAddOpen ? "ghost" : "outline"} className="gap-1 h-8" onClick={() => setIsAddOpen(!isAddOpen)}>
                            {isAddOpen ? <X className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> Add</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isAddOpen && (
                            <form onSubmit={handleAddEntry} className="space-y-4 mb-4 p-4 border rounded-lg bg-white/50 dark:bg-black/20 animate-in slide-in-from-top-2 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <Label>Crop Name</Label>
                                    <Input placeholder="e.g. Rice Field 1" value={newCrop} onChange={e => setNewCrop(e.target.value)} required className="bg-white/80 dark:bg-black/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Activity / Reminder</Label>
                                    <Input placeholder="e.g. Sowing, Fertilizer, Harvest" value={newActivity} onChange={e => setNewActivity(e.target.value)} required className="bg-white/80 dark:bg-black/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required className="bg-white/80 dark:bg-black/40" />
                                </div>
                                <Button type="submit" className="w-full">Save Entry</Button>
                            </form>
                        )}
                        {sortedEntries.length > 0 ? (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {sortedEntries.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-colors group backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 rounded-md shrink-0">
                                                <span className="text-[10px] font-bold uppercase">{new Date(entry.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-sm font-bold">{new Date(entry.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm leading-none mb-1">{entry.cropName}</h4>
                                                <p className="text-xs text-muted-foreground">{entry.activity}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteEntry(entry.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isAddOpen && (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 border-2 border-dashed rounded-lg bg-white/20 dark:bg-black/10">
                                    <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">Your notebook is empty.</p>
                                    <Button variant="link" size="sm" onClick={() => setIsAddOpen(true)} className="text-teal-600">
                                        + Add your first entry
                                    </Button>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
