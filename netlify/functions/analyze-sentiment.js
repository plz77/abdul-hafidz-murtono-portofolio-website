const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event, context) => {
  // Mengatasi pembatasan CORS jika diakses dari cross-domain
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Metode tidak diizinkan" }),
    };
  }

  try {
    // 1. Cek ketersediaan API Key di Server Netlify
    const apiKey = process.env.MY_GEMINI_KEY;
    if (!apiKey) {
      console.error("EROR INTERNAL: GEMINI_API_KEY belum terkonfigurasi di Netlify.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API Key belum disetel di server." }),
      };
    }

    // 2. Parsing teks masukan dari frontend
    const { text } = JSON.parse(event.body || "{}");
    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Teks tidak boleh kosong." }),
      };
    }

    // 3. Inisialisasi Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // 4. Memanggil Model Gemini untuk Analisis Sentimen
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analisislah sentimen dari kalimat Bahasa Indonesia berikut. Berikan hasil akhir HANYA dalam format JSON mentah seperti ini tanpa markdown tambahan atau format text lain: {"sentiment": "positif", "confidence": 0.95} atau {"sentiment": "negatif", "confidence": 0.88}. Kalimat yang dianalisis: "${text}"`,
    });

    const responseText = response.text.trim();
    console.log("Respons mentah dari Gemini:", responseText);

    // Membersihkan bungkusan markdown ```json jika model tidak sengaja menyertakannya
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
    console.error("Eror pada Netlify Function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Gagal memproses analisis sentimen.",
        details: error.message 
      }),
    };
  }
};
