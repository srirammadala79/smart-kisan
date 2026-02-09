"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

// Data for Books with Background Images
const books = [
    { title: "Modern Farming Techniques", author: "Dr. A. Kumar", category: "General", type: "PDF", image: "https://th.bing.com/th/id/OIP.9BsVwHdg19srvMavas9xDQHaEK?w=264&h=180&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3", url: "https://www.fao.org/3/ca7171en/ca7171en.pdf" }, // Tractor/Tech
    { title: "Organic Fertilizers Guide", author: "Sarah Green", category: "Organic", type: "PDF", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80", url: "https://www.fao.org/3/a0443e/a0443e.pdf" }, // Soil/Compost
    { title: "Pest Management 101", author: "R. Singh", category: "Protection", type: "EPUB", image: "https://th.bing.com/th/id/OIP.Fexm0dowCBZXZ8STSul9agHaEo?w=275&h=180&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3", url: "https://www.fao.org/3/ca5696en/ca5696en.pdf" }, // Leaf health
    { title: "Irrigation Systems Manual", author: "Tech Agro", category: "Water", type: "PDF", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=400&q=80", url: "https://www.fao.org/3/s8684e/s8684e.pdf" }, // Irrigation
    { title: "Soil Health Handbook", author: "Uni of Agriculture", category: "Soil", type: "PDF", image: "https://th.bing.com/th/id/OIP.O3tRxI1JRBdCjlqoHvZadAHaKe?w=186&h=263&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3", url: "https://www.nrcs.usda.gov/sites/default/files/2022-10/Soil%20Health%20Assessment.pdf" }, // Hands with soil
    { title: "Paddy Cultivation Masterclass", author: "Rice Institute", category: "Crops", type: "PDF", image: "https://th.bing.com/th/id/OIP.WrUDxNQhiAxKqWLbf9ndeQHaFj?w=225&h=180&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3", url: "http://www.knowledgebank.irri.org/images/docs/12-Steps-Required-for-Successful-Rice-Production.pdf" }, // Paddy field
];



export default function ResourcesPage() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("resources.title")}</h1>
                    <p className="text-muted-foreground">{t("resources.desc")}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Input
                    placeholder={t("resources.search")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {filteredBooks.map((book, i) => (
                    <Card
                        key={i}
                        className="flex flex-col hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer border-stone-200 dark:border-stone-800 bg-gradient-to-br from-white to-stone-50 dark:from-stone-950/40 dark:to-stone-900/40"
                        onClick={() => handleDownload(book.url)}
                    >
                        <div className="relative h-48 w-full overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url(${book.image})` }}
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                            <div className="absolute top-2 right-2">
                                <span className="text-xs bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full font-medium border border-white/20 shadow-sm">{book.type}</span>
                            </div>
                        </div>
                        <CardHeader className="relative -mt-12 pt-4 px-4 pb-2 z-10">
                            <CardTitle className="text-xl bg-white/95 dark:bg-black/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-black/5 dark:border-white/10 leading-tight">{book.title}</CardTitle>
                            <CardDescription className="px-2 pt-2 text-stone-600 dark:text-stone-400">by {book.author}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pt-2">
                            <div className="flex gap-2">
                                <span className="text-xs bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-800 font-medium">{book.category}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="default" className="w-full gap-2 group bg-stone-800 hover:bg-stone-700 text-stone-50 dark:bg-stone-700 dark:hover:bg-stone-600">
                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> {t("resources.view_guide")}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
