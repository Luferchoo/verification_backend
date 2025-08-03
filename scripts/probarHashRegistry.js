const axios = require('axios');

// Ejemplo de noticia para probar
const noticiaEjemplo = {
  noticiaTexto: "Bolivia aprueba nueva ley educativa que moderniza el currículo escolar",
  resultadoVerificacion: {
    veredicto: "Posiblemente Verdadera",
    score: 85,
    razonamiento: "Basado en fuentes oficiales y entidades gubernamentales",
    metodo: "GROQ",
    tipo_input: "ESTRUCTURADA"
  }
};

// Función para probar registro de hash
async function probarRegistroHash() {
  console.log('🧪 Probando registro de hash para integridad...\n');
  
  try {
    console.log('📝 Registrando hash de noticia:');
    console.log('Texto:', noticiaEjemplo.noticiaTexto);
    console.log('Score:', noticiaEjemplo.resultadoVerificacion.score);
    
    const response = await axios.post('http://localhost:3000/registrar-hash', noticiaEjemplo);
    
    console.log('✅ Resultado del registro:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error registrando hash:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar verificación de integridad
async function probarVerificacionIntegridad(hash) {
  console.log('\n🔍 Probando verificación de integridad...\n');
  
  try {
    console.log(`🔗 Verificando hash: ${hash}`);
    
    const response = await axios.get(`http://localhost:3000/verificar-integridad/${hash}`);
    
    console.log('✅ Resultado de verificación:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar verificación por contenido
async function probarVerificacionPorContenido() {
  console.log('\n🔍 Probando verificación por contenido...\n');
  
  try {
    console.log('📝 Verificando integridad del contenido original:');
    console.log('Texto:', noticiaEjemplo.noticiaTexto);
    
    const response = await axios.post('http://localhost:3000/verificar-integridad-contenido', {
      noticiaTexto: noticiaEjemplo.noticiaTexto
    });
    
    console.log('✅ Resultado de verificación por contenido:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error verificando integridad por contenido:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar verificación de contenido modificado
async function probarContenidoModificado() {
  console.log('\n🔍 Probando verificación de contenido modificado...\n');
  
  try {
    const contenidoModificado = noticiaEjemplo.noticiaTexto + " (MODIFICADO)";
    console.log('📝 Verificando integridad del contenido modificado:');
    console.log('Texto:', contenidoModificado);
    
    const response = await axios.post('http://localhost:3000/verificar-integridad-contenido', {
      noticiaTexto: contenidoModificado
    });
    
    console.log('✅ Resultado de verificación de contenido modificado:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error verificando contenido modificado:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para obtener estadísticas
async function obtenerEstadisticas() {
  console.log('\n📊 Obteniendo estadísticas del hash registry...\n');
  
  try {
    const response = await axios.get('http://localhost:3000/estadisticas-hash-registry');
    
    console.log('✅ Estadísticas del hash registry:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar registro múltiple
async function probarRegistroMultiple() {
  console.log('\n📝 Probando registro múltiple de hashes...\n');
  
  try {
    const noticiasMultiples = [
      {
        texto: "Bolivia aprueba nueva ley educativa",
        resultado: {
          veredicto: "Posiblemente Verdadera",
          score: 85
        }
      },
      {
        texto: "El presidente anunció medidas económicas",
        resultado: {
          veredicto: "Posiblemente Verdadera",
          score: 78
        }
      },
      {
        texto: "Alienígenas visitan La Paz",
        resultado: {
          veredicto: "Posiblemente Falsa",
          score: 15
        }
      }
    ];
    
    console.log(`📝 Registrando ${noticiasMultiples.length} hashes...`);
    
    const response = await axios.post('http://localhost:3000/registrar-multiples-hashes', {
      noticias: noticiasMultiples
    });
    
    console.log('✅ Resultado del registro múltiple:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error en registro múltiple:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función principal para ejecutar todas las pruebas
async function ejecutarPruebasCompletas() {
  console.log('🚀 Iniciando pruebas del NewsHashRegistry...\n');
  
  // 1. Registrar hash
  const resultadoRegistro = await probarRegistroHash();
  if (!resultadoRegistro || !resultadoRegistro.success) {
    console.log('❌ Falló el registro de hash, abortando pruebas');
    return;
  }
  
  // 2. Verificar integridad por hash
  await probarVerificacionIntegridad(resultadoRegistro.contentHash);
  
  // 3. Verificar integridad por contenido
  await probarVerificacionPorContenido();
  
  // 4. Verificar contenido modificado
  await probarContenidoModificado();
  
  // 5. Obtener estadísticas
  await obtenerEstadisticas();
  
  // 6. Probar registro múltiple
  await probarRegistroMultiple();
  
  console.log('\n✅ Todas las pruebas completadas');
}

// Función para probar solo verificación
async function probarSoloVerificacion() {
  console.log('🔍 Probando solo verificación de integridad...\n');
  
  // Hash de ejemplo (debería existir si ya se registró)
  const hashEjemplo = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  
  await probarVerificacionIntegridad(hashEjemplo);
  await probarVerificacionPorContenido();
  await probarContenidoModificado();
  await obtenerEstadisticas();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--solo-verificacion')) {
    probarSoloVerificacion().catch(console.error);
  } else {
    ejecutarPruebasCompletas().catch(console.error);
  }
}

module.exports = {
  probarRegistroHash,
  probarVerificacionIntegridad,
  probarVerificacionPorContenido,
  probarContenidoModificado,
  obtenerEstadisticas,
  probarRegistroMultiple,
  ejecutarPruebasCompletas,
  noticiaEjemplo
}; 