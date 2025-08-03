const axios = require('axios');

// Ejemplo de noticia estructurada
const noticiaEstructurada = {
  "noticia": {
    "titular": "Bolivia aprueba nueva ley educativa",
    "fecha": "2025-08-03",
    "autor": "Luis Fernández",
    "lugar": "La Paz, Bolivia",
    "categoria": "Educación",
    "fuente": "https://www.la-razon.com/nacional/educacion/2025/08/03/ley-educativa",
    "cuerpo": "El gobierno boliviano aprobó una nueva ley educativa que busca modernizar el currículo escolar en todos los niveles. La reforma incluye actualizaciones en materias como tecnología, ciencias y humanidades. El Ministerio de Educación confirmó que la implementación comenzará en 2026.",
    
    "analisis_semantico": {
      "entidades_nombradas": [
        "Gobierno de Bolivia",
        "Ministerio de Educación",
        "Evo Morales"
      ],
      "sentimiento": "Neutral",
      "veracidad_estimada": {
        "valor": 85,
        "estado": "Posiblemente Verdadera"
      },
      "intencion_comunicativa": "Informar",
      "resumen": "Bolivia implementa reforma educativa en 2025"
    }
  }
};

// Ejemplo de noticia falsa estructurada
const noticiaFalsaEstructurada = {
  "noticia": {
    "titular": "Alienígenas visitan La Paz en busca de tecnología",
    "fecha": "2025-08-03",
    "autor": "Anónimo",
    "lugar": "La Paz, Bolivia",
    "categoria": "Tecnología",
    "fuente": "https://sitio-falso.com/noticias/alienigenas",
    "cuerpo": "Según fuentes no confirmadas, seres extraterrestres han estado visitando La Paz en busca de tecnología avanzada. Los testigos afirman haber visto luces misteriosas en el cielo nocturno.",
    
    "analisis_semantico": {
      "entidades_nombradas": [
        "Alienígenas",
        "La Paz",
        "Testigos"
      ],
      "sentimiento": "Misterioso",
      "veracidad_estimada": {
        "valor": 15,
        "estado": "Posiblemente Falsa"
      },
      "intencion_comunicativa": "Sensacionalizar",
      "resumen": "Avistamientos de alienígenas en La Paz"
    }
  }
};

async function probarNoticiaEstructurada() {
  console.log('🧪 Probando verificador con noticias estructuradas...\n');
  
  try {
    // Probar noticia verdadera estructurada
    console.log('📰 Probando noticia estructurada (verdadera):');
    console.log('Titular:', noticiaEstructurada.noticia.titular);
    
    const response1 = await axios.post('http://localhost:3000/verificar', {
      noticiaTexto: JSON.stringify(noticiaEstructurada)
    });
    
    console.log('✅ Resultado:');
    console.log(JSON.stringify(response1.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Probar noticia falsa estructurada
    console.log('📰 Probando noticia estructurada (falsa):');
    console.log('Titular:', noticiaFalsaEstructurada.noticia.titular);
    
    const response2 = await axios.post('http://localhost:3000/verificar', {
      noticiaTexto: JSON.stringify(noticiaFalsaEstructurada)
    });
    
    console.log('✅ Resultado:');
    console.log(JSON.stringify(response2.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Probar texto simple para comparar
    console.log('📰 Probando texto simple:');
    const textoSimple = "El presidente anunció nuevas medidas económicas para Bolivia";
    
    const response3 = await axios.post('http://localhost:3000/verificar', {
      noticiaTexto: textoSimple
    });
    
    console.log('✅ Resultado:');
    console.log(JSON.stringify(response3.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

// Función para probar diferentes tipos de input
async function probarDiferentesTipos() {
  console.log('🔍 Probando diferentes tipos de input...\n');
  
  const casos = [
    {
      nombre: 'Texto simple',
      input: "Bolivia aprueba nueva ley educativa"
    },
    {
      nombre: 'JSON string',
      input: JSON.stringify(noticiaEstructurada)
    },
    {
      nombre: 'Objeto directo',
      input: noticiaEstructurada
    }
  ];
  
  for (const caso of casos) {
    console.log(`📝 Caso: ${caso.nombre}`);
    try {
      const response = await axios.post('http://localhost:3000/verificar', {
        noticiaTexto: caso.input
      });
      
      console.log(`✅ Tipo detectado: ${response.data.tipo_input || 'N/A'}`);
      console.log(`✅ Método usado: ${response.data.metodo || 'N/A'}`);
      console.log(`✅ Score: ${response.data.score}%`);
      console.log(`✅ Veredicto: ${response.data.veredicto}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error en caso "${caso.nombre}":`, error.message);
    }
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas del verificador estructurado...\n');
  
  await probarNoticiaEstructurada();
  console.log('\n');
  await probarDiferentesTipos();
  
  console.log('\n✅ Pruebas completadas');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = {
  probarNoticiaEstructurada,
  probarDiferentesTipos,
  noticiaEstructurada,
  noticiaFalsaEstructurada
}; 