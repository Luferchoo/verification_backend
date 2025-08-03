# Guía: SourceRegistry - Registro de Fuentes/Autores

## 🎯 Propósito

El contrato `SourceRegistry.sol` permite **registrar y verificar fuentes/autores confiables**, funcionando como un filtro o validador que puedes consultar en tiempo real antes o después de registrar una noticia.

## 👥 Funcionalidades Principales

### 1. **Registro de Fuentes**
- Registra medios de comunicación, autores y organizaciones
- Asigna trust score (0-100) para medir confiabilidad
- Incluye metadata completa (nombre, descripción, contacto)
- Sistema de admins para gestión centralizada

### 2. **Verificación de Credibilidad**
- Verifica si una fuente está registrada y es confiable
- Consulta trust score en tiempo real
- Valida fuentes con score mínimo requerido
- Gestión de fuentes activas/inactivas

### 3. **Gestión Administrativa**
- Sistema de admins con permisos especiales
- Actualización de trust scores
- Activación/desactivación de fuentes
- Estadísticas completas del registry

## 📋 Contrato Smart Contract

### Estructura de Datos:
```solidity
struct SourceInfo {
    bool isVerified;
    uint256 timestamp;
    address admin;
    string metadata; // JSON string
    uint256 trustScore; // 0-100
    string sourceType; // "author", "media", "organization"
    bool isActive;
}
```

### Funciones Principales:
```solidity
// Registrar fuente (solo admins)
function registerSource(address source, string metadata, uint256 trustScore, string sourceType) public

// Verificar fuente
function verifySource(address source) public view returns (bool)

// Verificar con score mínimo
function verifySourceWithMinScore(address source, uint256 minTrustScore) public view returns (bool)

// Obtener información completa
function getSourceInfo(address source) public view returns (bool, uint256, address, string, uint256, string, bool)
```

## 🚀 API Endpoints

### 1. **Registrar Fuente**
```bash
POST /registrar-fuente
Content-Type: application/json

{
  "sourceAddress": "0x1234567890123456789012345678901234567890",
  "sourceInfo": {
    "nombre": "La Razón",
    "descripcion": "Periódico boliviano de circulación nacional",
    "website": "https://www.la-razon.com",
    "email": "redaccion@la-razon.com",
    "telefono": "+591-2-123456",
    "pais": "Bolivia",
    "trustScore": 85,
    "sourceType": "media"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": 1234567,
  "sourceAddress": "0x...",
  "metadata": "{\"nombre\":\"La Razón\",\"descripcion\":\"...\"}",
  "event": {
    "source": "0x...",
    "admin": "0x...",
    "timestamp": "1234567890",
    "metadata": "..."
  }
}
```

### 2. **Verificar Fuente**
```bash
GET /verificar-fuente/0x1234567890123456789012345678901234567890
```

**Respuesta:**
```json
{
  "success": true,
  "esVerificada": true,
  "timestamp": "1234567890",
  "admin": "0x...",
  "metadata": "{\"nombre\":\"La Razón\",\"descripcion\":\"...\"}",
  "trustScore": "85",
  "sourceType": "media",
  "isActive": true
}
```

### 3. **Verificar Fuente con Score Mínimo**
```bash
POST /verificar-fuente-score
Content-Type: application/json

{
  "sourceAddress": "0x1234567890123456789012345678901234567890",
  "minTrustScore": 80
}
```

**Respuesta:**
```json
{
  "success": true,
  "cumpleRequisitos": true,
  "sourceAddress": "0x...",
  "minTrustScore": 80
}
```

### 4. **Actualizar Trust Score**
```bash
POST /actualizar-trust-score
Content-Type: application/json

{
  "sourceAddress": "0x1234567890123456789012345678901234567890",
  "nuevoTrustScore": 90
}
```

### 5. **Desactivar/Reactivar Fuente**
```bash
# Desactivar
POST /desactivar-fuente
Content-Type: application/json

{
  "sourceAddress": "0x1234567890123456789012345678901234567890"
}

# Reactivar
POST /reactivar-fuente
Content-Type: application/json

{
  "sourceAddress": "0x1234567890123456789012345678901234567890"
}
```

### 6. **Registro Múltiple**
```bash
POST /registrar-multiples-fuentes
Content-Type: application/json

{
  "fuentes": [
    {
      "address": "0x1111111111111111111111111111111111111111",
      "nombre": "El Deber",
      "descripcion": "Periódico de Santa Cruz",
      "website": "https://www.eldeber.com.bo",
      "trustScore": 82,
      "sourceType": "media"
    },
    {
      "address": "0x2222222222222222222222222222222222222222",
      "nombre": "Carlos Mendoza",
      "descripcion": "Periodista independiente",
      "trustScore": 75,
      "sourceType": "author"
    }
  ]
}
```

### 7. **Estadísticas del Registry**
```bash
GET /estadisticas-source-registry
```

**Respuesta:**
```json
{
  "success": true,
  "totalFuentes": "15",
  "totalFuentesVerificadas": "12",
  "totalAdmins": "3"
}
```

### 8. **Verificar si es Admin**
```bash
GET /verificar-admin
```

**Respuesta:**
```json
{
  "success": true,
  "esAdmin": true,
  "address": "0x..."
}
```

## 🧪 Probar el Sistema

### Ejecutar pruebas completas:
```bash
cd backend_web3
node scripts/probarSourceRegistry.js
```

### Ejecutar solo verificación:
```bash
node scripts/probarSourceRegistry.js --solo-verificacion
```

### Probar manualmente:
```bash
# 1. Verificar si eres admin
curl http://localhost:3000/verificar-admin

# 2. Registrar fuente
curl -X POST http://localhost:3000/registrar-fuente \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAddress": "0x1234567890123456789012345678901234567890",
    "sourceInfo": {
      "nombre": "La Razón",
      "descripcion": "Periódico boliviano",
      "trustScore": 85,
      "sourceType": "media"
    }
  }'

# 3. Verificar fuente
curl http://localhost:3000/verificar-fuente/0x1234567890123456789012345678901234567890

# 4. Verificar con score mínimo
curl -X POST http://localhost:3000/verificar-fuente-score \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAddress": "0x1234567890123456789012345678901234567890",
    "minTrustScore": 80
  }'
```

## 🔧 Configuración

### Variables de Entorno (.env):
```env
# Blockchain
RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Contratos
SOURCE_REGISTRY_ADDRESS=0x... # Dirección del contrato desplegado
```

### Desplegar Contrato:
1. **Remix IDE**: Compilar y desplegar `SourceRegistry.sol`
2. **Verificar**: En PolygonScan con el código fuente
3. **Configurar**: Agregar `SOURCE_REGISTRY_ADDRESS` en `.env`

## 📊 Casos de Uso

### 1. **Validación Antes de Publicar**
```javascript
// Antes de procesar una noticia
const sourceAddress = "0x1234567890123456789012345678901234567890";
const sourceVerification = await sourceRegistryService.verificarFuente(sourceAddress);

if (sourceVerification.esVerificada && sourceVerification.trustScore >= 70) {
  console.log('✅ Fuente confiable, proceder con verificación');
  // Continuar con verificación de IA
} else {
  console.log('⚠️ Fuente no verificada o score bajo');
  // Rechazar o marcar como no confiable
}
```

### 2. **Filtro por Confiabilidad**
```javascript
// Filtrar fuentes por nivel de confianza
const minTrustScore = 80;
const sourceVerification = await sourceRegistryService.verificarFuenteConScoreMinimo(
  sourceAddress, 
  minTrustScore
);

if (sourceVerification.cumpleRequisitos) {
  console.log('✅ Fuente de alta confianza');
} else {
  console.log('⚠️ Fuente no cumple requisitos mínimos');
}
```

### 3. **Gestión de Fuentes**
```javascript
// Registrar nueva fuente confiable
const sourceInfo = {
  nombre: "El Deber",
  descripcion: "Periódico de Santa Cruz",
  website: "https://www.eldeber.com.bo",
  trustScore: 85,
  sourceType: "media"
};

await sourceRegistryService.registrarFuente(sourceAddress, sourceInfo);

// Actualizar trust score
await sourceRegistryService.actualizarTrustScore(sourceAddress, 90);

// Desactivar fuente problemática
await sourceRegistryService.desactivarFuente(sourceAddress);
```

### 4. **Verificación Múltiple**
```javascript
// Verificar múltiples fuentes de una noticia
const sourceAddresses = [
  "0x1234567890123456789012345678901234567890",
  "0xabcdef1234567890abcdef1234567890abcdef12"
];

const verificaciones = await sourceRegistryService.verificarMultiplesFuentes(sourceAddresses);
const fuentesVerificadas = verificaciones.verificaciones.filter(v => v.esVerificada);

console.log(`${fuentesVerificadas.length}/${sourceAddresses.length} fuentes verificadas`);
```

## 🎯 Ventajas del Source Registry

### 1. **Credibilidad Garantizada**
- ✅ Fuentes verificadas en blockchain
- ✅ Trust score transparente
- ✅ Gestión centralizada por admins

### 2. **Flexibilidad**
- ✅ Múltiples tipos de fuente (media, author, organization)
- ✅ Metadata personalizable
- ✅ Score dinámico (0-100)

### 3. **Seguridad**
- ✅ Solo admins pueden registrar
- ✅ Fuentes pueden ser desactivadas
- ✅ Auditoría completa de cambios

### 4. **Eficiencia**
- ✅ Verificación en tiempo real
- ✅ Consultas múltiples en una transacción
- ✅ Estadísticas automáticas

## 🔄 Flujo de Integración

### 1. **Validación de Fuente**
```
Noticia → Extraer Fuente → Verificar en Registry → Score ≥ 70% → Procesar
```

### 2. **Registro de Nueva Fuente**
```
Admin → Evaluar Fuente → Registrar en Blockchain → Asignar Trust Score
```

### 3. **Gestión de Credibilidad**
```
Fuente Problemática → Desactivar → Revisar → Reactivar (si aplica)
```

## 📈 Tipos de Fuente

### **Media** (Medios de Comunicación)
- Periódicos, TV, radio, digital
- Trust Score: 70-95
- Ejemplo: La Razón, El Deber, ATB

### **Author** (Autores Individuales)
- Periodistas, columnistas, bloggers
- Trust Score: 50-85
- Ejemplo: Luis Fernández, María García

### **Organization** (Organizaciones)
- Gobiernos, ONGs, instituciones
- Trust Score: 80-100
- Ejemplo: Ministerio de Comunicación, ONU

## 🎯 Trust Score Guidelines

### **90-100**: Fuentes de máxima confianza
- Medios oficiales del gobierno
- Organizaciones internacionales reconocidas
- Periódicos de larga trayectoria

### **80-89**: Fuentes muy confiables
- Periódicos nacionales establecidos
- Medios con verificación editorial
- Organizaciones sin fines de lucro

### **70-79**: Fuentes confiables
- Medios regionales
- Periodistas acreditados
- Organizaciones locales

### **50-69**: Fuentes con reservas
- Medios independientes
- Bloggers verificados
- Fuentes nuevas

### **0-49**: Fuentes no verificadas
- Medios no conocidos
- Autores sin acreditación
- Fuentes anónimas

## 📈 Próximos Pasos

1. **Desplegar contrato** en testnet
2. **Configurar variables** de entorno
3. **Registrar fuentes** iniciales (medios principales)
4. **Integrar con frontend** para validación automática
5. **Implementar sistema** de reportes de fuentes

## ✅ Verificación de Implementación

```bash
# 1. Verificar configuración
curl http://localhost:3000/estadisticas

# 2. Probar registro
node scripts/probarSourceRegistry.js

# 3. Verificar en blockchain
# Usar PolygonScan para ver transacciones
```

**¡El sistema de registro de fuentes está listo para usar!** 👥 