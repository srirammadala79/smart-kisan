// using global fetch for Node 18+

async function verifyStores() {
    const lat = 17.3850;
    const lng = 78.4867;

    console.log(`Searching for AGRICULTURAL stores around ${lat}, ${lng} with 50km radius...`);

    const query = `
        [out:json][timeout:90];
        (
          // Specific Agricultural Shops
          node["shop"~"agrarian_supplies|farm|garden_centre|florist|hardware|trade|agricultural_machinery|electronics"](around:50000,${lat},${lng});
          way["shop"~"agrarian_supplies|farm|garden_centre|florist|hardware|trade|agricultural_machinery|electronics"](around:50000,${lat},${lng});
          relation["shop"~"agrarian_supplies|farm|garden_centre|florist|hardware|trade|agricultural_machinery|electronics"](around:50000,${lat},${lng});

          // Markets
          node["amenity"~"marketplace|veterinary"](around:50000,${lat},${lng});
          
          // Help Centers (Government/NGO/Company Offices/Co-ops)
          node["office"~"government|ngo|association|company|cooperative"](around:50000,${lat},${lng});

          // Potential Generic Stores / Village Shops
          node["shop"~"general|country_store|department_store|rice|motorcycle|convenience|supermarket|car"](around:50000,${lat},${lng});
          node["man_made"~"silo|works"](around:50000,${lat},${lng}); // Sometimes mills/silos
          node["craft"~"blacksmith|welder|agricultural_engines"](around:50000,${lat},${lng});
        );
        out center;
    `;

    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        const data = JSON.parse(text);
        console.log(`Raw Elements Found: ${data.elements.length}`);

        const agriKeywords = [
            "agro", "agri", "fertilizer", "seed", "pesticide", "insecticide", "kisan", "krishi",
            "farm", "bhandar", "kendra", "co-operative", "samiti", "biotech", "nursery",
            "tools", "machinery", "pump", "pipe", "sprayer", "tractor", "irrigation", "drone", "solar",
            "feed", "veterinary", "livestock", "rice", "mill", "ginning", "sugar", "cane", "cotton",
            "society", "pacs", "markfed", "iffco", "coromandel", "bayer", "syngenta", "mahone",
            "welder", "blacksmith", "repair", "motor", "engine", "spares",
            "poultry", "aqua", "fish", "dairy", "milk", "cattle",
            "mahindra", "swaraj", "johndeere", "tafe", "escorts", "sonalika", "kubota", "new holland", "eicher", "force motors"
        ];

        const excludeKeywords = ["passport", "police", "tax", "transport", "rto", "housing", "marble", "tile", "paint", "glass", "plywood", "function hall", "banquet", "marriage", "mobile", "computer", "laptop", "software", "marketing", "consultancy", "real estate", "construction", "bakery", "restaurant", "showroom", "auto", "car"];

        const filtered = data.elements.filter(el => {
            if (!el.tags || !el.tags.name) return false;
            const name = el.tags.name.toLowerCase();
            const type = el.tags.shop || el.tags.office || el.tags.amenity || el.tags.man_made || el.tags.craft;

            if (type === "electronics" && (name.includes("drone") || name.includes("solar") || name.includes("agri"))) {
                // Keep valid electronics
            } else if (type === "motorcycle" && (name.includes("motor") || name.includes("pump") || name.includes("spares"))) {
                // Keep mechanic/spare shops
            } else if (type === "car" && (name.includes("tractor") || name.includes("mahindra") || name.includes("swaraj") || name.includes("johndeere") || name.includes("tafe") || name.includes("escorts") || name.includes("sonalika") || name.includes("kubota") || name.includes("new holland") || name.includes("eicher"))) {
                // Keep tractor showrooms
                return true;
            } else if (excludeKeywords.some(k => name.includes(k)) && !name.includes("tractor")) {
                return false;
            }

            if (type === "agrarian_supplies" || type === "farm" || type === "agricultural_machinery" || type === "veterinary") return true;
            if (type === "marketplace") return true;
            if (type === "garden_centre" || type === "florist") return true;

            if (type === "government" || type === "ngo" || type === "association" || type === "company" || type === "cooperative" || el.tags.office) {
                if (agriKeywords.some(k => name.includes(k))) return true;
                return false;
            }

            if (type === "hardware" || type === "general" || type === "trade" || type === "country_store" || type === "electronics" || type === "rice" || type === "works" || type === "silo" || type === "blacksmith" || type === "welder" || type === "motorcycle" || type === "convenience" || type === "supermarket") {
                if (agriKeywords.some(k => name.includes(k)) || name.includes("drone") || name.includes("traders") || name.includes("agencies")) return true;
                return false;
            }

            return false;
        });

        const mapShopType = (tags) => {
            const type = tags.shop || tags.office || tags.amenity || tags.man_made || tags.craft;
            const name = tags.name ? tags.name.toLowerCase() : "";

            if (tags.office === "government" || tags.office === "ngo" || tags.office === "cooperative" || name.includes("kendra") || name.includes("samiti") || name.includes("help") || name.includes("support") || name.includes("society") || name.includes("pacs") || name.includes("markfed") || type === "veterinary") return "Help Center";

            if (name.includes("drone") || name.includes("tech") || name.includes("smart") || name.includes("solar") || type === "electronics") return "Technology";
            if (name.includes("pesticide") || name.includes("insecticide") || name.includes("pest") || name.includes("protection")) return "Pesticides";

            if (type === "agrarian_supplies" || name.includes("fertilizer") || name.includes("urea") || name.includes("compost") || name.includes("agro") || name.includes("agri") || name.includes("feed") || name.includes("agencies") || name.includes("chemicals") || name.includes("bio") || name.includes("poultry") || name.includes("aqua") || name.includes("fish") || name.includes("dairy")) return "Fertilizer";
            if (type === "farm" || type === "garden_centre" || type === "florist" || name.includes("seed") || name.includes("nursery") || name.includes("plant") || name.includes("cotton") || name.includes("ginning")) return "Seeds";
            if (type === "agricultural_machinery" || type === "blacksmith" || type === "welder" || name.includes("tools") || name.includes("machinery") || name.includes("tractor") || name.includes("pump") || name.includes("motor") || name.includes("pipe") || name.includes("engineering")) return "Tools";
            if (type === "hardware" || type === "trade") return "Tools";
            if (type === "car" || name.includes("tractor")) return "Tools";

            if (name.includes("traders") || name.includes("enterprises")) return "Fertilizer";

            if (tags.amenity === "marketplace") return "General";

            return "General";
        };

        console.log(`Filtered Agricultural Stores (Before Limiting): ${filtered.length}`);

        // Count by type
        const typeCounts = {};
        filtered.forEach(el => {
            const t = mapShopType(el.tags);
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        console.log("Counts by Category (Total):", typeCounts);

        // Emulate Limiting logic
        let limitedStores = 0;
        Object.keys(typeCounts).forEach(type => {
            const count = typeCounts[type];
            const display = Math.min(count, 10);
            limitedStores += display;
            console.log(`Displaying ${display} of ${count} for ${type}`);
        });

    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verifyStores();
