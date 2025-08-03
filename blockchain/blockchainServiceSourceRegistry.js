const { ethers } = require('ethers');
require('dotenv').config();

// ABI del contrato SourceRegistry
const SOURCE_REGISTRY_ABI = [
    "function addAdmin(address newAdmin) public",
    "function removeAdmin(address adminToRemove) public",
    "function registerSource(address source, string memory metadata, uint256 trustScore, string memory sourceType) public",
    "function verifySource(address source) public view returns (bool)",
    "function getSourceInfo(address source) public view returns (bool, uint256, address, string, uint256, string, bool)",
    "function updateTrustScore(address source, uint256 newTrustScore) public",
    "function deactivateSource(address source) public",
    "function reactivateSource(address source) public",
    "function verifySourceWithMinScore(address source, uint256 minTrustScore) public view returns (bool)",
    "function registerMultipleSources(address[] memory sourcesArray, string[] memory metadatas, uint256[] memory trustScores, string[] memory sourceTypes) public",
    "function getRegistryStats() public view returns (uint256, uint256, uint256)",
    "function isAdminAddress(address admin) public view returns (bool)",
    "function verifyMultipleSources(address[] memory sourcesArray) public view returns (bool[])",
    "event SourceRegistered(address indexed source, address indexed admin, uint256 timestamp, string metadata)",
    "event SourceVerified(address indexed source, uint256 trustScore, string sourceType)",
    "event SourceDeactivated(address indexed source, address indexed admin)",
    "event AdminAdded(address indexed admin, address indexed newAdmin)",
    "event AdminRemoved(address indexed admin, address indexed removedAdmin)"
];

class BlockchainServiceSourceRegistry {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAddress = process.env.SOURCE_REGISTRY_ADDRESS;
        
        if (!this.contractAddress) {
            throw new Error('SOURCE_REGISTRY_ADDRESS no está configurada en .env');
        }
    }

    async connect() {
        try {
            console.log('Conectando a blockchain para Source Registry...');
            
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
            this.contract = new ethers.Contract(this.contractAddress, SOURCE_REGISTRY_ABI, this.signer);
            
            console.log('✅ Conectado a SourceRegistry');
            console.log(`📋 Contrato: ${this.contractAddress}`);
            console.log(`👤 Signer: ${this.signer.address}`);
            
        } catch (error) {
            console.error('Error conectando a blockchain:', error.message);
            throw error;
        }
    }

    /**
     * Registra una nueva fuente en el registry
     * @param {string} sourceAddress - Dirección de la fuente
     * @param {object} sourceInfo - Información de la fuente
     * @returns {object} Resultado del registro
     */
    async registrarFuente(sourceAddress, sourceInfo) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            // Crear metadata JSON
            const metadata = JSON.stringify({
                nombre: sourceInfo.nombre || 'Sin nombre',
                descripcion: sourceInfo.descripcion || 'Sin descripción',
                website: sourceInfo.website || '',
                email: sourceInfo.email || '',
                telefono: sourceInfo.telefono || '',
                pais: sourceInfo.pais || 'Bolivia',
                timestamp: Date.now()
            });

            console.log('📝 Registrando fuente...');
            console.log(`🔗 Dirección: ${sourceAddress}`);
            console.log(`📊 Trust Score: ${sourceInfo.trustScore}`);
            console.log(`📋 Tipo: ${sourceInfo.sourceType}`);

            // Registrar fuente en el contrato
            const tx = await this.contract.registerSource(
                sourceAddress,
                metadata,
                sourceInfo.trustScore,
                sourceInfo.sourceType
            );
            console.log(`⏳ Transacción enviada: ${tx.hash}`);

            // Esperar confirmación
            const receipt = await tx.wait();
            console.log(`✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);

            // Buscar evento SourceRegistered
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed.name === 'SourceRegistered';
                } catch {
                    return false;
                }
            });

            let eventData = null;
            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                eventData = {
                    source: parsed.args[0],
                    admin: parsed.args[1],
                    timestamp: parsed.args[2].toString(),
                    metadata: parsed.args[3]
                };
            }

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                sourceAddress: sourceAddress,
                metadata: metadata,
                event: eventData,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('Error registrando fuente:', error.message);
            return {
                success: false,
                error: error.message,
                sourceAddress: sourceAddress || 'N/A'
            };
        }
    }

    /**
     * Verifica si una fuente está registrada y es confiable
     * @param {string} sourceAddress - Dirección de la fuente
     * @returns {object} Resultado de la verificación
     */
    async verificarFuente(sourceAddress) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`🔍 Verificando fuente: ${sourceAddress}`);

            const esVerificada = await this.contract.verifySource(sourceAddress);
            const info = await this.contract.getSourceInfo(sourceAddress);

            const resultado = {
                esVerificada: esVerificada,
                timestamp: info[1].toString(),
                admin: info[2],
                metadata: info[3],
                trustScore: info[4].toString(),
                sourceType: info[5],
                isActive: info[6]
            };

            console.log(`✅ Fuente verificada: ${resultado.esVerificada}`);
            console.log(`📊 Trust Score: ${resultado.trustScore}`);
            console.log(`📋 Tipo: ${resultado.sourceType}`);

            return {
                success: true,
                esVerificada: resultado.esVerificada,
                timestamp: resultado.timestamp,
                admin: resultado.admin,
                metadata: resultado.metadata,
                trustScore: resultado.trustScore,
                sourceType: resultado.sourceType,
                isActive: resultado.isActive
            };

        } catch (error) {
            console.error('Error verificando fuente:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica si una fuente tiene un trust score mínimo
     * @param {string} sourceAddress - Dirección de la fuente
     * @param {number} minTrustScore - Score mínimo requerido
     * @returns {object} Resultado de la verificación
     */
    async verificarFuenteConScoreMinimo(sourceAddress, minTrustScore) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`🔍 Verificando fuente con score mínimo: ${sourceAddress}`);
            console.log(`📊 Score mínimo requerido: ${minTrustScore}`);

            const cumpleRequisitos = await this.contract.verifySourceWithMinScore(sourceAddress, minTrustScore);

            return {
                success: true,
                cumpleRequisitos: cumpleRequisitos,
                sourceAddress: sourceAddress,
                minTrustScore: minTrustScore
            };

        } catch (error) {
            console.error('Error verificando fuente con score mínimo:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Actualiza el trust score de una fuente
     * @param {string} sourceAddress - Dirección de la fuente
     * @param {number} nuevoTrustScore - Nuevo score de confianza
     * @returns {object} Resultado de la actualización
     */
    async actualizarTrustScore(sourceAddress, nuevoTrustScore) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`📝 Actualizando trust score de fuente: ${sourceAddress}`);
            console.log(`📊 Nuevo trust score: ${nuevoTrustScore}`);

            const tx = await this.contract.updateTrustScore(sourceAddress, nuevoTrustScore);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                sourceAddress: sourceAddress,
                nuevoTrustScore: nuevoTrustScore
            };

        } catch (error) {
            console.error('Error actualizando trust score:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Desactiva una fuente
     * @param {string} sourceAddress - Dirección de la fuente
     * @returns {object} Resultado de la desactivación
     */
    async desactivarFuente(sourceAddress) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`🚫 Desactivando fuente: ${sourceAddress}`);

            const tx = await this.contract.deactivateSource(sourceAddress);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                sourceAddress: sourceAddress
            };

        } catch (error) {
            console.error('Error desactivando fuente:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reactiva una fuente
     * @param {string} sourceAddress - Dirección de la fuente
     * @returns {object} Resultado de la reactivación
     */
    async reactivarFuente(sourceAddress) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`✅ Reactivando fuente: ${sourceAddress}`);

            const tx = await this.contract.reactivateSource(sourceAddress);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                sourceAddress: sourceAddress
            };

        } catch (error) {
            console.error('Error reactivando fuente:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Registra múltiples fuentes en una sola transacción
     * @param {Array} fuentes - Array de objetos con información de fuentes
     * @returns {object} Resultado del registro múltiple
     */
    async registrarMultiplesFuentes(fuentes) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`📝 Registrando ${fuentes.length} fuentes...`);

            const addresses = [];
            const metadatas = [];
            const trustScores = [];
            const sourceTypes = [];

            for (const fuente of fuentes) {
                const metadata = JSON.stringify({
                    nombre: fuente.nombre || 'Sin nombre',
                    descripcion: fuente.descripcion || 'Sin descripción',
                    website: fuente.website || '',
                    timestamp: Date.now()
                });

                addresses.push(fuente.address);
                metadatas.push(metadata);
                trustScores.push(fuente.trustScore);
                sourceTypes.push(fuente.sourceType);
            }

            const tx = await this.contract.registerMultipleSources(addresses, metadatas, trustScores, sourceTypes);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                fuentesRegistradas: fuentes.length,
                addresses: addresses
            };

        } catch (error) {
            console.error('Error registrando múltiples fuentes:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica múltiples fuentes de una vez
     * @param {Array} sourceAddresses - Array de direcciones de fuentes
     * @returns {object} Resultado de las verificaciones
     */
    async verificarMultiplesFuentes(sourceAddresses) {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log(`🔍 Verificando ${sourceAddresses.length} fuentes...`);

            const resultados = await this.contract.verifyMultipleSources(sourceAddresses);

            const verificaciones = sourceAddresses.map((address, index) => ({
                address: address,
                esVerificada: resultados[index]
            }));

            return {
                success: true,
                verificaciones: verificaciones,
                totalVerificadas: verificaciones.filter(v => v.esVerificada).length
            };

        } catch (error) {
            console.error('Error verificando múltiples fuentes:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene estadísticas del registry
     * @returns {object} Estadísticas del contrato
     */
    async obtenerEstadisticas() {
        try {
            if (!this.contract) {
                await this.connect();
            }

            console.log('📊 Obteniendo estadísticas del source registry...');

            const stats = await this.contract.getRegistryStats();

            return {
                success: true,
                totalFuentes: stats[0].toString(),
                totalFuentesVerificadas: stats[1].toString(),
                totalAdmins: stats[2].toString()
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
     * Verifica si la dirección actual es admin
     * @returns {object} Resultado de la verificación
     */
    async verificarSiEsAdmin() {
        try {
            if (!this.contract) {
                await this.connect();
            }

            const esAdmin = await this.contract.isAdminAddress(this.signer.address);

            return {
                success: true,
                esAdmin: esAdmin,
                address: this.signer.address
            };

        } catch (error) {
            console.error('Error verificando si es admin:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = BlockchainServiceSourceRegistry; 