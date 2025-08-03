// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const verificarConIA = require('./ia/verificadorIAEstructurado');
const extraerTextoDeLink = require('./utils/extraerTextoDeLink');
const BlockchainService = require('./blockchain/blockchainServiceSimple');
const BlockchainServiceHashRegistry = require('./blockchain/blockchainServiceHashRegistry');
const BlockchainServiceSourceRegistry = require('./blockchain/blockchainServiceSourceRegistry');

app.use(cors());
app.use(express.json());

app.post('/verificar', async (req, res) => {
  console.log('Body recibido:', req.body); 
  const { noticiaTexto } = req.body;

  try {
    let contenido = noticiaTexto;

    if (noticiaTexto.startsWith('http')) {
      contenido = await extraerTextoDeLink(noticiaTexto);
    }

    const resultado = await verificarConIA(contenido);

    // Verificar si el score alcanza el umbral para subir automáticamente a blockchain
    const umbral = global.UMBRAL_SCORE || 70;
    if (resultado.score >= umbral) {
      console.log(`Score alto (${resultado.score}% >= ${umbral}%), subiendo a blockchain...`);
      
      try {
        const blockchainService = new BlockchainService();
        const resultadoBlockchain = await blockchainService.subirVerificacion(contenido, resultado);
        
        return res.json({
          ...resultado,
          blockchain: resultadoBlockchain,
          subidoABlockchain: true,
          razonSubida: `Score alto (${resultado.score}% >= ${umbral}%)`
        });
      } catch (blockchainError) {
        console.error('Error subiendo a blockchain:', blockchainError.message);
        return res.json({
          ...resultado,
          blockchain: {
            success: false,
            error: blockchainError.message
          },
          subidoABlockchain: false,
          razonSubida: `Score alto (${resultado.score}% >= ${umbral}%) pero falló la subida`
        });
      }
    } else {
      console.log(`Score bajo (${resultado.score}% < ${umbral}%), no se sube a blockchain`);
      return res.json({
        ...resultado,
        subidoABlockchain: false,
        razonSubida: `Score bajo (${resultado.score}% < ${umbral}%)`
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error procesando la noticia' });
  }
});

// Nuevo endpoint para subir verificaciones existentes a blockchain
app.post('/subir-a-blockchain', async (req, res) => {
  const { noticiaTexto, resultadoVerificacion } = req.body;

  try {
    const blockchainService = new BlockchainService();
    const resultado = await blockchainService.subirVerificacion(noticiaTexto, resultadoVerificacion);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error subiendo a blockchain:', error.message);
    res.status(500).json({ error: 'Error subiendo a blockchain' });
  }
});

// Endpoint para verificar transacciones
app.get('/verificar-transaccion/:hash', async (req, res) => {
  const { hash } = req.params;

  try {
    const VerificadorBlockchain = require('./scripts/verificarTransaccion');
    const verificador = new VerificadorBlockchain();
    const resultado = await verificador.verificarTransaccion(hash);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando transacción:', error.message);
    res.status(500).json({ error: 'Error verificando transacción' });
  }
});

// Endpoint para verificar datos de una verificación
app.post('/verificar-datos', async (req, res) => {
  const { noticiaTexto, resultadoVerificacion } = req.body;

  try {
    const VerificadorBlockchain = require('./scripts/verificarTransaccion');
    const verificador = new VerificadorBlockchain();
    
    // Crear hash de la verificación
    const verificacionHash = ethers.keccak256(
      ethers.toUtf8Bytes(noticiaTexto + JSON.stringify(resultadoVerificacion))
    );
    
    res.json({
      verificacionHash: verificacionHash,
      mensaje: 'Hash creado. Usa este hash para buscar en blockchain'
    });
  } catch (error) {
    console.error('Error creando hash:', error.message);
    res.status(500).json({ error: 'Error creando hash' });
  }
});

// Endpoint para configurar el umbral de score
app.post('/configurar-umbral', (req, res) => {
  const { umbral } = req.body;
  
  if (typeof umbral !== 'number' || umbral < 0 || umbral > 100) {
    return res.status(400).json({ error: 'El umbral debe ser un número entre 0 y 100' });
  }
  
  // Por ahora usamos una variable global, en producción usarías una base de datos
  global.UMBRAL_SCORE = umbral;
  
  res.json({ 
    mensaje: `Umbral configurado a ${umbral}%`,
    umbral: umbral 
  });
});

// Endpoint para obtener estadísticas
app.get('/estadisticas', (req, res) => {
  res.json({
    umbralActual: global.UMBRAL_SCORE || 70,
    endpointsDisponibles: [
      'POST /verificar - Verificar noticia (automático blockchain si score >= 70%)',
      'POST /subir-a-blockchain - Subir verificación manual a blockchain',
      'GET /verificar-transaccion/:hash - Verificar transacción',
      'POST /configurar-umbral - Configurar umbral de score',
      'GET /estadisticas - Obtener estadísticas',
      'POST /registrar-hash - Registrar hash de noticia para integridad',
      'GET /verificar-integridad/:hash - Verificar integridad de noticia',
      'GET /estadisticas-hash-registry - Obtener estadísticas del hash registry',
      'POST /registrar-fuente - Registrar fuente/autor confiable',
      'GET /verificar-fuente/:address - Verificar fuente por dirección',
      'POST /verificar-fuente-score - Verificar fuente con score mínimo',
      'GET /estadisticas-source-registry - Obtener estadísticas del source registry'
    ]
  });
});

// Endpoint para registrar hash de noticia para verificación de integridad
app.post('/registrar-hash', async (req, res) => {
  const { noticiaTexto, resultadoVerificacion } = req.body;

  try {
    const hashRegistryService = new BlockchainServiceHashRegistry();
    const resultado = await hashRegistryService.registrarHashNoticia(noticiaTexto, resultadoVerificacion);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error registrando hash:', error.message);
    res.status(500).json({ error: 'Error registrando hash' });
  }
});

// Endpoint para verificar integridad de noticia
app.get('/verificar-integridad/:hash', async (req, res) => {
  const { hash } = req.params;

  try {
    const hashRegistryService = new BlockchainServiceHashRegistry();
    const resultado = await hashRegistryService.verificarHash(hash);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando integridad:', error.message);
    res.status(500).json({ error: 'Error verificando integridad' });
  }
});

// Endpoint para verificar integridad por contenido
app.post('/verificar-integridad-contenido', async (req, res) => {
  const { noticiaTexto } = req.body;

  try {
    const hashRegistryService = new BlockchainServiceHashRegistry();
    const resultado = await hashRegistryService.verificarIntegridad(noticiaTexto);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando integridad:', error.message);
    res.status(500).json({ error: 'Error verificando integridad' });
  }
});

// Endpoint para obtener estadísticas del hash registry
app.get('/estadisticas-hash-registry', async (req, res) => {
  try {
    const hashRegistryService = new BlockchainServiceHashRegistry();
    const resultado = await hashRegistryService.obtenerEstadisticas();
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// Endpoint para registrar múltiples hashes
app.post('/registrar-multiples-hashes', async (req, res) => {
  const { noticias } = req.body; // Array de {texto, resultado}

  try {
    const hashRegistryService = new BlockchainServiceHashRegistry();
    const resultado = await hashRegistryService.registrarMultiplesHashes(noticias);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error registrando múltiples hashes:', error.message);
    res.status(500).json({ error: 'Error registrando múltiples hashes' });
  }
});

// Endpoint para registrar fuente/autor confiable
app.post('/registrar-fuente', async (req, res) => {
  const { sourceAddress, sourceInfo } = req.body;

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.registrarFuente(sourceAddress, sourceInfo);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error registrando fuente:', error.message);
    res.status(500).json({ error: 'Error registrando fuente' });
  }
});

// Endpoint para verificar fuente por dirección
app.get('/verificar-fuente/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.verificarFuente(address);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando fuente:', error.message);
    res.status(500).json({ error: 'Error verificando fuente' });
  }
});

// Endpoint para verificar fuente con score mínimo
app.post('/verificar-fuente-score', async (req, res) => {
  const { sourceAddress, minTrustScore } = req.body;

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.verificarFuenteConScoreMinimo(sourceAddress, minTrustScore);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando fuente con score:', error.message);
    res.status(500).json({ error: 'Error verificando fuente con score' });
  }
});

// Endpoint para actualizar trust score de fuente
app.post('/actualizar-trust-score', async (req, res) => {
  const { sourceAddress, nuevoTrustScore } = req.body;

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.actualizarTrustScore(sourceAddress, nuevoTrustScore);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error actualizando trust score:', error.message);
    res.status(500).json({ error: 'Error actualizando trust score' });
  }
});

// Endpoint para desactivar fuente
app.post('/desactivar-fuente', async (req, res) => {
  const { sourceAddress } = req.body;

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.desactivarFuente(sourceAddress);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error desactivando fuente:', error.message);
    res.status(500).json({ error: 'Error desactivando fuente' });
  }
});

// Endpoint para reactivar fuente
app.post('/reactivar-fuente', async (req, res) => {
  const { sourceAddress } = req.body;

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.reactivarFuente(sourceAddress);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error reactivando fuente:', error.message);
    res.status(500).json({ error: 'Error reactivando fuente' });
  }
});

// Endpoint para registrar múltiples fuentes
app.post('/registrar-multiples-fuentes', async (req, res) => {
  const { fuentes } = req.body; // Array de objetos con información de fuentes

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.registrarMultiplesFuentes(fuentes);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error registrando múltiples fuentes:', error.message);
    res.status(500).json({ error: 'Error registrando múltiples fuentes' });
  }
});

// Endpoint para verificar múltiples fuentes
app.post('/verificar-multiples-fuentes', async (req, res) => {
  const { sourceAddresses } = req.body; // Array de direcciones

  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.verificarMultiplesFuentes(sourceAddresses);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando múltiples fuentes:', error.message);
    res.status(500).json({ error: 'Error verificando múltiples fuentes' });
  }
});

// Endpoint para obtener estadísticas del source registry
app.get('/estadisticas-source-registry', async (req, res) => {
  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.obtenerEstadisticas();
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// Endpoint para verificar si la dirección actual es admin
app.get('/verificar-admin', async (req, res) => {
  try {
    const sourceRegistryService = new BlockchainServiceSourceRegistry();
    const resultado = await sourceRegistryService.verificarSiEsAdmin();
    
    res.json(resultado);
  } catch (error) {
    console.error('Error verificando admin:', error.message);
    res.status(500).json({ error: 'Error verificando admin' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
