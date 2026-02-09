"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, FileText, Sprout, ShieldCheck, Banknote, Tractor, Droplets } from "lucide-react";
import { useState } from "react";

// Mock Data based on Research
const SCHEMES = [
    {
        id: "pm-kisan",
        title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        category: "Income Support",
        description: "Provides financial support of ₹6,000 per year to landholding farmer families, payable in three equal installments of ₹2,000 each.",
        eligibility: "All landholding farmer families having cultivable landholding in their names.",
        benefits: ["₹6,000 per year direct bank transfer"],
        link: "https://pmkisan.gov.in/",
        icon: Banknote,
        color: "text-green-600 bg-green-100 dark:bg-green-900/20",
        cardBg: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-800/30"
    },
    {
        id: "pmfby",
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        category: "Insurance",
        description: "Crop insurance scheme that provides financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
        eligibility: "Farmers including sharecroppers and tenant farmers growing notified crops in notified areas.",
        benefits: ["Comprehensive risk cover", "Low premium rates"],
        link: "https://pmfby.gov.in/",
        icon: ShieldCheck,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
        cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/30"
    },
    {
        id: "kcc",
        title: "Kisan Credit Card (KCC)",
        category: "Credit",
        description: "Provides adequate and timely credit support from the banking system under a single window for their cultivation and other needs.",
        eligibility: "All farmers, tenant farmers, oral lessees & share croppers.",
        benefits: ["Credit for seeds, fertilizers, pesticides", "Interest subvention available"],
        link: "https://www.myscheme.gov.in/schemes/kcc",
        icon: FileText,
        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
        cardBg: "bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200 dark:from-purple-950/30 dark:to-fuchsia-950/30 dark:border-purple-800/30"
    },
    {
        id: "shc",
        title: "Soil Health Card Scheme",
        category: "Soil Health",
        description: "Aims to assist State Governments to issue Soil Health Cards to all farmers in the country. The Soil Health Cards provide information to farmers on nutrient status of their soil.",
        eligibility: "All farmers.",
        benefits: ["Soil testing", "Fertilizer recommendations", "Improved yield"],
        link: "https://soilhealth.dac.gov.in/",
        icon: Sprout,
        color: "text-amber-600 bg-amber-100 dark:bg-amber-900/20",
        cardBg: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800/30"
    },
    {
        id: "pmksy",
        title: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
        category: "Irrigation",
        description: "Focuses on creating sources for assured irrigation, also creating protective irrigation by harnessing rain water at micro level.",
        eligibility: "Farmers with cultivable land.",
        benefits: ["Per Drop More Crop", "Subsidies for drip/sprinkler irrigation"],
        link: "https://pmksy.gov.in/",
        icon: Droplets,
        color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20",
        cardBg: "bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-200 dark:from-cyan-950/30 dark:to-sky-950/30 dark:border-cyan-800/30"
    },
    {
        id: "smam",
        title: "Sub-Mission on Agricultural Mechanization (SMAM)",
        category: "Mechanization",
        description: "Promotes 'Custom Hiring Centres' to offset the adverse economies of scale arising due to small landholding and high cost of individual ownership.",
        eligibility: "Farmers, SHGs, FPOs.",
        benefits: ["Subsidies on tractors/equipment", "Access to modern machinery"],
        link: "https://agrimachinery.nic.in/",
        icon: Tractor,
        color: "text-red-600 bg-red-100 dark:bg-red-900/20",
        cardBg: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 dark:from-red-950/30 dark:to-rose-950/30 dark:border-red-800/30"
    }
];

export default function SchemesPage() {
    const { t } = useLanguage(); // Using for potential future translation, but text is hardcoded english for now as requested
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", ...Array.from(new Set(SCHEMES.map(s => s.category)))];

    const filteredSchemes = SCHEMES.filter(scheme => {
        const matchesSearch = scheme.title.toLowerCase().includes(search.toLowerCase()) ||
            scheme.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        Government Schemes
                    </h1>
                    <p className="text-muted-foreground">
                        Deep search results for active government schemes for farmers in India (2024-25).
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search schemes..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap shrink-0">
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="rounded-full"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Schemes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1 overflow-y-auto pr-2 pb-4">
                {filteredSchemes.map(scheme => (
                    <Card key={scheme.id} className={`flex flex-col hover:shadow-lg transition-shadow border ${scheme.cardBg || ''}`}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                                <div className={`p-2 rounded-lg ${scheme.color} shrink-0`}>
                                    <scheme.icon className="h-6 w-6" />
                                </div>
                                < Badge variant="secondary" className="shrink-0 bg-white/50 backdrop-blur-sm">{scheme.category}</Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight mt-3">{scheme.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {scheme.description}
                            </p>

                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">Key Benefits</span>
                                <ul className="list-disc list-inside text-sm space-y-0.5">
                                    {scheme.benefits.map((benefit, i) => (
                                        <li key={i}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-2">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">Eligibility</span>
                                <p className="text-xs text-foreground mt-0.5">{scheme.eligibility}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button className="w-full gap-2 bg-white/50 hover:bg-white/80 text-foreground border-black/10" variant="outline" asChild>
                                <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                                    View Official Details <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {filteredSchemes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No schemes found matching your search.</p>
                        <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>Clear Filters</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
