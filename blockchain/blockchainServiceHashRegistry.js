const { ethers } = require('ethers');
require('dotenv').config();

// ABI del contrato NewsHashRegistry
const HASH_REGISTRY_ABI = [
    "function registerNewsHash(bytes32 hash, string memory metadata) public returns (bool)",
    "function existsHash(bytes32 hash) public view returns (bool)",
    "function getHashInfo(bytes32 hash) public view returns (bool exists, uint256 timestamp, address registrador, string memory metadata)",
    "function verifyNewsIntegrity(string memory content) public view returns (bool)",
    "function verifyNewsIntegrityByHash(bytes32 contentHash) public view returns (bool)",
    "function registerMultipleHashes(bytes32[] memory hashes, string[] memory metadatas) public returns (bool)",
    "function getRegistryStats() public view returns (uint256 totalHashesRegistrados, uint256 totalRegistradores)",
    "function isContentRegistered(string memory content) public view returns (bool, uint256)",
    "function getContentHash(string memory content) public pure returns (bytes32)",
    "function verifyAndGetInfo(string memory content) public view returns (bool, bytes32, uint256, address, string memory)",
    "event HashRegistered(bytes32 indexed hash, address indexed registrador, uint256 timestamp, string metadata)",
    "event HashVerified(bytes32 indexed hash, bool exists, uint256 timestamp)"
];

class BlockchainServiceHashRegistry {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAddress = process.env.HASH_REGISTRY_ADDRESS;
        
        if (!this.contractAddress) {
            throw new Error('HASH_REGISTRY_ADDRESS no está configurada en .env');
        }
    }

    async connect() {
        try {
            console.log('Conectando a blockchain para Hash Registry...');
            
            // Conectar al proveedor
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            
            // Conectar al signer
            this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            
            // Verificar balance
            const balance = await this.provider.getBalance(this.signer.address);
            console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
            
            if (balance === 0n) {
                throw new Error('Balance insuficiente para transacciones');
            }
            
            // Conectar al contrato
            this.contract = new ethers.Contract(this.contractAddress, HASH_REGISTRY_ABI, this.signer);
            
            console.log('✅ Conectado a NewsHashRegistry');
            console.log(`📋 Contrato: ${this.contractAddress}`);
            console.log(`👤 Signer: ${this.signer.address}`);
            
        } catch (error) {
            console.error('Error conectando a blockchain:', error.message);
            throw error;
        }
    }

    /**
     * Registra el hash de una noticia para verificación de integridad
     * @param {string} noticiaTexto - Contenido de la noticia
     * @param {object} resultadoVerificacion - Resultado de la verificación
     * @returns {object} Resultado del registro
     */
    async registrarHashNoticia(noticiaTexto, resultadoVerificacion) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            // Crear hash del contenido
            const contentHash = ethers.keccak256(ethers.toUtf8Bytes(noticiaTexto));
            
            // Crear metadata JSON
            const metadata = JSON.stringify({
                noticiaTexto: noticiaTexto.substring(0, 200), // Limitar longitud
                veredicto: resultadoVerificacion.veredicto,
                score: resultadoVerificacion.score,
                timestamp: Date.now(),
                metodo: resultadoVerificacion.metodo || 'UNKNOWN',
                tipo_input: resultadoVerificacion.tipo_input || 'UNKNOWN'
            });

            console.log('📝 Registrando hash de noticia...');
            console.log(`🔗 Hash: ${contentHash}`);
            console.log(`📊 Metadata: ${metadata}`);

            // Registrar hash en el contrato
            const tx = await this.contract.registerNewsHash(contentHash, metadata);
            console.log(`⏳ Transacción enviada: ${tx.hash}`);

            // Esperar confirmación
            const receipt = await tx.wait();
            console.log(`✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);

            // Buscar evento HashRegistered
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed.name === 'HashRegistered';
                } catch {
                    return false;
                }
            });

            let eventData = null;
            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                eventData = {
                    hash: parsed.args[0],
                    registrador: parsed.args[1],
                    timestamp: parsed.args[2].toString(),
                    metadata: parsed.args[3]
                };
            }

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                contentHash: contentHash,
                metadata: metadata,
                event: eventData,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('Error registrando hash:', error.message);
            return {
                success: false,
                error: error.message,
                contentHash: contentHash || 'N/A'
            };
        }
    }

    /**
     * Verifica la integridad de una noticia
     * @param {string} noticiaTexto - Contenido de la noticia
     * @returns {object} Resultado de la verificación
     */
    async verificarIntegridad(noticiaTexto) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log('🔍 Verificando integridad de noticia...');

            // Obtener información completa
            const info = await this.contract.verifyAndGetInfo(noticiaTexto);
            
            const resultado = {
                integridad: info[0], // bool
                hash: info[1], // bytes32
                timestamp: info[2].toString(), // uint256
                registrador: info[3], // address
                metadata: info[4] // string
            };

            console.log(`✅ Integridad verificada: ${resultado.integridad}`);
            console.log(`🔗 Hash: ${resultado.hash}`);
            console.log(`⏰ Timestamp: ${resultado.timestamp}`);

            return {
                success: true,
                integridad: resultado.integridad,
                hash: resultado.hash,
                timestamp: resultado.timestamp,
                registrador: resultado.registrador,
                metadata: resultado.metadata
            };

        } catch (error) {
            console.error('Error verificando integridad:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica si un hash específico existe
     * @param {string} hash - Hash a verificar
     * @returns {object} Resultado de la verificación
     */
    async verificarHash(hash) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`🔍 Verificando hash: ${hash}`);

            const existe = await this.contract.existsHash(hash);
            const info = await this.contract.getHashInfo(hash);

            return {
                success: true,
                existe: existe,
                timestamp: info[1].toString(),
                registrador: info[2],
                metadata: info[3]
            };

        } catch (error) {
            console.error('Error verificando hash:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene estadísticas del registro
     * @returns {object} Estadísticas del contrato
     */
    async obtenerEstadisticas() {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log('📊 Obteniendo estadísticas del registro...');

            const stats = await this.contract.getRegistryStats();

            return {
                success: true,
                totalHashes: stats[0].toString(),
                totalRegistradores: stats[1].toString()
            };

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Registra múltiples hashes en una sola transacción
     * @param {Array} noticias - Array de objetos {texto, resultado}
     * @returns {object} Resultado del registro múltiple
     */
    async registrarMultiplesHashes(noticias) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`📝 Registrando ${noticias.length} hashes...`);

            const hashes = [];
            const metadatas = [];

            for (const noticia of noticias) {
                const hash = ethers.keccak256(ethers.toUtf8Bytes(noticia.texto));
                const metadata = JSON.stringify({
                    noticiaTexto: noticia.texto.substring(0, 200),
                    veredicto: noticia.resultado.veredicto,
                    score: noticia.resultado.score,
                    timestamp: Date.now()
                });

                hashes.push(hash);
                metadatas.push(metadata);
            }

            const tx = await this.contract.registerMultipleHashes(hashes, metadatas);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                hashesRegistrados: hashes.length,
                hashes: hashes
            };

        } catch (error) {
            console.error('Error registrando múltiples hashes:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = BlockchainServiceHashRegistry; 