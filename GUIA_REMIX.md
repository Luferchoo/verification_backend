# Guía Completa: Desplegar y Verificar Smart Contract en Remix

## Paso 1: Acceder a Remix

1. Ve a [https://remix.ethereum.org/](https://remix.ethereum.org/)
2. Es una aplicación web, no necesitas instalar nada

## Paso 2: Crear el archivo del contrato

1. **En Remix, ve a la carpeta `contracts`**
2. **Crea un nuevo archivo** llamado `VerificadorNoticias.sol`
3. **Copia y pega** el código del smart contract que está en `backend_web3/contracts/VerificadorNoticias.sol`

## Paso 3: Compilar el contrato

1. **Ve a la pestaña "Solidity Compiler"** (icono de compilador)
2. **Selecciona la versión de Solidity**: `0.8.0` o superior
3. **Haz clic en "Compile VerificadorNoticias.sol"**
4. **Verifica que no hay errores** (debería aparecer un ✓ verde)

## Paso 4: Desplegar el contrato

### Opción A: Polygon Mumbai (Recomendado para pruebas)

1. **Ve a la pestaña "Deploy & Run Transactions"**
2. **En "Environment" selecciona**: `Injected Provider - MetaMask`
3. **Conecta MetaMask** a Polygon Mumbai:
   - Red: Polygon Mumbai
   - RPC URL: `https://rpc-mumbai.maticvigil.com/`
   - Chain ID: `80001`
   - Símbolo: `MATIC`

4. **Haz clic en "Deploy"**
5. **Confirma la transacción** en MetaMask
6. **Copia la dirección del contrato** que aparece

### Opción B: Red local (Ganache)

1. **Instala Ganache** (aplicación de escritorio)
2. **En Remix, selecciona**: `Web3 Provider`
3. **URL**: `http://127.0.0.1:7545`
4. **Despliega el contrato**

## Paso 5: Verificar el contrato en PolygonScan

### Para Polygon Mumbai:

1. **Ve a [https://mumbai.polygonscan.com/](https://mumbai.polygonscan.com/)**
2. **Pega la dirección del contrato** en el buscador
3. **Haz clic en "Contract" → "Verify and Publish"**
4. **Selecciona**: `Solidity (Single file)`
5. **Compilador**: `v0.8.0+commit.c7dfd78e`
6. **Optimization**: `No`
7. **Pega el código fuente** del contrato
8. **Haz clic en "Verify and Publish"**

## Paso 6: Configurar el backend

### Actualizar el archivo `.env`:

```env
# Groq API
GROQ_API_KEY=tu_api_key_de_groq

# Blockchain
RPC_URL=https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID
PRIVATE_KEY=tu_clave_privada_aqui
CONTRACT_ADDRESS=0x... # Dirección del contrato desplegado
```

### Cambiar el servicio en `app.js`:

```javascript
const BlockchainService = require('./blockchain/blockchainServiceContract');
```

## Paso 7: Probar el contrato

### En Remix:

1. **Ve a la pestaña "Deploy & Run Transactions"**
2. **En "Deployed Contracts"** verás tu contrato
3. **Prueba la función `subirVerificacion`**:
   - `_noticiaTexto`: "El presidente confirmó las medidas"
   - `_veredicto`: "Posiblemente Verdadera"
   - `_score`: `85`
   - `_razonamiento`: "Basado en fuentes oficiales"

### En tu backend:

```bash
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "El presidente confirmó las nuevas medidas económicas"
  }'
```

## Paso 8: Verificar en PolygonScan

1. **Ve a la dirección del contrato** en PolygonScan
2. **Pestaña "Contract" → "Read Contract"**
3. **Prueba las funciones**:
   - `verificarExistencia`: Pega un hash de verificación
   - `obtenerVerificacion`: Obtiene los datos completos

## Funciones del Smart Contract

### 🔵 Funciones que modifican estado (requieren gas):
- `subirVerificacion()`: Sube una nueva verificación

### 🟢 Funciones de lectura (gratuitas):
- `obtenerVerificacion()`: Obtiene datos de una verificación
- `verificarExistencia()`: Verifica si existe una verificación
- `obtenerVerificacionesPorVerificador()`: Lista verificaciones de un usuario
- `obtenerEstadisticas()`: Estadísticas básicas

## Eventos emitidos:

- `VerificacionSubida`: Se emite cuando se sube una verificación

## Ventajas del Smart Contract:

✅ **Inmutable**: Los datos no se pueden modificar
✅ **Transparente**: Todo es público en la blockchain
✅ **Confiable**: No depende de servidores centralizados
✅ **Verificable**: Cualquiera puede verificar los datos
✅ **Económico**: Gas mínimo en Polygon

## Troubleshooting:

### Error: "Insufficient funds"
- Asegúrate de tener MATIC en tu wallet para gas

### Error: "Contract not verified"
- Sigue el paso 5 para verificar el contrato

### Error: "Function not found"
- Verifica que el ABI en el código coincida con el contrato

### Error: "Score debe ser mayor o igual a 70"
- El contrato solo acepta verificaciones con score ≥ 70 