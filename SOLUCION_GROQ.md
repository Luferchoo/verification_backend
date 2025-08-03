# Solución de Problemas: Error de Conectividad con Groq

## 🔍 Problema Identificado

**Error**: `getaddrinfo ENOTFOUND api.groq.com`
**Causa**: Problema de DNS o conectividad con la API de Groq

## 🛠️ Soluciones Implementadas

### 1. ✅ Mejorado el manejo de errores
- Timeout configurado a 30 segundos
- Manejo específico de errores de conectividad
- Logs detallados para diagnóstico

### 2. ✅ Sistema de fallback
- Cuando Groq falla, usa análisis básico local
- Mantiene la funcionalidad del sistema
- No interrumpe el flujo de blockchain

### 3. ✅ Script de diagnóstico
- Verifica conectividad paso a paso
- Identifica el problema específico
- Sugiere soluciones

## 🔧 Pasos para Solucionar

### Paso 1: Ejecutar diagnóstico
```bash
cd backend_web3
node scripts/diagnosticoGroq.js
```

### Paso 2: Verificar configuración
```bash
# Verificar que el archivo .env existe y tiene la API key
cat .env | grep GROQ_API_KEY
```

### Paso 3: Probar conectividad manual
```bash
# Probar DNS
nslookup api.groq.com

# Probar conectividad
ping api.groq.com

# Probar HTTPS
curl -I https://api.groq.com
```

## 🎯 Soluciones Específicas

### Problema: DNS no resuelve
**Solución**:
1. Cambiar DNS a Google (8.8.8.8) o Cloudflare (1.1.1.1)
2. Limpiar caché DNS: `ipconfig /flushdns` (Windows)
3. Reiniciar router

### Problema: Firewall bloquea
**Solución**:
1. Verificar configuración de firewall
2. Agregar excepción para Node.js
3. Permitir conexiones HTTPS salientes

### Problema: Proxy/VPN
**Solución**:
1. Desactivar VPN temporalmente
2. Configurar proxy en Node.js si es necesario
3. Verificar configuración de red corporativa

### Problema: API Key inválida
**Solución**:
1. Verificar API key en [console.groq.com](https://console.groq.com)
2. Regenerar nueva API key
3. Actualizar archivo `.env`

## 🚀 Funcionamiento Actual

### Con Groq disponible:
```
✅ Verificación con IA avanzada
✅ Score preciso
✅ Razonamiento detallado
✅ Subida a blockchain si score ≥ 70%
```

### Con Groq no disponible:
```
✅ Verificación de fallback
✅ Score básico pero funcional
✅ Análisis por palabras clave
✅ Subida a blockchain si score ≥ 70%
```

## 📊 Comparación de Métodos

| Característica | Groq | Fallback |
|----------------|------|----------|
| Precisión | Alta | Básica |
| Velocidad | Variable | Rápida |
| Conectividad | Requiere internet | Local |
| Score | 0-100 | 15-85 |
| Razonamiento | Detallado | Básico |

## 🔄 Cómo Cambiar entre Métodos

### Usar Groq (recomendado):
```javascript
const verificarConIA = require('./ia/verificadorIA');
```

### Usar Fallback (actual):
```javascript
const verificarConIA = require('./ia/verificadorIAFallback');
```

### Usar con reintentos:
```javascript
const verificarConIA = require('./ia/verificadorIAReintentos');
```

## 🎯 Próximos Pasos

1. **Ejecutar diagnóstico** para identificar el problema específico
2. **Aplicar solución** según el resultado del diagnóstico
3. **Probar conectividad** con una petición simple
4. **Cambiar a Groq** una vez solucionado el problema

## 📞 Soporte

Si el problema persiste:
1. Verificar logs del servidor
2. Ejecutar script de diagnóstico
3. Probar con diferentes redes
4. Contactar soporte de Groq si es necesario

## ✅ Verificación de Solución

Para verificar que el problema está solucionado:

```bash
# Probar verificación
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "El presidente anunció nuevas medidas económicas"
  }'
```

**Respuesta esperada**:
```json
{
  "veredicto": "Posiblemente Verdadera",
  "score": 85,
  "razonamiento": "Basado en fuentes oficiales...",
  "metodo": "GROQ",
  "subidoABlockchain": true
}
``` 