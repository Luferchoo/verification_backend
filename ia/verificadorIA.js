// ia/verificadorIA.js
const axios = require('axios');

const GROQ_API_KEY = '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'; // ¡Reemplázala por una variable de entorno si vas a producción!
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-70b-8192'; // También puedes probar con 'llama3-70b-8192'

async function verificarConIA(texto) {
  try {
    const prompt = `
Eres un verificador de hechos boliviano. Evalúa la siguiente noticia o declaración y responde SOLO con este JSON (sin ninguna explicación externa ni texto adicional):

{
  "veredicto": "Posiblemente Verdadera" | "Posiblemente Falsa" | "No concluyente",
  "score": número entre 0 y 100,
  "razonamiento": explicación breve en español,
  "fuenteCoincidente": url si la conoces o null
}

Texto a evaluar:
"""${texto}"""
`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: 'Eres un verificador de hechos experto en noticias bolivianas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 512
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const jsonString = content.substring(jsonStart, jsonEnd + 1);

    const resultado = JSON.parse(jsonString);
    return resultado;

  } catch (err) {
    console.error('Error al usar Groq:', err.response?.data || err.message);
    return {
      veredicto: 'No concluyente',
      score: 50,
      razonamiento: 'No se pudo analizar el texto correctamente.',
      fuenteCoincidente: null
    };
  }
}

module.exports = verificarConIA;
