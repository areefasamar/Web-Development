import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const aiService = {
  async analyzeInventory(products: Product[]) {
    const client = getAi();
    const context = products.map(p => `${p.name} (${p.category}): ${p.stock} units`).join('\n');
    
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{
          text: `You are an expert e-commerce inventory manager for a Gen Z streetwear brand called VibeCheck. 
          Analyze the following stock levels:
          
          ${context}
          
          Provide a punchy, energetic summary of inventory health. Use trendy language. Identify low stock items and suggest restock drops. 
          Format with bullet points and bold headings.`
        }]
      }
    });

    return response.text || "Unable to generate inventory report at this time.";
  },

  async analyzeProductImage(base64Image: string) {
    const client = getAi();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Identify this clothing item. Provide a sharp, professional product name, a luxury-style description (suitable for a brand called Stitch & Soul), an appropriate category, and a suggested price in USD. Also suggest initial stock level (1-50)."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Men", "Women", "Accessories", "Unisex", "New Arrivals", "Techwear", "Limited", "Archives"] },
            price: { type: Type.NUMBER },
            stock: { type: Type.INTEGER }
          },
          required: ["name", "description", "category", "price", "stock"]
        }
      }
    });

    return response.text || "{}";
  }
};
