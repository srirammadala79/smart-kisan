export interface Tool {
    id: number;
    name: string;
    category: string;
    price: string;
    rental: string;
    description: string;
    image: string;
    efficiency: string;
    url: string;
}

export const tools: Tool[] = [
    {
        id: 1,
        name: "Harvester",
        category: "Heavy Machinery",
        price: "₹25,00,000",
        rental: "₹2,500/hr",
        description: "Automated harvesting for wheat, rice, and corn with grain loss sensors.",
        image: "https://th.bing.com/th/id/OIP.TTrBK9AsJ1ttMR5yOtwODQHaD4?w=298&h=180&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3",
        efficiency: "High",
        url: "https://www.claas-group.com/product/combine-harvesters"
    },
    {
        id: 2,
        name: "Drone",
        category: "Smart Tech",
        price: "₹4,50,000",
        rental: "₹800/acre",
        description: "GPS-guided drone for precise pesticide and fertilizer application.",
        image: "https://tse2.mm.bing.net/th/id/OIP.TsoSe1Ii4Jhe-16sxcqnywHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
        efficiency: "Ultra-High",
        url: "https://ag.dji.com/t40"
    },
    {
        id: 3,
        name: "Compact Tractor 45HP",
        category: "Tractors",
        price: "₹6,50,000",
        rental: "₹600/hr",
        description: "Versatile 4WD tractor suitable for tilling, plowing, and hauling.",
        image: "https://tse2.mm.bing.net/th/id/OIP.cxX1tUj68o_jdQEW90th1AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
        efficiency: "Medium",
        url: "https://www.mahindratractor.com/tractors/mahindra-yuvo-tech-plus-475-di"
    },
    {
        id: 4,
        name: "Laser Land Leveler",
        category: "Attachments",
        price: "₹3,20,000",
        rental: "₹1,200/hr",
        description: "Ensures perfectly level field for uniform water distribution.",
        image: "https://www.fieldking.com/images/landscaping/leveler/sp/eco-planer-laser-guided-land-leveler/1.jpg",
        efficiency: "High",
        url: "https://ksagrotech.org/laser-land-leveler/"
    },
    {
        id: 5,
        name: "Automatic Seed Drill",
        category: "Attachments",
        price: "₹85,000",
        rental: "₹400/hr",
        description: "Sows seeds at proper depth and distance for optimal growth.",
        image: "https://th.bing.com/th/id/OIP._NIahpHGpRRRKupw_o-NqgHaE6?w=270&h=180&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3",
        efficiency: "High",
        url: "https://ksagrotech.org/laser-land-leveler/"
    },
    {
        id: 6,
        name: "Solar Water Pump",
        category: "Smart Tech",
        price: "₹3,50,000",
        rental: "N/A",
        description: "Eco-friendly irrigation solution powered by solar energy.",
        image: "https://images.unsplash.com/photo-1594911771131-0dfdbcf356ff?auto=format&fit=crop&w=800&q=80",
        efficiency: "High",
        url: "https://mnre.gov.in/solar-pumps/"
    },
    {
        id: 7,
        name: "Power Tiller",
        category: "Heavy Machinery",
        price: "₹1,80,000",
        rental: "₹300/hr",
        description: "Multipurpose machine for soil preparation and inter-cultivation.",
        image: "https://th.bing.com/th/id/OIP.XoxktBWmrl0mqCwjO7_CxgHaFj?w=249&h=187&c=7&r=0&o=7&dpr=1.6&pid=1.7&rm=3",
        efficiency: "Medium",
        url: "https://vsttractors.com/products/power-tillers"
    },
    {
        id: 8,
        name: "Precision Planter",
        category: "Attachments",
        price: "₹1,20,000",
        rental: "₹500/hr",
        description: "Advanced planting system for optimal seed spacing and depth control.",
        image: "https://images.unsplash.com/photo-1594911771131-0dfdbcf356ff?auto=format&fit=crop&w=400&q=80",
        efficiency: "High",
        url: "https://www.deere.com/en/planting-equipment/"
    },
    {
        id: 9,
        name: "Soil Moisture Sensor",
        category: "Smart Tech",
        price: "₹15,000",
        rental: "N/A",
        description: "IoT-enabled sensor for real-time soil moisture monitoring.",
        image: "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=400&q=80",
        efficiency: "Ultra-High",
        url: "https://www.netafim.com/en/digital-farming/netbeat/"
    }
];
