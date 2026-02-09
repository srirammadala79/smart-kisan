export interface StoreLocation {
    id: number | string;
    lat: number;
    lng: number;
    name: string;
    type: string;
    types?: string[];
    items: string[];
    distance?: number;
}

export interface OverpassElement {
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags: {
        name?: string;
        shop?: string;
        office?: string;
        amenity?: string;
        man_made?: string;
        craft?: string;
        [key: string]: string | undefined;
    };
}

export interface WeatherData {
    city: string;
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    forecast: {
        day: string;
        temp: number;
    }[];
}
