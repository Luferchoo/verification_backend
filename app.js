// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const verificarConIA = require('./ia/verificadorIA');
const extraerTextoDeLink = require('./utils/extraerTextoDeLink');
const BlockchainService = require('./blockchain/blockchainServiceSimple');

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
      'GET /estadisticas - Obtener estadísticas'
    ]
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
