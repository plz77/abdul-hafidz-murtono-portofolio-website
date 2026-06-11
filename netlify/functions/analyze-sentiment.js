export const handler = async (event) => {
  // Hanya mengizinkan metode POST demi keamanan data teks ulasan
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    // Membaca teks ulasan yang dikirim oleh frontend (index.html)
    const { text } = JSON.parse(event.body);
    
    // Netlify membaca API Key dari brankas Environment Variables secara aman di peladen
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    // Instruksi sistem agar Gemini mengembalikan format data JSON murni
    const systemPrompt = "Anda adalah sistem pakar analisis sentimen teks Bahasa Indonesia. Analisis teks yang diberikan oleh pengguna dan berikan respons HANYA DALAM FORMAT JSON murni tanpa markdown, tanpa backticks, dan tanpa teks tambahan lain. Format JSON harus tepat seperti ini: {\"sentiment\": \"POSITIF\" atau \"NEGATIF\", \"confidence\": angka desimal antara 0 sampai 1}";

    // Menembak endpoint resmi Google Gemini dari server backend Netlify
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: `Teks pengguna: "${text}"` }
          ]
        }]
      })
    });

    const data = await googleResponse.json();
    let rawResponseText = data.candidates[0].content.parts[0].text.trim();
    
    // Antisipasi pembersihan jika model menyertakan format markdown backticks
    rawResponseText = rawResponseText.replace(/```json/g, "").replace(/```/g, "").trim();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Mengizinkan web portofolio Anda membaca hasilnya
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: rawResponseText,
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal memproses analisis di server backend Netlify." }),
    };
  }
};
