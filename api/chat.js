module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metode tidak diizinkan."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API Key Gemini belum dipasang di server."
    });
  }

  const message = req.body?.message;

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 5000
  ) {
    return res.status(400).json({
      error: "Pesan kosong atau terlalu panjang."
    });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Kamu adalah FAZA AI LAB'S, asisten AI serbaguna yang ramah, cerdas, kreatif, dan membantu. Jawab dalam bahasa yang digunakan pengguna. Berikan jawaban jelas, terstruktur, dan bermanfaat. Jangan mengaku memiliki kemampuan yang tidak tersedia."
            }]
          },
          contents: [{
            role: "user",
            parts: [{
              text: message.trim()
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(response.status).json({
        error: "Gemini belum dapat memproses permintaan. Periksa konfigurasi dan kuota API."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({
        error: "Gemini belum memberikan jawaban teks."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server FAZA AI LAB'S."
    });
  }
};
