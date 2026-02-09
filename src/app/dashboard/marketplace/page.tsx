"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search, MapPin, Navigation } from "lucide-react";
import { StoreLocation, OverpassElement } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateDistance } from "@/utils/distance";

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-secondary animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

// Store templates for random generation
const generateMockStores = (lat: number, lng: number): any[] => {
    const templates = [
        { name: "Kisan Seva Kendra", type: "Fertilizer", items: ["Urea", "DAP", "Pesticides"] },
        { name: "Agri-Tech Solutions", type: "Technology", items: ["Drones", "Soil Sensors"] },
        { name: "Modern Farm Machinery", type: "Machinery", items: ["Tractors", "Harvesters"] },
        { name: "Sri Laxmi Seeds", type: "Seeds", items: ["Rice Seeds", "Cotton Seeds"] },
        { name: "Green Garden Nursery", type: "Seeds", items: ["Saplings", "Floral Seeds"] },
        { name: "Pashu Chikitsalaya", type: "Veterinary", items: ["Vaccines", "Cattle Feed"] },
        { name: "Village Hardware & Tools", type: "Tools", items: ["Spades", "Pumps", "Pipes"] },
        { name: "Haritha Fertilizers", type: "Fertilizer", items: ["Organic Manure", "Potash"] },
        { name: "Rythu Support Center", type: "Help Center", items: ["Advisory", "Soil Test"] }
    ];

    return templates.map((t, i) => {
        const offset = 0.04; // Spread within ~4-5km
        const mLat = lat + (Math.random() - 0.5) * offset;
        const mLng = lng + (Math.random() - 0.5) * offset;
        return {
            id: `mock-${i}`,
            name: t.name,
            lat: mLat,
            lng: mLng,
            type: t.type,
            types: [t.type],
            items: t.items,
            distance: calculateDistance(lat, lng, mLat, mLng)
        };
    }).sort((a, b) => a.distance - b.distance);
};


export default function MarketplacePage() {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // userLocation tracks actual GPS; viewCenter tracks where map is looking
    const [userLocation, setUserLocation] = useState<[number, number]>([17.3850, 78.4867]);
    const [viewCenter, setViewCenter] = useState<[number, number]>([17.3850, 78.4867]);
    const [locationStatus, setLocationStatus] = useState("default");

    // Dynamic stores based on location
    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        if (navigator.geolocation) {
            setLocationStatus("loading");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);
                    setViewCenter([lat, lng]); // Auto-center on user initially
                    setLocationStatus("success");

                    // Fetch real stores
                    fetchRealStores(lat, lng);
                },
                (error) => {
                    console.warn("Location access denied or unavailable in marketplace.", error.message);
                    setLocationStatus("error");
                    // Fallback to default (Hyderabad)
                    // No default stores generated. User must enable location or search manually if we add that feature.
                    // For now, we will fallback to fetching for the default viewCenter roughly
                    fetchRealStores(17.3850, 78.4867); // Fetch real stores for default location (Hyderabad)
                }
            );
        } else {
            console.warn("Geolocation not supported.");
            setLocationStatus("error");
            fetchRealStores(17.3850, 78.4867); // Fetch real stores for default location
        }
    }, []);

    const fetchRealStores = async (lat: number, lng: number) => {
        try {
            // Optimized Query - Split radius to prevent 504 Timeout
            // Nodes (Points) -> 50km (Fast)
            // Ways (Buildings) -> 20km (Slow, heavy on DB)
            // Relations -> Removed (Rare for shops, causes timeouts)
            const getQuery = (radius: number, wayRadius: number) => `
            [out:json][timeout:25];
            (
              // Specific Agricultural Shops
              node["shop"~"agrarian_supplies|farm|garden_centre|florist|hardware|trade|agricultural_machinery|electronics"](around:${radius},${lat},${lng});
              way["shop"~"agrarian_supplies|farm|garden_centre|florist|hardware|trade|agricultural_machinery|electronics"](around:${wayRadius},${lat},${lng});

              // Markets
              node["amenity"~"marketplace|veterinary"](around:${radius},${lat},${lng});
              
              // Help Centers (Government/NGO/Company Offices/Co-ops)
              node["office"~"government|ngo|association|company|cooperative"](around:${radius},${lat},${lng});

              // Potential Generic Stores / Village Shops
              node["shop"~"general|country_store|department_store|rice|motorcycle|convenience|supermarket|car"](around:${radius},${lat},${lng});
              node["man_made"~"silo|works"](around:${radius},${lat},${lng});
              node["craft"~"blacksmith|welder|agricultural_engines"](around:${radius},${lat},${lng});
            );
            out center;
        `;

            // Attempt 1: Full 50km Radius (Nodes) / 20km (Ways)
            let response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: getQuery(50000, 20000)
            });

            // Fallback: If 50km fails/timeouts, try 25km
            if (!response.ok || response.status === 504 || response.status === 429) {
                console.warn("Overpass 50km query failed, retrying with 25km...");
                response = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: getQuery(25000, 10000)
                });
            }

            if (!response.ok) {
                console.warn(`Overpass API failed (${response.status}). Using local patterns.`);
                setStores(generateMockStores(lat, lng));
                setLocationStatus("success");
                return;
            }

            const text = await response.text();
            if (text.trim().startsWith("<")) {
                console.warn("Overpass API returned HTML. Falling back to local patterns.");
                setStores(generateMockStores(lat, lng));
                setLocationStatus("success");
                return;
            }

            const data = JSON.parse(text);

            if (data.elements && data.elements.length > 0) {
                // Key terms that signal agricultural relevance
                const agriKeywords = [
                    "agro", "agri", "fertilizer", "seed", "pesticide", "insecticide", "kisan", "krishi",
                    "farm", "bhandar", "kendra", "co-operative", "samiti", "biotech", "nursery",
                    "tools", "machinery", "pump", "pipe", "sprayer", "tractor", "irrigation", "drone", "solar",
                    "feed", "veterinary", "livestock", "rice", "mill", "ginning", "sugar", "cane", "cotton",
                    "society", "pacs", "markfed", "iffco", "coromandel", "bayer", "syngenta", "mahone",
                    "welder", "blacksmith", "repair", "motor", "engine", "spares",
                    "poultry", "aqua", "fish", "dairy", "milk", "cattle",
                    "nutrac", "organics", "bio", "crop", "protection", "agrichem"
                ];

                // Terms to explicitly exclude
                const excludeKeywords = ["passport", "police", "tax", "transport", "rto", "housing", "marble", "tile", "paint", "glass", "plywood", "function hall", "banquet", "marriage", "mobile", "computer", "laptop", "software", "marketing", "consultancy", "real estate", "construction", "bakery", "restaurant", "showroom", "auto"];

                const realStores = data.elements
                    .filter((el: any) => {
                        if (!el.tags || !el.tags.name) return false;
                        const name = el.tags.name.toLowerCase();
                        const type = el.tags.shop || el.tags.office || el.tags.amenity;

                        // 1. Explicit Exclusions
                        // Special check: keep electronics if they mention drones/solar explicitly
                        if (type === "electronics" && (name.includes("drone") || name.includes("solar") || name.includes("agri"))) {
                            // Keep valid electronics
                        } else if (type === "motorcycle" && (name.includes("motor") || name.includes("pump") || name.includes("spares"))) {
                            // Keep mechanic/spare shops
                        } else if (excludeKeywords.some(k => name.includes(k))) {
                            return false;
                        }

                        // 2. Strict Filter Logic

                        // Always keep core agricultural types
                        if (type === "agrarian_supplies" || type === "farm" || type === "agricultural_machinery" || type === "veterinary") return true;

                        // Keep markets
                        if (type === "marketplace") return true;

                        // Garden centers/Florists
                        if (type === "garden_centre" || type === "florist") return true;

                        // For Government/NGO/Help Centers/Company Offices
                        if (type === "government" || type === "ngo" || type === "association" || type === "company" || type === "cooperative" || el.tags.office) {
                            if (agriKeywords.some(k => name.includes(k))) return true;
                            return false;
                        }

                        // For Hardware/General/Trade/Electronics/Rice/Man_made - MUST have agri keywords
                        if (type === "hardware" || type === "general" || type === "trade" || type === "country_store" || type === "electronics" || type === "rice" || type === "works" || type === "silo" || type === "blacksmith" || type === "welder" || type === "motorcycle") {
                            if (agriKeywords.some(k => name.includes(k)) || name.includes("drone") || name.includes("traders") || name.includes("agencies")) return true;
                            return false;
                        }

                        return false;
                    })

                    .map((el: OverpassElement) => ({
                        id: el.id,
                        name: el.tags.name || "Unknown Store",
                        lat: el.lat || el.center?.lat || 0,
                        lng: el.lon || el.center?.lon || 0,
                        types: mapShopTypes(el.tags), // Return array
                        type: mapShopTypes(el.tags)[0] || "General", // Primary for display/icon
                        items: mapShopItems(el.tags),
                        distance: calculateDistance(lat, lng, el.lat || el.center?.lat || 0, el.lon || el.center?.lon || 0)
                    }))
                    .filter((store: StoreLocation) => store.lat !== 0 && store.lng !== 0);

                // Sort by distance
                realStores.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));

                // Categorize stores by their mapped types (One store can be in multiple)
                const categorizedStores: { [key: string]: StoreLocation[] } = {};
                realStores.forEach((store: StoreLocation) => {
                    store.types?.forEach((t: string) => {
                        if (!categorizedStores[t]) categorizedStores[t] = [];
                        categorizedStores[t].push(store);
                    });
                });

                let limitedStores: StoreLocation[] = [];
                // We want to ensure at least 3 per category if possible
                const allCats = new Set<string>();
                realStores.forEach((s: StoreLocation) => s.types?.forEach((t: string) => allCats.add(t)));

                // Add all distinct stores first to avoid duplicates in the main list
                // The filtering happens in UI.
                limitedStores = realStores;

                setStores(limitedStores);
            } else {
                console.log("No real stores found in this area.");
                setStores([]);
            }
        } catch (err) {
            console.warn("Marketplace fetch caught error. Using fallback.", err);
            setStores(generateMockStores(lat, lng));
            setLocationStatus("success");
        }
    };

    const mapShopTypes = (tags: any) => {
        const type = tags.shop || tags.office || tags.amenity || tags.man_made || tags.craft;
        const name = tags.name ? tags.name.toLowerCase() : "";
        const categories = new Set<string>();

        // 1. Livestock & Veterinary
        if (type === "veterinary" || name.includes("doctor") || name.includes("clinic") || name.includes("animal")) categories.add("Veterinary");
        if (name.includes("feed") || name.includes("fodder") || name.includes("cattle")) categories.add("Animal Feed");
        if (name.includes("dairy") || name.includes("milk") || name.includes("chilling") || name.includes("creamery")) categories.add("Dairy");
        if (name.includes("poultry") || name.includes("chicken") || name.includes("egg") || name.includes("broiler") || name.includes("hatchery")) categories.add("Poultry");
        if (name.includes("aqua") || name.includes("fish") || name.includes("prawn") || name.includes("seafood")) categories.add("Aqua");

        // 2. Machinery & Tech
        if (name.includes("drone") || name.includes("tech") || name.includes("smart") || name.includes("solar") || type === "electronics") categories.add("Technology");
        if (name.includes("pump") || name.includes("pipe") || name.includes("sprinkler") || name.includes("drip") || name.includes("irrigation") || name.includes("borewell") || name.includes("motor")) categories.add("Irrigation");
        if (type === "agricultural_machinery" || type === "car" || name.includes("tractor") || name.includes("harvester") || name.includes("rotavator") || name.includes("cultivator") || name.includes("spares") || name.includes("engine") || name.includes("machinery")) categories.add("Machinery");

        // 3. Tools
        // Strict check: only include if explicitly mentioned in name or type.
        if (type === "hardware" || type === "trade" || name.includes("tools") || name.includes("engineering") || type === "blacksmith" || type === "welder" || name.includes("iron") || name.includes("steel") || name.includes("machinery") || name.includes("spares")) categories.add("Tools");

        // 4. Inputs
        // Most generic agro stores sell all three inputs, so we infer them unless specific.
        const isGenericAgro = type === "agrarian_supplies" || name.includes("agro") || name.includes("agri") || name.includes("agencies") || name.includes("traders") || name.includes("enterprises") || name.includes("kendra") || name.includes("bhandar");

        if (name.includes("pesticide") || name.includes("insecticide") || name.includes("pest") || name.includes("protection") || name.includes("agrichem") || name.includes("bio") || isGenericAgro) categories.add("Pesticides");
        if (name.includes("fertilizer") || name.includes("urea") || name.includes("compost") || name.includes("chemicals") || isGenericAgro) categories.add("Fertilizer");
        if (type === "farm" || type === "garden_centre" || type === "florist" || name.includes("seed") || name.includes("nursery") || name.includes("plant") || name.includes("cotton") || isGenericAgro) categories.add("Seeds");

        // 5. Services
        if (tags.office === "government" || tags.office === "ngo" || tags.office === "cooperative" || name.includes("samiti") || name.includes("help") || name.includes("support") || name.includes("society") || name.includes("pacs") || name.includes("markfed")) categories.add("Help Center");
        if (type === "marketplace" || name.includes("mandi") || name.includes("market") || name.includes("bazaar") || name.includes("yard")) categories.add("Markets");
        if (type === "rice" || name.includes("rice") || name.includes("mill") || name.includes("ginning") || name.includes("sugar") || name.includes("factory") || name.includes("works") || type === "silo") categories.add("Processing");

        // Fallback for empty
        if (categories.size === 0) categories.add("General");

        return Array.from(categories);
    };
    const mapShopItems = (tags: any) => {
        const type = tags.shop || tags.office || tags.amenity || tags.craft;
        const name = tags.name ? tags.name.toLowerCase() : "";

        if (name.includes("drone")) return ["Spraying Drones", "Mapping Drones"];
        if (name.includes("solar")) return ["Solar Pumps", "Panels"];
        if (name.includes("pesticide")) return ["Chemical Pesticides", "Organic Repellents"];

        if (name.includes("rice") || name.includes("mill") || name.includes("ginning")) return ["Processing", "Buying", "Selling"];

        if (type === "office") return ["Government Schemes", "Advisory", "Support"];
        if (type === "veterinary") return ["Animal Health", "Medicine", "Vaccines"];
        if (type === "agrarian_supplies" || name.includes("agro") || name.includes("fertilizer")) return ["Fertilizers", "Pesticides", "Seeds"];
        if (type === "agricultural_machinery" || type === "blacksmith" || type === "welder") return ["Plows", "Repairs", "Tools"];
        if (type === "car" || name.includes("tractor")) return ["Tractors", "Harvesters", "Spares"];
        if (type === "farm") return ["Seeds", "Saplings", "Manure"];
        if (type === "garden_centre" || type === "florist") return ["Vegetable Seeds", "Flower Seeds", "Pots"];
        if (type === "hardware" || name.includes("motor")) return ["Spades", "Pumps", "Pipes", "Sprayers"];
        if (type === "marketplace") return ["Fresh Produce", "Local Tools", "Seeds"];

        return ["General Farm Supplies"];
    };

    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            // Safety check for stale or malformed store objects
            if (!store || !store.types || !Array.isArray(store.types)) return false;

            const matchesSearch = store.name.toLowerCase().includes(search.toLowerCase()) ||
                (Array.isArray(store.items) && store.items.some((item: string) => item.toLowerCase().includes(search.toLowerCase())));

            const matchesCategory = selectedCategory === "All" || store.types.includes(selectedCategory);

            return matchesSearch && matchesCategory;
        }).map(store => {
            // If a specific category is selected, force the icon to match that category
            // This solves "Fertilizer shop showing as Fertilizer even when searching for Seeds"
            if (selectedCategory !== "All" && store.types && store.types.includes(selectedCategory)) {
                return { ...store, type: selectedCategory };
            }
            return store;
        });
    }, [stores, search, selectedCategory]);

    const categoryGroups = {
        "Inputs": ["Fertilizer", "Seeds", "Pesticides"],
        "Equipment": ["Machinery", "Tools", "Irrigation", "Technology"],
        "Livestock": ["Veterinary", "Animal Feed", "Dairy", "Poultry"],
        "Services": ["Markets", "Processing", "Help Center"]
    };

    const allCategories = ["All", ...Object.values(categoryGroups).flat()];

    const handleValidStoreClick = (lat: number, lng: number) => {
        setViewCenter([lat, lng]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] gap-6 p-4 rounded-xl relative overflow-hidden">
            {/* Farmer Theme Background Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-emerald-950/20"
            />

            <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t("marketplace.title")}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        {t("marketplace.search")}
                        {locationStatus === "success" && <span className="text-green-600 text-xs flex items-center gap-1"><Navigation className="w-3 h-3" /> Using your location</span>}
                    </p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("marketplace.search")}
                            className="pl-8 bg-background/80 backdrop-blur-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-2 pb-2">
                <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("All")}
                    className="self-start mb-2"
                >
                    {t("marketplace.show_all")}
                </Button>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(categoryGroups).map(([group, items]) => (
                        <div key={group} className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground px-1">{t(`marketplace.category.${group.toLowerCase()}` as any)}</span>
                            <div className="flex flex-wrap gap-1">
                                {items.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`h-7 text-xs ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-background/40 hover:bg-background/60"}`}
                                    >
                                        {t(`marketplace.subcategory.${cat.toLowerCase().replace(" ", "_")}` as any)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <Card className="lg:col-span-1 overflow-y-auto bg-white/80 dark:bg-black/40 backdrop-blur-md border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-b border-emerald-100 dark:border-emerald-800">
                        <CardTitle className="text-emerald-800 dark:text-emerald-300">{t("marketplace.nearby_stores")} ({filteredStores.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {filteredStores.map(store => (
                            <div
                                key={store.id}
                                onClick={() => handleValidStoreClick(store.lat, store.lng)}
                                className="flex gap-3 items-start p-3 rounded-lg border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 cursor-pointer transition-all active:scale-95 group"
                            >
                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start w-full">
                                        <h4 className="font-semibold text-foreground truncate pr-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{store.name}</h4>
                                        {store.distance !== undefined && (
                                            <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap border border-emerald-100 dark:border-emerald-900">
                                                {store.distance} km
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1.5">{t(`marketplace.subcategory.${store.type.toLowerCase().replace(" ", "_")}` as any) || store.type}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {store.items.slice(0, 3).map((item: string) => (
                                            <span key={item} className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded text-secondary-foreground border border-black/5">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredStores.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No stores found matching your search.</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 overflow-hidden h-[500px] lg:h-auto border-2 border-primary/20 shadow-xl">
                    <div className="h-full w-full">
                        <Map stores={filteredStores} center={viewCenter} />
                    </div>
                </Card>
            </div>
        </div>
    );
}
