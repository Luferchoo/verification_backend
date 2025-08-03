# Guía Completa: Validar Datos en Blockchain

## 🎯 Tu Transacción Exitosa

**Hash**: `0xe269af0dadcb20c2572960b252a01c635f013ca03259f5289843acf0b395a3dc`
**Bloque**: `8902132`
**Red**: Polygon Mumbai

## Métodos de Validación

### 1. 🌐 Verificar en PolygonScan (Mumbai)

**URL**: [https://mumbai.polygonscan.com/tx/0xe269af0dadcb20c2572960b252a01c635f013ca03259f5289843acf0b395a3dc](https://mumbai.polygonscan.com/tx/0xe269af0dadcb20c2572960b252a01c635f013ca03259f5289843acf0b395a3dc)

**Pasos**:
1. Ve al enlace de arriba
2. Verás todos los detalles de la transacción
3. En la sección "Input Data" verás los datos codificados
4. Los datos están en formato hexadecimal

### 2. 🔧 Usar tu API para verificar

```bash
curl -X GET http://localhost:3000/verificar-transaccion/0xe269af0dadcb20c2572960b252a01c635f013ca03259f5289843acf0b395a3dc
```

**Respuesta esperada**:
```json
{
  "success": true,
  "transactionHash": "0xe269af0dadcb20c2572960b252a01c635f013ca03259f5289843acf0b395a3dc",
  "from": "0x292B4Dcb2E48a37363a11623FfAC9062a5214b20",
  "to": "0x292B4Dcb2E48a37363a11623FfAC9062a5214b20",
  "blockNumber": 8902132,
  "gasUsed": "26380",
  "status": "Exitoso",
  "datos": {
    "noticiaTexto": "eva copa deja su postulacion a las elecciones",
    "veredicto": "Posiblemente Verdadera",
    "score": 80,
    "razonamiento": "Basado en fuentes oficiales...",
    "timestamp": 1703123456789,
    "verificacionHash": "0x..."
  }
}
```

### 3. 📊 Verificar datos específicos

```bash
curl -X POST http://localhost:3000/verificar-datos \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "eva copa deja su postulacion a las elecciones",
    "resultadoVerificacion": {
      "veredicto": "Posiblemente Verdadera",
      "score": 80,
      "razonamiento": "Basado en fuentes oficiales..."
    }
  }'
```

### 4. 🔍 Buscar en múltiples exploradores

#### Polygon Mumbai:
- **PolygonScan**: [https://mumbai.polygonscan.com/](https://mumbai.polygonscan.com/)
- **Blockscout**: [https://mumbai-blockscout.polygon.technology/](https://mumbai-blockscout.polygon.technology/)

#### Ethereum Mainnet:
- **Etherscan**: [https://etherscan.io/](https://etherscan.io/)
- **Blockscout**: [https://blockscout.com/](https://blockscout.com/)

## Validación Programática

### Script para verificar múltiples transacciones:

```javascript
const VerificadorBlockchain = require('./scripts/verificarTransaccion');

async function verificarTransacciones() {
  const verificador = new VerificadorBlockchain();
  
  const transacciones = [
    '0xe269af0dadcb20c2572960b252a01c635f013ca03259f5289843acf0b395a3dc',
    // Agrega más hashes aquí
  ];
  
  for (const hash of transacciones) {
    const resultado = await verificador.verificarTransaccion(hash);
    console.log(`Transacción ${hash}:`, resultado);
  }
}

verificarTransacciones();
```

### Verificar en tiempo real:

```javascript
// En tu aplicación
app.post('/verificar-tiempo-real', async (req, res) => {
  const { noticiaTexto, resultadoVerificacion } = req.body;
  
  try {
    // 1. Verificar con IA
    const resultadoIA = await verificarConIA(noticiaTexto);
    
    // 2. Si score >= 70%, subir a blockchain
    if (resultadoIA.score >= 70) {
      const blockchainService = new BlockchainService();
      const resultadoBlockchain = await blockchainService.subirVerificacion(noticiaTexto, resultadoIA);
      
      // 3. Verificar inmediatamente
      const VerificadorBlockchain = require('./scripts/verificarTransaccion');
      const verificador = new VerificadorBlockchain();
      const verificacion = await verificador.verificarTransaccion(resultadoBlockchain.transactionHash);
      
      return res.json({
        ia: resultadoIA,
        blockchain: resultadoBlockchain,
        verificacion: verificacion
      });
    }
    
    res.json({ ia: resultadoIA });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Validación con Smart Contract

Si usas el smart contract, puedes verificar así:

```javascript
// En Remix o con ethers.js
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Verificar si existe una verificación
const existe = await contract.verificarExistencia(verificacionHash);

// Obtener datos completos
const datos = await contract.obtenerVerificacion(verificacionHash);
```

## Herramientas de Validación

### 1. 🔧 Herramientas Web:
- **PolygonScan**: Para Polygon Mumbai
- **Etherscan**: Para Ethereum
- **Blockscout**: Explorador alternativo

### 2. 📱 APIs:
- **PolygonScan API**: Para consultas programáticas
- **Etherscan API**: Para Ethereum
- **Tu API personalizada**: Para verificaciones específicas

### 3. 🛠️ Scripts:
- **VerificadorBlockchain**: Script personalizado
- **Web3.js/Ethers.js**: Librerías de JavaScript
- **Python Web3**: Para scripts en Python

## Verificación de Integridad

### 1. ✅ Verificar Hash:
```javascript
const hashCalculado = ethers.keccak256(
  ethers.toUtf8Bytes(noticiaTexto + JSON.stringify(resultadoVerificacion))
);

const hashEnBlockchain = datos.verificacionHash;

const integridad = hashCalculado === hashEnBlockchain;
```

### 2. ✅ Verificar Timestamp:
```javascript
const timestampActual = Date.now();
const timestampBlockchain = datos.timestamp;
const diferencia = Math.abs(timestampActual - timestampBlockchain);

const esReciente = diferencia < 60000; // Menos de 1 minuto
```

### 3. ✅ Verificar Score:
```javascript
const scoreValido = datos.score >= 70;
const scoreCoincide = datos.score === resultadoVerificacion.score;
```

## Casos de Uso

### 🎯 Para Usuarios:
1. **Verificar noticia**: Buscar en blockchain
2. **Confirmar autenticidad**: Verificar hash
3. **Ver historial**: Buscar todas las verificaciones

### 🎯 Para Desarrolladores:
1. **Validar datos**: Verificar integridad
2. **Auditoría**: Revisar todas las transacciones
3. **Análisis**: Estadísticas de verificaciones

### 🎯 Para Periodistas:
1. **Verificar fuentes**: Confirmar en blockchain
2. **Trazabilidad**: Seguir el origen de la información
3. **Transparencia**: Todo es público y verificable

## Ventajas de esta Validación

✅ **Inmutable**: Los datos no se pueden modificar
✅ **Transparente**: Todo es público
✅ **Verificable**: Cualquiera puede verificar
✅ **Confiable**: No depende de servidores centralizados
✅ **Trazable**: Se puede seguir el origen
✅ **Económico**: Gas mínimo en Polygon 