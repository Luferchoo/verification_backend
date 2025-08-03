# Verificador Automático con Blockchain

## Funcionalidad Automática

El sistema ahora **automáticamente sube a blockchain** las verificaciones que tengan un score de **70% o más**.

## Configuración

### 1. Variables de entorno necesarias
```env
# Groq API (para verificación de IA)
GROQ_API_KEY=tu_api_key_de_groq

# Blockchain (para subir verificaciones)
RPC_URL=https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID
PRIVATE_KEY=tu_clave_privada_aqui
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## Endpoints

### 1. Verificar noticia (automático blockchain)
```bash
POST /verificar
{
  "noticiaTexto": "Texto de la noticia"
}
```

**Respuesta:**
```json
{
  "veredicto": "Posiblemente Verdadera",
  "score": 85,
  "razonamiento": "Explicación...",
  "fuenteCoincidente": null,
  "subidoABlockchain": true,
  "razonSubida": "Score alto (85% >= 70%)",
  "blockchain": {
    "success": true,
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "verificacionHash": "0x..."
  }
}
```

### 2. Configurar umbral de score
```bash
POST /configurar-umbral
{
  "umbral": 80
}
```

### 3. Ver estadísticas
```bash
GET /estadisticas
```

## Comportamiento Automático

### ✅ Se sube automáticamente a blockchain si:
- Score >= 70% (por defecto)
- Score >= umbral configurado

### ❌ No se sube a blockchain si:
- Score < 70% (por defecto)
- Score < umbral configurado
- Error en la conexión blockchain

## Datos que se suben a blockchain

```json
{
  "noticiaTexto": "Texto de la noticia (limitado a 500 chars)",
  "veredicto": "Posiblemente Verdadera",
  "score": 85,
  "razonamiento": "Explicación del veredicto",
  "fuenteCoincidente": "URL de fuente",
  "timestamp": 1703123456789,
  "verificacionHash": "0x...",
  "verificador": "0x... (dirección de la wallet)"
}
```

## Ejemplos de uso

### Noticia con score alto (se sube automáticamente)
```bash
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "El presidente confirmó las nuevas medidas económicas que beneficiarán a la población"
  }'
```

### Noticia con score bajo (no se sube)
```bash
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "Alienígenas aterrizaron en La Paz"
  }'
```

### Cambiar umbral a 80%
```bash
curl -X POST http://localhost:3000/configurar-umbral \
  -H "Content-Type: application/json" \
  -d '{
    "umbral": 80
  }'
```

## Logs del servidor

El servidor mostrará logs como:
```
Score alto (85% >= 70%), subiendo a blockchain...
Transacción enviada: 0x1234567890abcdef...
Transacción confirmada en bloque: 12345
```

O:
```
Score bajo (45% < 70%), no se sube a blockchain
``` 