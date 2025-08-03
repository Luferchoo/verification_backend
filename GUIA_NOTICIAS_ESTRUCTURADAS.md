# Guía: Verificador de Noticias Estructuradas

## 🎯 Nuevas Capacidades

El verificador ahora puede procesar **noticias estructuradas** con análisis semántico previo, además del texto simple tradicional.

## 📊 Tipos de Input Soportados

### 1. **Texto Simple** (tradicional)
```json
{
  "noticiaTexto": "Bolivia aprueba nueva ley educativa"
}
```

### 2. **Noticia Estructurada** (nuevo)
```json
{
  "noticiaTexto": {
    "noticia": {
      "titular": "Bolivia aprueba nueva ley educativa",
      "fecha": "2025-08-03",
      "autor": "Luis Fernández",
      "lugar": "La Paz, Bolivia",
      "categoria": "Educación",
      "fuente": "https://www.la-razon.com/nacional/educacion/2025/08/03/ley-educativa",
      "cuerpo": "El gobierno boliviano aprobó una nueva ley educativa...",
      "analisis_semantico": {
        "entidades_nombradas": ["Gobierno de Bolivia", "Ministerio de Educación"],
        "sentimiento": "Neutral",
        "veracidad_estimada": {
          "valor": 85,
          "estado": "Posiblemente Verdadera"
        },
        "intencion_comunicativa": "Informar",
        "resumen": "Bolivia implementa reforma educativa en 2025"
      }
    }
  }
}
```

### 3. **JSON String** (alternativo)
```json
{
  "noticiaTexto": "{\"noticia\":{\"titular\":\"...\",\"fecha\":\"...\"}}"
}
```

## 🔍 Detección Automática

El sistema detecta automáticamente el tipo de input:

- **ESTRUCTURADA**: Si contiene `noticia` con campos estructurados
- **TEXTO_SIMPLE**: Si es texto plano o no tiene estructura

## 📈 Análisis Mejorado

### Para Noticias Estructuradas:
- ✅ **Análisis por categoría**: Educación, Política, Economía, Salud, Tecnología
- ✅ **Factores múltiples**: Fuente, fecha, autor, entidades nombradas
- ✅ **Score más preciso**: Basado en múltiples indicadores
- ✅ **Metadata enriquecida**: Información adicional del análisis

### Para Texto Simple:
- ✅ **Análisis básico**: Palabras clave de credibilidad
- ✅ **Score estándar**: 0-100 basado en indicadores simples
- ✅ **Compatibilidad**: Funciona como antes

## 🧪 Probar el Sistema

### Ejecutar pruebas completas:
```bash
cd backend_web3
node scripts/probarNoticiaEstructurada.js
```

### Probar manualmente:
```bash
# Noticia estructurada
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": {
      "noticia": {
        "titular": "Bolivia aprueba nueva ley educativa",
        "fecha": "2025-08-03",
        "categoria": "Educación",
        "fuente": "https://www.la-razon.com/nacional/educacion/2025/08/03/ley-educativa",
        "cuerpo": "El gobierno boliviano aprobó una nueva ley educativa..."
      }
    }
  }'

# Texto simple
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "noticiaTexto": "Bolivia aprueba nueva ley educativa"
  }'
```

## 📊 Respuestas del Sistema

### Respuesta para Noticia Estructurada:
```json
{
  "veredicto": "Posiblemente Verdadera",
  "score": 88,
  "razonamiento": "Basado en fuentes oficiales y entidades gubernamentales identificadas.",
  "fuenteCoincidente": "https://www.la-razon.com/nacional/educacion/2025/08/03/ley-educativa",
  "entidades_identificadas": ["Gobierno de Bolivia", "Ministerio de Educación"],
  "categoria_verificada": "Educación",
  "confianza_analisis": "Alta",
  "metodo": "GROQ",
  "tipo_input": "ESTRUCTURADA",
  "metadata": {
    "categoria": "Educación",
    "fecha": "2025-08-03",
    "autor": "Luis Fernández",
    "lugar": "La Paz, Bolivia",
    "entidades": ["Gobierno de Bolivia", "Ministerio de Educación", "Evo Morales"]
  },
  "subidoABlockchain": true,
  "razonSubida": "Score alto (88% >= 70%)"
}
```

### Respuesta para Texto Simple:
```json
{
  "veredicto": "Posiblemente Verdadera",
  "score": 75,
  "razonamiento": "Contiene 2 indicadores de credibilidad.",
  "fuenteCoincidente": null,
  "metodo": "FALLBACK_SIMPLE",
  "tipo_input": "TEXTO_SIMPLE",
  "subidoABlockchain": true,
  "razonSubida": "Score alto (75% >= 70%)"
}
```

## 🎯 Ventajas del Sistema Estructurado

### 1. **Mayor Precisión**
- Análisis por categoría específica
- Consideración de múltiples factores
- Score más granular y preciso

### 2. **Información Enriquecida**
- Metadata completa de la noticia
- Entidades nombradas identificadas
- Análisis semántico previo

### 3. **Flexibilidad**
- Compatible con texto simple
- Detección automática de formato
- Fallback robusto

### 4. **Blockchain Ready**
- Subida automática si score ≥ 70%
- Metadata completa en blockchain
- Trazabilidad mejorada

## 🔧 Configuración

### Cambiar entre métodos:
```javascript
// Usar verificador estructurado (actual)
const verificarConIA = require('./ia/verificadorIAEstructurado');

// Usar verificador simple
const verificarConIA = require('./ia/verificadorIAFallback');

// Usar verificador original
const verificarConIA = require('./ia/verificadorIA');
```

## 📝 Ejemplos de Uso

### Frontend (Angular):
```typescript
// Noticia estructurada
const noticiaEstructurada = {
  noticia: {
    titular: "Bolivia aprueba nueva ley educativa",
    fecha: "2025-08-03",
    categoria: "Educación",
    fuente: "https://www.la-razon.com/nacional/educacion/2025/08/03/ley-educativa",
    cuerpo: "El gobierno boliviano aprobó una nueva ley educativa...",
    analisis_semantico: {
      entidades_nombradas: ["Gobierno de Bolivia", "Ministerio de Educación"],
      sentimiento: "Neutral",
      veracidad_estimada: { valor: 85, estado: "Posiblemente Verdadera" }
    }
  }
};

this.http.post('/verificar', { noticiaTexto: noticiaEstructurada })
  .subscribe(response => {
    console.log('Resultado:', response);
  });
```

### API REST:
```bash
# POST /verificar
# Acepta tanto texto simple como noticias estructuradas
# Respuesta incluye tipo_input y metadata
```

## 🚀 Próximos Pasos

1. **Probar el sistema** con diferentes tipos de noticias
2. **Integrar en frontend** para manejar noticias estructuradas
3. **Optimizar análisis** por categoría específica
4. **Expandir entidades** para mejor reconocimiento

## ✅ Verificación

Para verificar que todo funciona:

```bash
# 1. Iniciar servidor
cd backend_web3
npm start

# 2. Ejecutar pruebas
node scripts/probarNoticiaEstructurada.js

# 3. Verificar endpoints
curl http://localhost:3000/estadisticas
```

**¡El sistema ahora maneja noticias estructuradas con análisis semántico avanzado!** 🎉 