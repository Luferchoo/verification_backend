# Integración Blockchain - Verificador de Noticias

## Configuración

### 1. Instalar dependencias
```bash
npm install ethers web3
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la carpeta `backend_web3` con:

```env
# Configuración de Groq API
GROQ_API_KEY=tu_api_key_de_groq_aqui

# Configuración de Blockchain
RPC_URL=https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID
PRIVATE_KEY=tu_clave_privada_aqui
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Configuración del servidor
NODE_ENV=development
PORT=3000
```

## Cómo obtener las credenciales

### RPC_URL
1. Ve a [Infura](https://infura.io/) o [Alchemy](https://www.alchemy.com/)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia el RPC_URL

### PRIVATE_KEY
1. Crea una wallet (MetaMask, etc.)
2. Exporta la clave privada
3. **¡IMPORTANTE!** Solo usa una wallet de prueba con poco dinero

### CONTRACT_ADDRESS
- Dirección de tu smart contract (opcional)
- Si no tienes uno, se usará una dirección por defecto

## Endpoints disponibles

### 1. Verificar noticia y subir a blockchain
```bash
POST /verificar
{
  "noticiaTexto": "Texto de la noticia",
  "subirABlockchain": true
}
```

### 2. Subir verificación existente a blockchain
```bash
POST /subir-a-blockchain
{
  "noticiaTexto": "Texto de la noticia",
  "resultadoVerificacion": {
    "veredicto": "Posiblemente Verdadera",
    "score": 85,
    "razonamiento": "Explicación...",
    "fuenteCoincidente": null
  }
}
```

### 3. Verificar transacción
```bash
GET /verificar-transaccion/:hash
```

## Redes soportadas

- **Polygon Mumbai** (Testnet): `https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID`
- **Ethereum Goerli** (Testnet): `https://goerli.infura.io/v3/TU_PROJECT_ID`
- **BSC Testnet**: `https://data-seed-prebsc-1-s1.binance.org:8545/`

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca uses tu wallet principal
- Solo usa wallets de prueba
- No subas el archivo `.env` a GitHub
- Usa variables de entorno en producción 