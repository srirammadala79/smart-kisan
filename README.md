# AgriSmart - AI-Powered Farmer Assistant

AgriSmart is a comprehensive digital assistant designed to empower farmers with modern technology. By leveraging Google's Gemini AI, real-time location services, and a dedicated marketplace, AgriSmart helps farmers make informed decisions, diagnose crop issues, and access essential resources efficiently.

## 🌟 Key Features

### 🤖 AI Agri-Agent
- **Smart Chatbot:** Powered by **Gemini 2.0 Flash**, the assistant answers farming queries in real-time.
- **Photo Diagnosis:** Upload photos of crops or soil to get instant analysis on diseases, pests, and nutrient deficiencies.
- **Multilingual Support:** Communicate in your preferred local language.

### 📍 Interactive Store Locator
- **Dynamic Map:** Find nearby agricultural stores for seeds, fertilizers, machinery, and more.
- **Category Filtering:** Easily filter stores by type (e.g., Organic, Tools, Irrigation).
- **Real-Time Availability:** Check stock status for critical farming supplies.

### 🚜 Modern Farming Tools
- **Equipment Showcase:** Browse a catalog of modern farming machinery (Solar Pumps, Power Tillers, Drones).
- **Rental & Purchase:** Get details on pricing, efficiency, and rental options.
- **Comparison:** Compare specifications to choose the right tool for your farm.

### 📊 Market & Weather Insights
- **Live Market Prices:** Stay updated with current market rates for various crops (Wheat, Corn, Cotton, etc.).
- **Weather Forecasts:** Get localized weather updates to plan sowing and harvesting.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (React 19)
- **AI Model:** Google Gemini 2.0 Flash
- **Styling:** Tailwind CSS & Shadcn UI
- **Maps:** Leaflet & React-Leaflet
- **Icons:** Lucide React
- **Language:** TypeScript

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/farmer-app.git
    cd farmer-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file and add your Gemini API key:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) to start using AgriSmart.
