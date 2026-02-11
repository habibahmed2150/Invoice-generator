import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

const parseInvoicePrompt = `
You are an intelligent invoice assistant. Your task is to extract structured invoice data from the user's natural language input.
The user might provide details about the sender, recipient, items, or general terms.
Return a JSON object that matches the provided schema. 
If specific fields (like dates or invoice numbers) are missing, generate reasonable defaults (e.g., today's date, invoice #0001).
Ensure monetary values are numbers.
`;

export const parseInvoiceFromText = async (text: string): Promise<Partial<InvoiceData>> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract invoice data from this text: "${text}"`,
      config: {
        systemInstruction: parseInvoicePrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceNumber: { type: Type.STRING },
            sender: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
              }
            },
            recipient: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
              }
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                }
              }
            },
            notes: { type: Type.STRING },
          }
        }
      }
    });

    const result = response.text;
    if (!result) return {};
    
    return JSON.parse(result) as Partial<InvoiceData>;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};