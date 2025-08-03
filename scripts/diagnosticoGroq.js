const axios = require('axios');
require('dotenv').config();

async function diagnosticarGroq() {
  console.log('🔍 Diagnóstico de conectividad con Groq...\n');
  
  // 1. Verificar variables de entorno
  console.log('1. Verificando configuración:');
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  
  console.log(`   API Key configurada: ${GROQ_API_KEY ? '✅ Sí' : '❌ No'}`);
  console.log(`   URL de API: ${GROQ_API_URL}`);
  
  if (!GROQ_API_KEY) {
    console.log('\n❌ ERROR: GROQ_API_KEY no está configurada en .env');
    console.log('   Solución: Agrega GROQ_API_KEY=tu_api_key_aqui en el archivo .env');
    return;
  }
  
  // 2. Verificar conectividad básica
  console.log('\n2. Verificando conectividad básica:');
  try {
    const pingResponse = await axios.get('https://api.groq.com/health', { timeout: 5000 });
    console.log('   ✅ Conectividad básica: OK');
  } catch (error) {
    console.log('   ❌ Conectividad básica: FALLÓ');
    console.log(`   Error: ${error.message}`);
  }
  
  // 3. Verificar DNS
  console.log('\n3. Verificando resolución DNS:');
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4('api.groq.com');
    console.log('   ✅ DNS resuelto correctamente');
    console.log(`   IPs: ${addresses.join(', ')}`);
  } catch (error) {
    console.log('   ❌ Error resolviendo DNS');
    console.log(`   Error: ${error.message}`);
  }
  
  // 4. Probar petición simple
  console.log('\n4. Probando petición simple:');
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'user', content: 'Hola' }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('   ✅ Petición exitosa');
    console.log(`   Status: ${response.status}`);
    
  } catch (error) {
    console.log('   ❌ Error en petición');
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  // 5. Verificar configuración de red
  console.log('\n5. Verificando configuración de red:');
  console.log(`   Timeout configurado: 30 segundos`);
  console.log(`   User-Agent: ${axios.defaults.headers.common['User-Agent'] || 'No configurado'}`);
  
  // 6. Sugerencias
  console.log('\n6. Sugerencias:');
  console.log('   - Verifica tu conexión a internet');
  console.log('   - Asegúrate de que tu API key sea válida');
  console.log('   - Verifica que no haya firewall bloqueando la conexión');
  console.log('   - Si usas proxy, configúralo correctamente');
  
  console.log('\n✅ Diagnóstico completado');
}

// Ejecutar diagnóstico
diagnosticarGroq().catch(console.error); 