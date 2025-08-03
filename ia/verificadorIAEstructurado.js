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

// Función para detectar si el input es una noticia estructurada
function detectarEstructura(input) {
  try {
    // Si es string, intentar parsear como JSON
    if (typeof input === 'string') {
      const parsed = JSON.parse(input);
      return parsed.noticia ? 'ESTRUCTURADA' : 'TEXTO_SIMPLE';
    }
    
    // Si es objeto, verificar si tiene estructura de noticia
    if (typeof input === 'object' && input.noticia) {
      return 'ESTRUCTURADA';
    }
    
    return 'TEXTO_SIMPLE';
  } catch (error) {
    return 'TEXTO_SIMPLE';
  }
}

// Función para extraer información de noticia estructurada
function extraerInformacionNoticia(noticiaStruct) {
  const noticia = noticiaStruct.noticia || noticiaStruct;
  
  return {
    titular: noticia.titular || 'Sin titular',
    fecha: noticia.fecha || 'Sin fecha',
    autor: noticia.autor || 'Sin autor',
    lugar: noticia.lugar || 'Sin lugar',
    categoria: noticia.categoria || 'Sin categoría',
    fuente: noticia.fuente || 'Sin fuente',
    cuerpo: noticia.cuerpo || '',
    analisis_semantico: noticia.analisis_semantico || {}
  };
}

// Función de fallback mejorada para noticias estructuradas
function verificarFallbackEstructurado(noticiaInfo) {
  console.log('Usando verificación de fallback estructurado...');
  
  // Palabras clave por categoría
  const palabrasClavePorCategoria = {
    'Educación': ['ley', 'educativa', 'ministerio', 'gobierno', 'reforma', 'currículo'],
    'Política': ['presidente', 'gobierno', 'congreso', 'ley', 'decreto', 'anuncio'],
    'Economía': ['economía', 'inversión', 'crecimiento', 'ministerio', 'finanzas'],
    'Salud': ['salud', 'hospital', 'médico', 'vacuna', 'tratamiento'],
    'Tecnología': ['tecnología', 'digital', 'innovación', 'startup', 'app']
  };
  
  // Palabras clave de credibilidad
  const palabrasClaveVerdaderas = [
    'gobierno', 'ministerio', 'oficial', 'confirmado', 'aprobado',
    'ley', 'decreto', 'anuncio', 'presidente', 'congreso'
  ];
  
  const palabrasClaveFalsas = [
    'alienígenas', 'ovni', 'milagro', 'fantasma', 'bruja',
    'conspiración', 'secreto', 'misterio', 'paranormal'
  ];
  
  const textoCompleto = `${noticiaInfo.titular} ${noticiaInfo.cuerpo}`.toLowerCase();
  let score = 50;
  let veredicto = 'No concluyente';
  let razonamiento = 'Análisis básico realizado.';
  
  // Análisis por categoría
  const categoria = noticiaInfo.categoria || 'General';
  const palabrasCategoria = palabrasClavePorCategoria[categoria] || [];
  const coincidenciasCategoria = palabrasCategoria.filter(palabra => 
    textoCompleto.includes(palabra)
  ).length;
  
  // Análisis de credibilidad
  const verdaderas = palabrasClaveVerdaderas.filter(palabra => 
    textoCompleto.includes(palabra)
  ).length;
  
  const falsas = palabrasClaveFalsas.filter(palabra => 
    textoCompleto.includes(palabra)
  ).length;
  
  // Calcular score basado en múltiples factores
  let scoreBase = 50;
  
  // Factor de categoría
  if (coincidenciasCategoria > 0) {
    scoreBase += coincidenciasCategoria * 5;
  }
  
  // Factor de credibilidad
  if (verdaderas > 0 && falsas === 0) {
    scoreBase += verdaderas * 8;
    veredicto = 'Posiblemente Verdadera';
    razonamiento = `Contiene ${verdaderas} indicadores de credibilidad y ${coincidenciasCategoria} términos relevantes de la categoría ${categoria}.`;
  } else if (falsas > 0) {
    scoreBase -= falsas * 12;
    veredicto = 'Posiblemente Falsa';
    razonamiento = `Contiene ${falsas} indicadores de baja credibilidad.`;
  }
  
  // Factor de fuente
  if (noticiaInfo.fuente && noticiaInfo.fuente !== 'Sin fuente') {
    scoreBase += 5;
    razonamiento += ' Incluye fuente verificable.';
  }
  
  // Factor de fecha
  if (noticiaInfo.fecha && noticiaInfo.fecha !== 'Sin fecha') {
    scoreBase += 3;
  }
  
  score = Math.max(15, Math.min(95, scoreBase));
  
  return {
    veredicto,
    score,
    razonamiento,
    fuenteCoincidente: noticiaInfo.fuente !== 'Sin fuente' ? noticiaInfo.fuente : null,
    metodo: 'FALLBACK_ESTRUCTURADO',
    metadata: {
      categoria: noticiaInfo.categoria,
      fecha: noticiaInfo.fecha,
      autor: noticiaInfo.autor,
      lugar: noticiaInfo.lugar,
      entidades: noticiaInfo.analisis_semantico?.entidades_nombradas || []
    }
  };
}

// Función de fallback simple para texto plano
function verificarFallbackSimple(texto) {
  console.log('Usando verificación de fallback simple...');
  
  const palabrasClaveVerdaderas = [
    'elecciones', 'presidente', 'gobierno', 'ministerio', 'congreso',
    'ley', 'decreto', 'anuncio', 'confirmado', 'oficial'
  ];
  
  const palabrasClaveFalsas = [
    'alienígenas', 'ovni', 'milagro', 'fantasma', 'bruja',
    'conspiración', 'secreto', 'misterio', 'paranormal'
  ];
  
  const textoLower = texto.toLowerCase();
  let score = 50;
  let veredicto = 'No concluyente';
  let razonamiento = 'Análisis básico realizado.';
  
  const verdaderas = palabrasClaveVerdaderas.filter(palabra => 
    textoLower.includes(palabra)
  ).length;
  
  const falsas = palabrasClaveFalsas.filter(palabra => 
    textoLower.includes(palabra)
  ).length;
  
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
    metodo: 'FALLBACK_SIMPLE'
  };
}

async function verificarConIA(input) {
  try {
    console.log('Iniciando verificación con Groq...');
    
    // Detectar tipo de input
    const tipoInput = detectarEstructura(input);
    console.log(`Tipo de input detectado: ${tipoInput}`);
    
    let prompt = '';
    let requestData = {};
    
    if (tipoInput === 'ESTRUCTURADA') {
      // Parsear noticia estructurada
      const noticiaInfo = extraerInformacionNoticia(input);
      
      prompt = `
Eres un verificador de hechos boliviano experto. Analiza la siguiente noticia estructurada y responde SOLO con este JSON (sin explicaciones externas):

{
  "veredicto": "Posiblemente Verdadera" | "Posiblemente Falsa" | "No concluyente",
  "score": número entre 0 y 100,
  "razonamiento": explicación breve en español,
  "fuenteCoincidente": url si la conoces o null,
  "entidades_identificadas": ["lista", "de", "entidades"],
  "categoria_verificada": "categoría de la noticia",
  "confianza_analisis": "Alta" | "Media" | "Baja"
}

Noticia a evaluar:
- Titular: ${noticiaInfo.titular}
- Fecha: ${noticiaInfo.fecha}
- Autor: ${noticiaInfo.autor}
- Lugar: ${noticiaInfo.lugar}
- Categoría: ${noticiaInfo.categoria}
- Fuente: ${noticiaInfo.fuente}
- Cuerpo: ${noticiaInfo.cuerpo}
- Análisis semántico previo: ${JSON.stringify(noticiaInfo.analisis_semantico)}
`;
    } else {
      // Texto simple
      prompt = `
Eres un verificador de hechos boliviano. Evalúa la siguiente noticia o declaración y responde SOLO con este JSON (sin ninguna explicación externa ni texto adicional):

{
  "veredicto": "Posiblemente Verdadera" | "Posiblemente Falsa" | "No concluyente",
  "score": número entre 0 y 100,
  "razonamiento": explicación breve en español,
  "fuenteCoincidente": url si la conoces o null
}

Texto a evaluar:
"""${input}"""
`;
    }

    requestData = {
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
    resultado.tipo_input = tipoInput;
    
    return resultado;

  } catch (err) {
    console.error('Error al usar Groq:', err.message);
    
    // Manejo específico de errores de conectividad
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      console.error('Error de conectividad con Groq. Usando fallback...');
      
      const tipoInput = detectarEstructura(input);
      if (tipoInput === 'ESTRUCTURADA') {
        const noticiaInfo = extraerInformacionNoticia(input);
        return verificarFallbackEstructurado(noticiaInfo);
      } else {
        return verificarFallbackSimple(input);
      }
    }
    
    // Manejo de errores de API
    if (err.response) {
      console.error('Error de API Groq:', err.response.status, err.response.data);
      console.log('Usando fallback debido a error de API...');
      
      const tipoInput = detectarEstructura(input);
      if (tipoInput === 'ESTRUCTURADA') {
        const noticiaInfo = extraerInformacionNoticia(input);
        return verificarFallbackEstructurado(noticiaInfo);
      } else {
        return verificarFallbackSimple(input);
      }
    }
    
    console.log('Error desconocido, usando fallback...');
    const tipoInput = detectarEstructura(input);
    if (tipoInput === 'ESTRUCTURADA') {
      const noticiaInfo = extraerInformacionNoticia(input);
      return verificarFallbackEstructurado(noticiaInfo);
    } else {
      return verificarFallbackSimple(input);
    }
  }
}

module.exports = verificarConIA; 