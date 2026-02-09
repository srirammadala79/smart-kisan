import { tools, Tool } from "@/data/tools";
import { SchemaType, FunctionDeclaration } from "@google/generative-ai";


/**
 * Summarizes available equipment.
 * Returns a list of tool names and their basic info.
 */
export async function list_farming_tools() {
    console.log("TOOL CALL: list_farming_tools");
    return tools.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        rental: t.rental,
        price: t.price
    }));
}

/**
 * Provides pricing, images, and efficiency for a specific tool.
 * @param toolName The exact name of the tool to get details for.
 */
export async function get_tool_details(toolName: string) {
    console.log(`TOOL CALL: get_tool_details(${toolName})`);
    const tool = tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
    if (!tool) {
        return { error: `Tool '${toolName}' not found. Please use list_farming_tools to see available equipment.` };
    }
    return tool;
}

/**
 * Simulates a rental transaction.
 * @param toolId The ID of the tool to rent.
 * @param duration Duration in hours or acres as specified in the tool rental rate.
 */
export async function book_tool_rental(toolId: number, duration: number) {
    console.log(`TOOL CALL: book_tool_rental(toolId: ${toolId}, duration: ${duration})`);
    const tool = tools.find(t => t.id === toolId);
    if (!tool) {
        return { error: `Tool ID ${toolId} not found.` };
    }
    if (tool.rental === "N/A") {
        return { error: `${tool.name} is only available for purchase, not rental.` };
    }

    const bookingId = `RNT-${Math.floor(Math.random() * 10000)}`;
    return {
        success: true,
        message: `Successfully booked ${tool.name} for ${duration} units.`,
        bookingId,
        toolName: tool.name,
        totalCost: `Check local rates (Approx: ${tool.rental} x ${duration})`,
        confirmation: "Your booking is confirmed. The provider will contact you shortly."
    };
}

// Tool definitions for Gemini API
export const farmingTools: FunctionDeclaration[] = [
    {
        name: "list_farming_tools",
        description: "List all available farming tools, machinery, and equipment available for rent or purchase.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {},
            required: []
        }
    },
    {
        name: "get_tool_details",
        description: "Get detailed information about a specific farming tool, including its price, rental rate, efficiency, and description.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                toolName: {
                    type: SchemaType.STRING,
                    description: "The name of the tool to get details for (e.g., 'Drone', 'Harvester')."
                }
            },
            required: ["toolName"]
        }
    },
    {
        name: "book_tool_rental",
        description: "Book a rental for a specific farming tool.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                toolId: {
                    type: SchemaType.NUMBER,
                    description: "The unique ID of the tool to rent."
                },
                duration: {
                    type: SchemaType.NUMBER,
                    description: "The duration of the rental (e.g., number of hours or acres)."
                }
            },
            required: ["toolId", "duration"]
        }
    }
];

