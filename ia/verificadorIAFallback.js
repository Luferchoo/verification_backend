const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-70b-8192';

// Configuración de timeout y reintentos
const AXIOS_CONFIG = {
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

// Verificar que la API key esté configurada
if (!GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY no está configurada en el archivo .env');
  throw new Error('GROQ_API_KEY no está configurada');
}

// Función de fallback simple
function verificarFallback(texto) {
  console.log('Usando verificación de fallback...');
  
  // Análisis básico basado en palabras clave
  const palabrasClaveVerdaderas = [
    'elecciones', 'presidente', 'gobierno', 'ministerio', 'congreso',
    'ley', 'decreto', 'anuncio', 'confirmado', 'oficial'
  ];
  
  const palabrasClaveFalsas = [
    'alienígenas', 'ovni', 'milagro', 'fantasma', 'bruja',
    'conspiración', 'secreto', 'misterio', 'paranormal'
  ];
  
  const textoLower = texto.toLowerCase();
  let score = 50; // Score base
  let veredicto = 'No concluyente';
  let razonamiento = 'Análisis básico realizado.';
  
  // Contar palabras clave verdaderas
  const verdaderas = palabrasClaveVerdaderas.filter(palabra => 
    textoLower.includes(palabra)
  ).length;
  
  // Contar palabras clave falsas
  const falsas = palabrasClaveFalsas.filter(palabra => 
    textoLower.includes(palabra)
  ).length;
  
  // Calcular score
  if (verdaderas > 0 && falsas === 0) {
    score = Math.min(85, 50 + (verdaderas * 10));
    veredicto = 'Posiblemente Verdadera';
    razonamiento = `Contiene ${verdaderas} indicadores de credibilidad.`;
  } else if (falsas > 0) {
    score = Math.max(15, 50 - (falsas * 15));
    veredicto = 'Posiblemente Falsa';
    razonamiento = `Contiene ${falsas} indicadores de baja credibilidad.`;
  }
  
  return {
    veredicto,
    score,
    razonamiento,
    fuenteCoincidente: null,
    metodo: 'FALLBACK'
  };
}

async function verificarConIA(texto) {
  try {
    console.log('Iniciando verificación con Groq...');
    
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

    const requestData = {
      model: MODEL,
      messages: [
        { role: 'system', content: 'Eres un verificador de hechos experto en noticias bolivianas.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 512
    };

    console.log('Enviando petición a Groq...');
    const response = await axios.post(GROQ_API_URL, requestData, AXIOS_CONFIG);

    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const jsonString = content.substring(jsonStart, jsonEnd + 1);

    const resultado = JSON.parse(jsonString);
    resultado.metodo = 'GROQ';
    return resultado;

  } catch (err) {
    console.error('Error al usar Groq:', err.message);
    
    // Manejo específico de errores de conectividad
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      console.error('Error de conectividad con Groq. Usando fallback...');
      return verificarFallback(texto);
    }
    
    // Manejo de errores de API
    if (err.response) {
      console.error('Error de API Groq:', err.response.status, err.response.data);
      console.log('Usando fallback debido a error de API...');
      return verificarFallback(texto);
    }
    
    console.log('Error desconocido, usando fallback...');
    return verificarFallback(texto);
  }
}

module.exports = verificarConIA; 