import { GoogleGenAI } from "@google/genai";

export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: "Method not allowed" }) 
    };
  }

  try {
    const apiKey = process.env.MY_GEMINI_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Kunci API tidak ditemukan di environment Netlify." }),
      };
    }

    const { text } = JSON.parse(event.body || "{}");
    if (!text) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Teks kosong." }) };
    }

    // Inisialisasi SDK Gemini secara direct dan bersih
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analisislah sentimen dari kalimat Bahasa Indonesia berikut. Berikan hasil akhir HANYA dalam format JSON mentah tanpa bungkusan markdown seperti ini: {"sentiment": "positif", "confidence": 0.95} atau {"sentiment": "negatif", "confidence": 0.88}. Kalimat: "${text}"`,
    });

    const responseText = response.text.trim();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sentiment: result.sentiment || "positif",
        confidence: result.confidence || 0.90
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Gagal memproses analisis di backend serverless.",
        details: error.message 
      }),
    };
  }
};
