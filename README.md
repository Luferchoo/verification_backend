# Verificador de IA - Backend Web3

Un sistema de verificación de noticias y contenido usando inteligencia artificial para detectar información verdadera, falsa o no concluyente.

## 🚀 Características

- **Verificación de IA**: Análisis automático de contenido usando algoritmos de IA
- **API REST**: Endpoint para verificar noticias y textos
- **Extracción de texto**: Soporte para URLs y texto directo
- **Puntuación**: Sistema de scoring de 0-100 para confiabilidad
- **Fuentes**: Identificación automática de fuentes relevantes

## 📋 Requisitos

- Node.js (versión 14 o superior)
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd backend_web3
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📖 Uso

### API Endpoint

**POST** `/verificar`

Verifica la veracidad de un texto o noticia.

#### Parámetros

```json
{
  "noticiaTexto": "Texto a verificar"
}
```

#### Respuesta

```json
{
  "veredicto": "Posiblemente Verdadera" | "Posiblemente Falsa" | "No concluyente",
  "score": 85,
  "razonamiento": "El contenido contiene información que parece ser factual y verificable.",
  "fuenteCoincidente": "https://www.bolivia.gob.bo/"
}
```

### Ejemplos de uso

#### Con cURL
```bash
curl -X POST http://localhost:3000/verificar \
  -H "Content-Type: application/json" \
  -d '{"noticiaTexto":"Bolivia es un país de América del Sur"}'
```

#### Con JavaScript
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/verificar', {
  noticiaTexto: 'Bolivia es un país de América del Sur'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log(response.data);
```

## 🧪 Pruebas

Ejecuta las pruebas incluidas:

```bash
# Prueba básica
node test.js

# Prueba directa del verificador
node test-directo.js

# Prueba completa con múltiples casos
node test-completo.js
```

## 📁 Estructura del Proyecto

```
backend_web3/
├── app.js                 # Servidor principal
├── package.json           # Dependencias
├── ia/
│   └── verificadorIA.js  # Lógica del verificador de IA
├── utils/
│   └── extraerTextoDeLink.js  # Extracción de texto de URLs
├── test.js               # Prueba básica
├── test-directo.js       # Prueba directa del verificador
└── test-completo.js      # Pruebas completas
```

## 🔧 Configuración

### Variables de Entorno

El sistema está configurado para funcionar sin APIs externas. Si deseas usar Hugging Face:

1. Obtén un token de Hugging Face
2. Actualiza `ia/verificadorIA.js` con tu token
3. Cambia el modelo según tus necesidades

## 🎯 Algoritmo de Verificación

El verificador utiliza un algoritmo basado en:

1. **Análisis de palabras clave**: Identifica términos positivos y negativos
2. **Puntuación**: Calcula un score de 0-100 basado en el contenido
3. **Clasificación**: Determina el veredicto según el score:
   - ≥70: Posiblemente Verdadera
   - ≤30: Posiblemente Falsa
   - 31-69: No concluyente

### Palabras clave analizadas

**Positivas**: bolivia, país, américa, sur, continente, verdadero, confirmado, oficial
**Negativas**: falso, mentira, fake, noticia falsa, desmentido, rumor

## 🚀 Desarrollo

Para desarrollo con recarga automática:

```bash
npm run dev
```

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas, crea un issue en el repositorio. 