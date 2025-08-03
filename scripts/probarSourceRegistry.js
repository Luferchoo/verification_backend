const axios = require('axios');

// Ejemplo de fuentes para probar
const fuenteEjemplo = {
  sourceAddress: "0x1234567890123456789012345678901234567890",
  sourceInfo: {
    nombre: "La Razón",
    descripcion: "Periódico boliviano de circulación nacional",
    website: "https://www.la-razon.com",
    email: "redaccion@la-razon.com",
    telefono: "+591-2-123456",
    pais: "Bolivia",
    trustScore: 85,
    sourceType: "media"
  }
};

const autorEjemplo = {
  sourceAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
  sourceInfo: {
    nombre: "Luis Fernández",
    descripcion: "Periodista especializado en política",
    website: "",
    email: "luis.fernandez@email.com",
    telefono: "+591-700-123456",
    pais: "Bolivia",
    trustScore: 78,
    sourceType: "author"
  }
};

// Función para probar registro de fuente
async function probarRegistroFuente() {
  console.log('🧪 Probando registro de fuente...\n');
  
  try {
    console.log('📝 Registrando fuente:');
    console.log('Dirección:', fuenteEjemplo.sourceAddress);
    console.log('Nombre:', fuenteEjemplo.sourceInfo.nombre);
    console.log('Trust Score:', fuenteEjemplo.sourceInfo.trustScore);
    
    const response = await axios.post('http://localhost:3000/registrar-fuente', fuenteEjemplo);
    
    console.log('✅ Resultado del registro:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error registrando fuente:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar registro de autor
async function probarRegistroAutor() {
  console.log('\n🧪 Probando registro de autor...\n');
  
  try {
    console.log('📝 Registrando autor:');
    console.log('Dirección:', autorEjemplo.sourceAddress);
    console.log('Nombre:', autorEjemplo.sourceInfo.nombre);
    console.log('Trust Score:', autorEjemplo.sourceInfo.trustScore);
    
    const response = await axios.post('http://localhost:3000/registrar-fuente', autorEjemplo);
    
    console.log('✅ Resultado del registro:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error registrando autor:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar verificación de fuente
async function probarVerificacionFuente(address) {
  console.log('\n🔍 Probando verificación de fuente...\n');
  
  try {
    console.log(`🔗 Verificando fuente: ${address}`);
    
    const response = await axios.get(`http://localhost:3000/verificar-fuente/${address}`);
    
    console.log('✅ Resultado de verificación:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error verificando fuente:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar verificación con score mínimo
async function probarVerificacionConScore() {
  console.log('\n🔍 Probando verificación con score mínimo...\n');
  
  try {
    console.log('📊 Verificando fuente con score mínimo:');
    console.log('Dirección:', fuenteEjemplo.sourceAddress);
    console.log('Score mínimo requerido: 80');
    
    const response = await axios.post('http://localhost:3000/verificar-fuente-score', {
      sourceAddress: fuenteEjemplo.sourceAddress,
      minTrustScore: 80
    });
    
    console.log('✅ Resultado de verificación con score:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error verificando fuente con score:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar actualización de trust score
async function probarActualizacionTrustScore() {
  console.log('\n📝 Probando actualización de trust score...\n');
  
  try {
    console.log('📊 Actualizando trust score:');
    console.log('Dirección:', fuenteEjemplo.sourceAddress);
    console.log('Nuevo trust score: 90');
    
    const response = await axios.post('http://localhost:3000/actualizar-trust-score', {
      sourceAddress: fuenteEjemplo.sourceAddress,
      nuevoTrustScore: 90
    });
    
    console.log('✅ Resultado de actualización:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error actualizando trust score:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar desactivación de fuente
async function probarDesactivacionFuente() {
  console.log('\n🚫 Probando desactivación de fuente...\n');
  
  try {
    console.log('🚫 Desactivando fuente:');
    console.log('Dirección:', autorEjemplo.sourceAddress);
    
    const response = await axios.post('http://localhost:3000/desactivar-fuente', {
      sourceAddress: autorEjemplo.sourceAddress
    });
    
    console.log('✅ Resultado de desactivación:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error desactivando fuente:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar reactivación de fuente
async function probarReactivacionFuente() {
  console.log('\n✅ Probando reactivación de fuente...\n');
  
  try {
    console.log('✅ Reactivando fuente:');
    console.log('Dirección:', autorEjemplo.sourceAddress);
    
    const response = await axios.post('http://localhost:3000/reactivar-fuente', {
      sourceAddress: autorEjemplo.sourceAddress
    });
    
    console.log('✅ Resultado de reactivación:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error reactivando fuente:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para probar registro múltiple
async function probarRegistroMultiple() {
  console.log('\n📝 Probando registro múltiple de fuentes...\n');
  
  try {
    const fuentesMultiples = [
      {
        address: "0x1111111111111111111111111111111111111111",
        nombre: "El Deber",
        descripcion: "Periódico de Santa Cruz",
        website: "https://www.eldeber.com.bo",
        trustScore: 82,
        sourceType: "media"
      },
      {
        address: "0x2222222222222222222222222222222222222222",
        nombre: "Carlos Mendoza",
        descripcion: "Periodista independiente",
        website: "",
        trustScore: 75,
        sourceType: "author"
      },
      {
        address: "0x3333333333333333333333333333333333333333",
        nombre: "Ministerio de Comunicación",
        descripcion: "Fuente oficial del gobierno",
        website: "https://www.comunicacion.gob.bo",
        trustScore: 95,
        sourceType: "organization"
      }
    ];
    
    console.log(`📝 Registrando ${fuentesMultiples.length} fuentes...`);
    
    const response = await axios.post('http://localhost:3000/registrar-multiples-fuentes', {
      fuentes: fuentesMultiples
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

// Función para probar verificación múltiple
async function probarVerificacionMultiple() {
  console.log('\n🔍 Probando verificación múltiple de fuentes...\n');
  
  try {
    const addresses = [
      fuenteEjemplo.sourceAddress,
      autorEjemplo.sourceAddress,
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222"
    ];
    
    console.log(`🔍 Verificando ${addresses.length} fuentes...`);
    
    const response = await axios.post('http://localhost:3000/verificar-multiples-fuentes', {
      sourceAddresses: addresses
    });
    
    console.log('✅ Resultado de verificación múltiple:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error en verificación múltiple:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función para obtener estadísticas
async function obtenerEstadisticas() {
  console.log('\n📊 Obteniendo estadísticas del source registry...\n');
  
  try {
    const response = await axios.get('http://localhost:3000/estadisticas-source-registry');
    
    console.log('✅ Estadísticas del source registry:');
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

// Función para verificar si es admin
async function verificarSiEsAdmin() {
  console.log('\n👑 Verificando si es admin...\n');
  
  try {
    const response = await axios.get('http://localhost:3000/verificar-admin');
    
    console.log('✅ Resultado de verificación de admin:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error verificando admin:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    return null;
  }
}

// Función principal para ejecutar todas las pruebas
async function ejecutarPruebasCompletas() {
  console.log('🚀 Iniciando pruebas del SourceRegistry...\n');
  
  // 1. Verificar si es admin
  const adminResult = await verificarSiEsAdmin();
  if (!adminResult || !adminResult.success || !adminResult.esAdmin) {
    console.log('❌ No eres admin, no puedes registrar fuentes');
    return;
  }
  
  // 2. Registrar fuente
  const resultadoFuente = await probarRegistroFuente();
  if (!resultadoFuente || !resultadoFuente.success) {
    console.log('❌ Falló el registro de fuente, abortando pruebas');
    return;
  }
  
  // 3. Registrar autor
  await probarRegistroAutor();
  
  // 4. Verificar fuente
  await probarVerificacionFuente(fuenteEjemplo.sourceAddress);
  
  // 5. Verificar autor
  await probarVerificacionFuente(autorEjemplo.sourceAddress);
  
  // 6. Verificar con score mínimo
  await probarVerificacionConScore();
  
  // 7. Actualizar trust score
  await probarActualizacionTrustScore();
  
  // 8. Desactivar fuente
  await probarDesactivacionFuente();
  
  // 9. Reactivar fuente
  await probarReactivacionFuente();
  
  // 10. Registro múltiple
  await probarRegistroMultiple();
  
  // 11. Verificación múltiple
  await probarVerificacionMultiple();
  
  // 12. Estadísticas
  await obtenerEstadisticas();
  
  console.log('\n✅ Todas las pruebas completadas');
}

// Función para probar solo verificación
async function probarSoloVerificacion() {
  console.log('🔍 Probando solo verificación de fuentes...\n');
  
  await probarVerificacionFuente(fuenteEjemplo.sourceAddress);
  await probarVerificacionFuente(autorEjemplo.sourceAddress);
  await probarVerificacionConScore();
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
  probarRegistroFuente,
  probarRegistroAutor,
  probarVerificacionFuente,
  probarVerificacionConScore,
  probarActualizacionTrustScore,
  probarDesactivacionFuente,
  probarReactivacionFuente,
  probarRegistroMultiple,
  probarVerificacionMultiple,
  obtenerEstadisticas,
  verificarSiEsAdmin,
  ejecutarPruebasCompletas,
  fuenteEjemplo,
  autorEjemplo
}; 