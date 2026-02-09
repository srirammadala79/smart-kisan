"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudSun, Wind, Droplets, MapPin, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { WeatherData } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WeatherPage() {
    const { t } = useLanguage();
    const [city, setCity] = useState(t("weather.loading"));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Location denied or unavailable in weather page", error.message);
                    // Fallback to default (Hyderabad)
                    fetchWeather(17.3850, 78.4867);
                }
            );
        } else {
            fetchWeather(17.3850, 78.4867);
        }
    }, []);

    const fetchWeather = async (lat: number, lng: number, locationName?: string) => {
        setLoading(true);
        setError(null);
        try {
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                throw new Error("Invalid coordinates provided");
            }

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&relative_humidity_2m=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Weather API returned status: ${res.status}`);
            }

            const data = await res.json();

            // Map the data
            const current = data.current_weather;
            const daily = data.daily;

            // Simple WMO code mapping
            const conditionMap: { [key: number]: string } = {
                0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
                45: "Fog", 48: "Depositing Rime Fog",
                51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
                61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
                80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
                95: "Thunderstorm"
            };

            const forecast = daily.time.map((date: string, i: number) => ({
                day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2)
            })).slice(0, 5);

            setWeatherData({
                city: locationName || `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`,
                temp: Math.round(current.temperature),
                condition: conditionMap[current.weathercode] || "Variable",
                humidity: 60,
                wind: Math.round(current.windspeed),
                forecast: forecast
            });
            setCity(locationName || `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
        } catch (err: any) {
            console.error("Weather fetch error:", err);
            setError(err.message || "Failed to fetch weather data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            if (!res.ok) throw new Error("Geocoding failed");
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name, country } = data.results[0];
                await fetchWeather(latitude, longitude, `${name}, ${country}`);
            } else {
                setError(t("weather.error") || "City not found");
                setLoading(false);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            setError("Error searching for city.");
            setLoading(false);
        }
    };

    const handleUseMyLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude, t("weather.current"));
                },
                (error) => {
                    console.warn("Location access denied or unavailable. Using default.", error.message);
                    // Fallback to default (Hyderabad)
                    fetchWeather(17.3850, 78.4867);
                }
            );
        } else {
            fetchWeather(17.3850, 78.4867);
        }

    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse">{t("weather.loading")}</div>;
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                        <p>{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchWeather(17.3850, 78.4867)}
                            className="w-fit"
                        >
                            Retry Default Location
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!weatherData) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t("weather.title")}</h1>
                    <p className="text-sm text-muted-foreground">{weatherData.city}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <Input
                            placeholder={t("weather.search_city")}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full md:w-64"
                        />
                        <Button type="submit" disabled={loading}>
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>
                    <Button variant="outline" onClick={handleUseMyLocation} disabled={loading} title={t("weather.use_location")}>
                        <MapPin className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Weather Card */}
                <Card className="bg-gradient-to-br from-blue-400/20 to-cyan-300/20 border-blue-400/30 shadow-lg text-card-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            {t("weather.current")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CloudSun className="w-16 h-16 text-yellow-500" />
                                <div>
                                    <div className="text-5xl font-bold">{weatherData.temp}°C</div>
                                    <div className="text-xl text-muted-foreground">{weatherData.condition}</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50">
                                <Droplets className="w-6 h-6 text-blue-400" />
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("weather.humidity")}</div>
                                    <div className="font-bold">{weatherData.humidity}%</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50">
                                <Wind className="w-6 h-6 text-slate-400" />
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("weather.wind")}</div>
                                    <div className="font-bold">{weatherData.wind} km/h</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Forecast List */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("weather.forecast_5day")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {weatherData.forecast.map((day: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                                    <span className="font-medium">{day.day}</span>
                                    <div className="flex items-center gap-4">
                                        <CloudSun className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-bold">{day.temp}°C</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
