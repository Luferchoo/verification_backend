const { ethers } = require('ethers');
require('dotenv').config();

class VerificadorBlockchain {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }

  // Verificar una transacción específica
  async verificarTransaccion(txHash) {
    try {
      console.log(`Verificando transacción: ${txHash}`);
      
      // Obtener datos de la transacción
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!tx) {
        throw new Error('Transacción no encontrada');
      }

      // Decodificar datos si no están vacíos
      let datosDecodificados = null;
      if (tx.data && tx.data !== '0x') {
        try {
          datosDecodificados = ethers.toUtf8String(tx.data);
          datosDecodificados = JSON.parse(datosDecodificados);
        } catch (error) {
          console.log('No se pudieron decodificar los datos como JSON');
        }
      }

      return {
        success: true,
        transactionHash: txHash,
        from: tx.from,
        to: tx.to,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'Exitoso' : 'Fallido',
        datos: datosDecodificados,
        timestamp: receipt.timestamp
      };

    } catch (error) {
      console.error('Error verificando transacción:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = VerificadorBlockchain; 