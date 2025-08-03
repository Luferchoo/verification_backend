# Configuración Blockchain Simplificada

## Problemas Solucionados

✅ **Error de ethers**: Arreglado el problema con `getBalance`
✅ **Transacción fallida**: Ahora usa transacciones simples sin smart contract
✅ **Datos vacíos**: Los datos se codifican correctamente

## Configuración Mínima

### 1. Crear archivo `.env`
```env
# Groq API (para verificación de IA)
GROQ_API_KEY=tu_api_key_de_groq

# Blockchain (configuración mínima)
RPC_URL=https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID
PRIVATE_KEY=tu_clave_privada_aqui
```

### 2. Obtener RPC_URL (Infura)
1. Ve a [https://infura.io/](https://infura.io/)
2. Crea cuenta gratuita
3. Crea nuevo proyecto
4. Ve a "Settings" → "Keys"
5. Copia el "Project ID"
6. RPC_URL = `https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID`

### 3. Obtener PRIVATE_KEY
1. Crea wallet de prueba en MetaMask
2. Ve a "Account Details" → "Export Private Key"
3. Copia la clave (empieza con `0x`)

## Cómo Funciona Ahora

### ✅ Transacción Simple
- Envía datos a la misma wallet
- No requiere smart contract
- Datos se guardan en el campo `data` de la transacción
- Funciona en cualquier red (Polygon, Ethereum, etc.)

### 📊 Datos que se Suben
```json
{
  "noticiaTexto": "Texto de la noticia",
  "veredicto": "Posiblemente Verdadera",
  "score": 85,
  "razonamiento": "Explicación...",
  "timestamp": 1703123456789,
  "verificacionHash": "0x..."
}
```

## Prueba Rápida

1. **Configura las credenciales** en `.env`
2. **Reinicia el servidor**
3. **Prueba con una noticia**:
```bash
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "El presidente confirmó las nuevas medidas económicas"
  }'
```

## Logs Esperados

```
Score alto (85% >= 70%), subiendo a blockchain...
Conectado a blockchain. Balance: 0.1 ETH
Transacción enviada: 0x1234567890abcdef...
Transacción confirmada en bloque: 12345
```

## Ventajas de esta Solución

✅ **Simple**: No requiere smart contract
✅ **Compatible**: Funciona en cualquier red
✅ **Económico**: Gas mínimo
✅ **Confiable**: Transacciones simples
✅ **Escalable**: Fácil de implementar 