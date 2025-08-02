// utils/extraerTextoDeLink.js
const axios = require('axios');

async function extraerTextoDeLink(url) {
  try {
    const { data } = await axios.get(url);
    const textoPlano = data.replace(/<[^>]+>/g, '').slice(0, 2000);
    return textoPlano;
  } catch (err) {
    throw new Error('No se pudo extraer contenido del link');
  }
}

module.exports = extraerTextoDeLink;
