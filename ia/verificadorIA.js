// ia/verificadorIA.js
async function verificarConIA(texto) {
  // Simulación tonta basada en palabras clave
  const lowerTexto = texto.toLowerCase();

  if (lowerTexto.includes('ovni') || lowerTexto.includes('terraplanismo')) {
    return {
      veredicto: 'Posiblemente Falsa',
      score: 82,
      fuenteCoincidente: null,
    };
  }

  if (lowerTexto.includes('ministerio de salud') || lowerTexto.includes('presidente')) {
    return {
      veredicto: 'Posiblemente Verdadera',
      score: 90,
      fuenteCoincidente: 'https://abi.bo',
    };
  }

  return {
    veredicto: 'No concluyente',
    score: 50,
    fuenteCoincidente: null,
  };
}

module.exports = verificarConIA;
