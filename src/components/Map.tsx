"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { StoreLocation } from "@/types";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
    Store,
    ShoppingCart,
    Hammer,
    Sprout,
    FlaskConical,
    Cpu,
    Bug,
    HeartHandshake,
    Wrench,
    Tractor,
    Milk,
    Factory,
    Droplets,
    Stethoscope,
    Wheat,
    Egg,
    Scale,
    Fish,
    Landmark
} from "lucide-react";

// Fix for default marker icon in leaflet
import L from "leaflet";
import { useMemo } from "react";



function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        // Prevent Leaflet race condition on initial render or rapid updates
        const timer = setTimeout(() => {
            try {
                map.setView(center, 10, { animate: true });
            } catch (e) {
                // Ignore errors if map is destroyed
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [center, map]);
    return null;
}

const StoreIcon = (type: string) => {
    let icon;
    let colorClass = "bg-primary"; // Default

    switch (type) {
        case "Fertilizer":
            icon = <FlaskConical size={10} />;
            colorClass = "bg-emerald-600";
            break;
        case "Tools":
            icon = <Wrench size={10} />;
            colorClass = "bg-orange-500";
            break;
        case "Seeds":
            icon = <Sprout size={10} />;
            colorClass = "bg-green-500";
            break;
        case "Technology":
            icon = <Cpu size={10} />;
            colorClass = "bg-blue-600";
            break;
        case "Pesticides":
            icon = <Bug size={10} />;
            colorClass = "bg-red-500";
            break;
        case "Help Center":
            icon = <HeartHandshake size={10} />;
            colorClass = "bg-yellow-500";
            break;
        case "Machinery":
            icon = <Tractor size={10} />;
            colorClass = "bg-red-600";
            break;
        case "Irrigation":
            icon = <Droplets size={10} />;
            colorClass = "bg-cyan-500";
            break;
        case "Livestock": // Fallback
        case "Animal Feed":
            icon = <Wheat size={10} />;
            colorClass = "bg-amber-600";
            break;
        case "Veterinary":
            icon = <Stethoscope size={10} />;
            colorClass = "bg-rose-500";
            break;
        case "Dairy":
            icon = <Milk size={10} />;
            colorClass = "bg-pink-500";
            break;
        case "Poultry":
            icon = <Egg size={10} />;
            colorClass = "bg-orange-300";
            break;
        case "Aqua":
            icon = <Fish size={10} />;
            colorClass = "bg-blue-400";
            break;
        case "Processing":
            icon = <Factory size={10} />;
            colorClass = "bg-slate-600";
            break;
        case "Markets":
            icon = <Scale size={10} />;
            colorClass = "bg-violet-600";
            break;
        case "Bank":
            icon = <Landmark size={10} />;
            colorClass = "bg-indigo-600";
            break;
        default:
            icon = <Store size={10} />;
            colorClass = "bg-primary";
    }

    return divIcon({
        className: `${colorClass} text-white p-0.5 rounded-full border-2 border-white shadow-md flex items-center justify-center`,
        html: renderToStaticMarkup(icon),
        iconSize: [20, 20], // Even smaller (was 24)
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
    });
};




export default function Map({ stores, center }: { stores: StoreLocation[], center: [number, number] }) {
    const [mounted, setMounted] = useState(false);
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        // Fix for default marker icon in leaflet
        // Must be run on client side only
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        const iconRetina = (require('leaflet/dist/images/marker-icon-2x.png') as any);
        const iconMarker = (require('leaflet/dist/images/marker-icon.png') as any);
        const iconShadow = (require('leaflet/dist/images/marker-shadow.png') as any);

        L.Icon.Default.mergeOptions({
            iconRetinaUrl: iconRetina.default?.src || iconRetina.src || iconRetina.default || iconRetina,
            iconUrl: iconMarker.default?.src || iconMarker.src || iconMarker.default || iconMarker,
            shadowUrl: iconShadow.default?.src || iconShadow.src || iconShadow.default || iconShadow,
        });
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full bg-secondary animate-pulse rounded-lg" />;

    // Fix for "appendChild" error: ensure MapContainer is not unmounted/remounted unnecessarily
    // The error 'appendChild' often comes from TileLayer trying to attach to a map that is being destroyed.
    // We will use a ref-based approach to ensure children are only rendered when map is ready.
    return (
        <MapContainer
            ref={setMap}
            center={center}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full w-full rounded-lg z-0"
        >
            {map && (
                <>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView center={center} />
                    {stores.map((store) => (
                        <Marker
                            key={store.id}
                            position={[store.lat, store.lng]}
                            icon={StoreIcon(store.type)}
                        >
                            <Popup>
                                <div className="font-sans">
                                    <h3 className="font-bold text-sm">{store.name}</h3>
                                    <p className="text-xs text-muted-foreground">{store.type}</p>
                                    <div className="mt-2 text-xs">
                                        <strong>Available:</strong> {store.items.join(", ")}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </>
            )}
        </MapContainer>
    );
}
