const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("No .env.local file found");
            return;
        }
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);

        if (!match || !match[1]) {
            console.error("No API Key found in .env.local");
            return;
        }

        const key = match[1].trim();
        console.log("Using API Key ending in:", key.substring(key.length - 4));

        const genAI = new GoogleGenerativeAI(key);
        // Get the model manager to list models
        // Note: The helper library doesn't expose listModels directly on the main class easily in some versions. 
        // But let's try via the fetch if needed, or check if the SDK supports it.
        // Actually, let's just use fetch if we can't find it. 
        // But genAI.getGenerativeModel is standard.
        // Let's try to access the underlying API.

        // Direct fetch is safer given different SDK versions.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("\nAvailable Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName}) [${m.supportedGenerationMethods.join(', ')}]`);
            });
        } else {
            console.log("No models found in response:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

main();
