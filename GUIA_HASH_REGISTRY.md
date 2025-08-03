# Guía: NewsHashRegistry - Verificación de Integridad

## 🎯 Propósito

El contrato `NewsHashRegistry.sol` permite **verificar la integridad** de las noticias mediante hashes, garantizando que el contenido no haya sido modificado fuera de blockchain.

## 🔗 Funcionalidades Principales

### 1. **Registro de Hashes**
- Almacena el hash (keccak256) del contenido de la noticia
- Incluye metadata adicional (veredicto, score, timestamp)
- Previene duplicados con modificadores

### 2. **Verificación de Integridad**
- Verifica si un contenido específico está registrado
- Compara hashes para detectar modificaciones
- Obtiene información completa del registro

### 3. **Estadísticas y Consultas**
- Contador de hashes registrados
- Información de registradores
- Consultas por hash o contenido

## 📋 Contrato Smart Contract

### Estructura de Datos:
```solidity
struct HashInfo {
    bool exists;
    uint256 timestamp;
    address registrador;
    string metadata; // JSON string
}
```

### Funciones Principales:
```solidity
// Registrar hash
function registerNewsHash(bytes32 hash, string memory metadata) public returns (bool)

// Verificar existencia
function existsHash(bytes32 hash) public view returns (bool)

// Verificar integridad por contenido
function verifyNewsIntegrity(string memory content) public view returns (bool)

// Obtener información completa
function getHashInfo(bytes32 hash) public view returns (bool, uint256, address, string)
```

## 🚀 API Endpoints

### 1. **Registrar Hash**
```bash
POST /registrar-hash
Content-Type: application/json

{
  "noticiaTexto": "Bolivia aprueba nueva ley educativa",
  "resultadoVerificacion": {
    "veredicto": "Posiblemente Verdadera",
    "score": 85,
    "metodo": "GROQ"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": 1234567,
  "contentHash": "0x...",
  "metadata": "{\"noticiaTexto\":\"...\",\"veredicto\":\"...\"}",
  "event": {
    "hash": "0x...",
    "registrador": "0x...",
    "timestamp": "1234567890",
    "metadata": "..."
  }
}
```

### 2. **Verificar Integridad por Hash**
```bash
GET /verificar-integridad/0x1234567890abcdef...
```

**Respuesta:**
```json
{
  "success": true,
  "existe": true,
  "timestamp": "1234567890",
  "registrador": "0x...",
  "metadata": "{\"noticiaTexto\":\"...\",\"veredicto\":\"...\"}"
}
```

### 3. **Verificar Integridad por Contenido**
```bash
POST /verificar-integridad-contenido
Content-Type: application/json

{
  "noticiaTexto": "Bolivia aprueba nueva ley educativa"
}
```

**Respuesta:**
```json
{
  "success": true,
  "integridad": true,
  "hash": "0x...",
  "timestamp": "1234567890",
  "registrador": "0x...",
  "metadata": "..."
}
```

### 4. **Estadísticas del Registry**
```bash
GET /estadisticas-hash-registry
```

**Respuesta:**
```json
{
  "success": true,
  "totalHashes": "15",
  "totalRegistradores": "3"
}
```

### 5. **Registro Múltiple**
```bash
POST /registrar-multiples-hashes
Content-Type: application/json

{
  "noticias": [
    {
      "texto": "Noticia 1",
      "resultado": {"veredicto": "Verdadera", "score": 85}
    },
    {
      "texto": "Noticia 2", 
      "resultado": {"veredicto": "Falsa", "score": 20}
    }
  ]
}
```

## 🧪 Probar el Sistema

### Ejecutar pruebas completas:
```bash
cd backend_web3
node scripts/probarHashRegistry.js
```

### Ejecutar solo verificación:
```bash
node scripts/probarHashRegistry.js --solo-verificacion
```

### Probar manualmente:
```bash
# 1. Registrar hash
curl -X POST http://localhost:3000/registrar-hash \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "Bolivia aprueba nueva ley educativa",
    "resultadoVerificacion": {
      "veredicto": "Posiblemente Verdadera",
      "score": 85
    }
  }'

# 2. Verificar integridad
curl -X POST http://localhost:3000/verificar-integridad-contenido \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "Bolivia aprueba nueva ley educativa"
  }'

# 3. Verificar contenido modificado
curl -X POST http://localhost:3000/verificar-integridad-contenido \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "Bolivia aprueba nueva ley educativa (MODIFICADO)"
  }'
```

## 🔧 Configuración

### Variables de Entorno (.env):
```env
# Blockchain
RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Contratos
HASH_REGISTRY_ADDRESS=0x... # Dirección del contrato desplegado
```

### Desplegar Contrato:
1. **Remix IDE**: Compilar y desplegar `NewsHashRegistry.sol`
2. **Verificar**: En PolygonScan con el código fuente
3. **Configurar**: Agregar `HASH_REGISTRY_ADDRESS` en `.env`

## 📊 Casos de Uso

### 1. **Registro Automático**
```javascript
// Después de verificar una noticia
const resultado = await verificarConIA(noticiaTexto);
if (resultado.score >= 70) {
  // Registrar hash para integridad
  const hashResult = await hashRegistryService.registrarHashNoticia(
    noticiaTexto, 
    resultado
  );
}
```

### 2. **Verificación de Integridad**
```javascript
// Antes de mostrar una noticia
const integridad = await hashRegistryService.verificarIntegridad(noticiaTexto);
if (integridad.integridad) {
  console.log('✅ Noticia verificada - Sin modificaciones');
} else {
  console.log('⚠️ Noticia modificada o no registrada');
}
```

### 3. **Detección de Modificaciones**
```javascript
// Comparar contenido original vs modificado
const original = "Bolivia aprueba nueva ley educativa";
const modificado = original + " (MODIFICADO)";

const integridadOriginal = await hashRegistryService.verificarIntegridad(original);
const integridadModificado = await hashRegistryService.verificarIntegridad(modificado);

console.log('Original:', integridadOriginal.integridad); // true
console.log('Modificado:', integridadModificado.integridad); // false
```

## 🎯 Ventajas del Hash Registry

### 1. **Integridad Garantizada**
- ✅ Hash inmutable en blockchain
- ✅ Detección de modificaciones
- ✅ Timestamp de registro

### 2. **Eficiencia**
- ✅ Solo almacena hashes (32 bytes)
- ✅ Consultas rápidas
- ✅ Bajo costo de gas

### 3. **Flexibilidad**
- ✅ Metadata personalizable
- ✅ Múltiples registradores
- ✅ Estadísticas completas

### 4. **Seguridad**
- ✅ Inmutabilidad blockchain
- ✅ Transparencia total
- ✅ Auditoría completa

## 🔄 Flujo de Integración

### 1. **Verificación + Registro**
```
Noticia → Verificar IA → Score ≥ 70% → Registrar Hash → Blockchain
```

### 2. **Consulta + Verificación**
```
Noticia → Calcular Hash → Consultar Blockchain → Verificar Integridad
```

### 3. **Detección de Modificaciones**
```
Contenido Modificado → Hash Diferente → No Encontrado → Alerta
```

## 📈 Próximos Pasos

1. **Desplegar contrato** en testnet
2. **Configurar variables** de entorno
3. **Probar funcionalidades** básicas
4. **Integrar con frontend** para verificación automática
5. **Implementar alertas** para contenido modificado

## ✅ Verificación de Implementación

```bash
# 1. Verificar configuración
curl http://localhost:3000/estadisticas

# 2. Probar registro
node scripts/probarHashRegistry.js

# 3. Verificar en blockchain
# Usar PolygonScan para ver transacciones
```

**¡El sistema de verificación de integridad está listo para usar!** 🔗 