const { ethers } = require('ethers');
require('dotenv').config();

// ABI del smart contract (generado automáticamente)
const CONTRACT_ABI = [
  "function subirVerificacion(string memory _noticiaTexto, string memory _veredicto, uint8 _score, string memory _razonamiento) public",
  "function obtenerVerificacion(bytes32 _verificacionHash) public view returns (string memory noticiaTexto, string memory veredicto, uint8 score, string memory razonamiento, uint256 timestamp, address verificador)",
  "function verificarExistencia(bytes32 _verificacionHash) public view returns (bool)",
  "event VerificacionSubida(bytes32 indexed verificacionHash, string noticiaTexto, string veredicto, uint8 score, address indexed verificador, uint256 timestamp)"
];

class BlockchainServiceContract {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  // Conectar a la blockchain
  async connect() {
    try {
      const RPC_URL = process.env.RPC_URL || 'https://polygon-mumbai.infura.io/v3/TU_PROJECT_ID';
      const PRIVATE_KEY = process.env.PRIVATE_KEY;
      const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
      
      if (!PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY no está configurada en el archivo .env');
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS no está configurada en el archivo .env');
      }

      // Conectar al proveedor
      this.provider = new ethers.JsonRpcProvider(RPC_URL);
      
      // Crear el signer con la clave privada
      this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
      
      // Conectar al smart contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      
      // Verificar conexión
      const balance = await this.provider.getBalance(this.signer.address);
      console.log(`Conectado a blockchain. Balance: ${ethers.formatEther(balance)} ETH`);
      console.log(`Contrato conectado en: ${CONTRACT_ADDRESS}`);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error conectando a blockchain:', error.message);
      return false;
    }
  }

  // Subir verificación usando smart contract
  async subirVerificacion(noticiaTexto, resultadoVerificacion) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Crear el hash de la verificación
      const verificacionHash = ethers.keccak256(
        ethers.toUtf8Bytes(noticiaTexto + JSON.stringify(resultadoVerificacion))
      );

      // Llamar función del smart contract
      const tx = await this.contract.subirVerificacion(
        noticiaTexto.substring(0, 500), // Limitar longitud
        resultadoVerificacion.veredicto,
        resultadoVerificacion.score,
        resultadoVerificacion.razonamiento
      );

      console.log(`Transacción enviada: ${tx.hash}`);

      // Esperar confirmación
      const receipt = await tx.wait();
      console.log(`Transacción confirmada en bloque: ${receipt.blockNumber}`);

      // Buscar el evento emitido
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'VerificacionSubida';
        } catch {
          return false;
        }
      });

      let eventData = null;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        eventData = {
          verificacionHash: parsed.args[0],
          noticiaTexto: parsed.args[1],
          veredicto: parsed.args[2],
          score: parsed.args[3],
          verificador: parsed.args[4],
          timestamp: parsed.args[5]
        };
      }

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        verificacionHash: verificacionHash,
        eventData: eventData
      };

    } catch (error) {
      console.error('Error subiendo a blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar si una verificación existe
  async verificarExistencia(verificacionHash) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const existe = await this.contract.verificarExistencia(verificacionHash);
      return {
        exists: existe,
        verificacionHash: verificacionHash
      };
    } catch (error) {
      console.error('Error verificando existencia:', error.message);
      return { exists: false, error: error.message };
    }
  }

  // Obtener datos de una verificación
  async obtenerVerificacion(verificacionHash) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const datos = await this.contract.obtenerVerificacion(verificacionHash);
      return {
        success: true,
        noticiaTexto: datos[0],
        veredicto: datos[1],
        score: datos[2],
        razonamiento: datos[3],
        timestamp: datos[4],
        verificador: datos[5]
      };
    } catch (error) {
      console.error('Error obteniendo verificación:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = BlockchainServiceContract; 