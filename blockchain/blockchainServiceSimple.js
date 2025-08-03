const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainServiceSimple {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
  }

  // Conectar a la blockchain
  async connect() {
    try {
      const RPC_URL = process.env.RPC_URL || 'https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID';
      const PRIVATE_KEY = process.env.PRIVATE_KEY;
      
      if (!PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY no está configurada en el archivo .env');
      }

      // Conectar al proveedor
      this.provider = new ethers.JsonRpcProvider(RPC_URL);
      
      // Crear el signer con la clave privada
      this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
      
      // Verificar conexión
      const balance = await this.provider.getBalance(this.signer.address);
      console.log(`Conectado a blockchain. Balance: ${ethers.formatEther(balance)} ETH`);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error conectando a blockchain:', error.message);
      return false;
    }
  }

  // Subir verificación a la blockchain (versión simple)
  async subirVerificacion(noticiaTexto, resultadoVerificacion) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Crear el hash de la verificación
      const verificacionHash = ethers.keccak256(
        ethers.toUtf8Bytes(noticiaTexto + JSON.stringify(resultadoVerificacion))
      );

      // Crear datos estructurados
      const datos = {
        noticiaTexto: noticiaTexto.substring(0, 500),
        veredicto: resultadoVerificacion.veredicto,
        score: resultadoVerificacion.score,
        razonamiento: resultadoVerificacion.razonamiento,
        timestamp: Date.now(),
        verificacionHash: verificacionHash
      };

      // Codificar datos como JSON
      const datosCodificados = ethers.toUtf8Bytes(JSON.stringify(datos));
      
      // Crear transacción simple (enviar a la misma wallet con datos)
      const tx = {
        to: this.signer.address,
        data: datosCodificados,
        gasLimit: 100000
      };

      // Enviar transacción
      const transaction = await this.signer.sendTransaction(tx);
      console.log(`Transacción enviada: ${transaction.hash}`);

      // Esperar confirmación
      const receipt = await transaction.wait();
      console.log(`Transacción confirmada en bloque: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        verificacionHash: verificacionHash,
        datos: datos
      };

    } catch (error) {
      console.error('Error subiendo a blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar si una transacción existe
  async verificarTransaccion(transactionHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      return {
        exists: receipt !== null,
        blockNumber: receipt?.blockNumber,
        status: receipt?.status
      };
    } catch (error) {
      console.error('Error verificando transacción:', error.message);
      return { exists: false, error: error.message };
    }
  }
}

module.exports = BlockchainServiceSimple; 