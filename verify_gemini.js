const fs = require("fs");
const path = require("path");

function getEnv() {
    try {
        const content = fs.readFileSync(".env.local", "utf8");
        const match = content.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

const API_KEY = getEnv();

console.log("Checking Key:", API_KEY ? "Found (Ends with " + API_KEY.slice(-4) + ")" : "Not Found");

async function check() {
    if (!API_KEY) {
        console.error("No API Key found in .env.local");
        return;
    }

    try {
        console.log("Attempting to list models...");
        // Direct fetch to avoid SDK masking error details
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response Body:", text);
            return;
        }

        const data = await response.json();
        console.log("Success! Models available:");
        console.log(data.models?.map(m => m.name).slice(0, 5) || "No models found");

    } catch (e) {
        console.error("Script Error:", e);
    }
}

check();
