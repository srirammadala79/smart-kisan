"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Bot, Send, Image as ImageIcon, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { farmingTools, list_farming_tools, get_tool_details, book_tool_rental } from "@/lib/gemini-tools";

// But for this hackathon/student project, client-side is often acceptable if key is restricted.
// Ideally usage: /api/chat route. I will stick to client side for simplicity as requested "app".
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const MOCK_RESPONSES = {
    default: "I'm currently in Demo Mode because the AI service is unavailable. I can tell you that the weather looks good for planting wheat, and you should check your soil moisture levels!",
    weather: "Based on local data (simulated), it's currently 24°C with 60% humidity. Perfect for applying fertilizer.",
    pest: "For pest control, I recommend using organic neem oil spray. It's effective against aphids and whiteflies.",
    crop: "Wheat and Corn are excellent choices for this season. Make sure to rotate your crops to maintain soil health.",
    price: "Market prices are stable. Wheat is trading at ₹2100/quintal and Corn at ₹1800/quintal."
};



export default function AssistantPage() {
    const [messages, setMessages] = useState<{ role: "user" | "model"; text: string; image?: string }[]>([
        { role: "model", text: "Hello! I am your AgriSmart farming assistant. Ask me about crops, pests, weather, or upload a photo for diagnosis." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;
        if (!API_KEY) {
            setMessages(prev => [...prev, { role: "user", text: input }, { role: "model", text: "Error: No API Key found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file." }]);
            setInput("");
            return;
        }

        const newMessage = { role: "user" as const, text: input, image: imagePreview || undefined };
        setMessages(prev => [...prev, newMessage]);
        setInput("");
        setSelectedImage(null);
        setImagePreview(null);
        setIsLoading(true);

        // Check if key is loaded (common issue: user updated .env but didn't restart)
        if (!API_KEY) {
            setMessages(prev => [...prev, { role: "model", text: "Error: API Key is missing. If you just added it to .env.local, please RESTART your development server." }]);
            setIsLoading(false);
            return;
        }
        console.log("Gemini API Key loaded:", API_KEY.substring(0, 5) + "...");

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Use gemini-2.5-flash
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash", // Sticking to 2.0-flash as it's more stable for tool use in many regions
                tools: [{ functionDeclarations: farmingTools }],
                toolConfig: { functionCallingConfig: { mode: "AUTO" } }
            });

            const chat = model.startChat({
                history: messages
                    .filter((m, i) => i > 0 || m.role === "user")
                    .map(m => ({
                        role: m.role,
                        parts: [{ text: m.text }]
                    })),
            });

            async function runToolLoop(userInput: string, imagePart?: any) {
                let parts: any[] = [userInput];
                if (imagePart) parts.push(imagePart);

                let result = await chat.sendMessage(parts);
                let response = result.response;
                let responseText = "";

                // Function execution loop
                while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
                    const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall);
                    const toolResponses = [];

                    for (const fc of functionCalls) {
                        const { name, args } = fc.functionCall!;
                        console.log(`Executing tool: ${name}`, args);

                        let toolResult;
                        if (name === "list_farming_tools") {
                            toolResult = await list_farming_tools();
                        } else if (name === "get_tool_details") {
                            toolResult = await get_tool_details((args as any).toolName);
                        } else if (name === "book_tool_rental") {
                            toolResult = await book_tool_rental((args as any).toolId, (args as any).duration);
                        }

                        toolResponses.push({
                            functionResponse: {
                                name,
                                response: { result: toolResult }
                            }
                        });
                    }

                    result = await chat.sendMessage(toolResponses);
                    response = result.response;
                }

                return response.text();
            }

            let responseText = "";
            if (newMessage.image) {
                const base64Data = newMessage.image.split(',')[1];
                const mimeType = newMessage.image.split(';')[0].split(':')[1];
                const imagePart = { inlineData: { data: base64Data, mimeType } };
                responseText = await runToolLoop(newMessage.text || "Analyze this image for farming advice.", imagePart);
            } else {
                responseText = await runToolLoop(newMessage.text);
            }

            setMessages(prev => [...prev, { role: "model", text: responseText }]);

        } catch (error: any) {
            // Check for Quota Exceeded (429) specifically
            const isQuotaError = error.message?.includes("429") || error.toString().includes("429") || error.toString().includes("Quota");

            if (isQuotaError) {
                console.warn("Gemini API Quota Exceeded (429). Switching to Mock Mode.");
            } else {
                console.error("Gemini API Error (Primary):", error);
            }

            // AUTO-FALLBACK: If gemini-2.5-flash fails (404/429), try gemini-2.0-flash
            if (!isQuotaError && (error.message?.includes("404") || error.toString().includes("404"))) {
                try {
                    console.log("Attempting fallback to gemini-2.0-flash...");
                    const genAI = new GoogleGenerativeAI(API_KEY);
                    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                    const result = await fallbackModel.generateContent(newMessage.text);
                    const response = await result.response;
                    const text = response.text();

                    setMessages(prev => [...prev, { role: "model", text: text }]);
                    return; // Exit if fallback succeeds
                } catch (fallbackError) {
                    console.error("Gemini API Error (Fallback):", fallbackError);
                    // Continue to show error message if fallback also fails
                }
            }

            // MOCK MODE ACTIVATION
            // If API fails (likely due to permissions/billing), fallback to hardcoded helpful responses.
            if (!isQuotaError) console.log("Activating Mock Mode due to API failure.");

            let mockReply = MOCK_RESPONSES.default;
            const lowerInput = newMessage.text.toLowerCase();

            if (lowerInput.includes("weather") || lowerInput.includes("cloud") || lowerInput.includes("rain")) mockReply = MOCK_RESPONSES.weather;
            else if (lowerInput.includes("pest") || lowerInput.includes("bug") || lowerInput.includes("disease")) mockReply = MOCK_RESPONSES.pest;
            else if (lowerInput.includes("crop") || lowerInput.includes("plant") || lowerInput.includes("seed")) mockReply = MOCK_RESPONSES.crop;
            else if (lowerInput.includes("price") || lowerInput.includes("market") || lowerInput.includes("cost")) mockReply = MOCK_RESPONSES.price;

            let extraNote = "(Note: I am in Offline Demo Mode because the AI Service is currently unreachable.)";

            if (isQuotaError) {
                extraNote = "(Note: I am in Offline Demo Mode because the API quota was exceeded. Please try again later.)";
            }

            setMessages(prev => [...prev, { role: "model", text: mockReply + "\n\n" + extraNote }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="border-b px-6 py-4">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                        Agri-Agent Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex gap-3 max-w-[80%]", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                                {m.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={cn("rounded-lg p-3 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                {m.image && (
                                    <img src={m.image} alt="User upload" className="max-w-full h-auto rounded-md mb-2 max-h-60" />
                                )}
                                <p className="whitespace-pre-wrap">{m.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-muted rounded-lg p-3 flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t p-4">
                    <div className="flex w-full gap-2 items-end">
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="image-upload"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </Button>
                            {imagePreview && (
                                <div className="absolute bottom-12 left-0 w-16 h-16 bg-background border rounded-md overflow-hidden">
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                                        className="absolute top-0 right-0 bg-destructive text-white h-4 w-4 flex items-center justify-center text-xs"
                                    >
                                        x
                                    </button>
                                </div>
                            )}
                        </div>
                        <Input
                            placeholder="Ask about your crops..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading}
                            suppressHydrationWarning
                        />
                        <Button onClick={handleSend} disabled={isLoading || (!input && !selectedImage)}>
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
