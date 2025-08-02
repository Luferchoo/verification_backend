// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const verificarConIA = require('./ia/verificadorIA');
const extraerTextoDeLink = require('./utils/extraerTextoDeLink');

app.use(cors());
app.use(express.json());

app.post('/verificar', async (req, res) => {
  console.log('Body recibido:', req.body); 
  const { noticiaTexto } = req.body;

  try {
    let contenido = noticiaTexto;

    if (noticiaTexto.startsWith('http')) {
      contenido = await extraerTextoDeLink(noticiaTexto);
    }

    const resultado = await verificarConIA(contenido);

    res.json(resultado);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error procesando la noticia' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
