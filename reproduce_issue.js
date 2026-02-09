const fs = require("fs");
const path = require("path");

function getEnv() {
    try {
        const content = fs.readFileSync(".env.local", "utf8");
        const match = content.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
        if (match) return match[1].trim();
    } catch (e) { }
    // Fallback to process.env if available
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

const API_KEY = getEnv();

if (!API_KEY) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

console.log("Checking Key ends with:", API_KEY.slice(-4));

async function testModel(modelName) {
    console.log(`\n----------------------------------------`);
    console.log(`Testing Model: ${modelName}`);
    console.log(`----------------------------------------`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello, just checking if you are working." }]
                }]
            })
        });

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response Body:", text);
            return;
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Success! Response:", responseText);

    } catch (e) {
        console.error("Script Error:", e);
    }
}

async function run() {
    await testModel("gemini-2.5-flash");
    await testModel("gemini-2.0-flash-001");
}

run();
