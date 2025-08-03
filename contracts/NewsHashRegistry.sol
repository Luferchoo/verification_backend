// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title NewsHashRegistry
 * @dev Contrato para verificar la integridad de noticias mediante hashes
 * @author Clarium Team
 */
contract NewsHashRegistry {
    
    // Estructura para almacenar información del hash
    struct HashInfo {
        bool exists;
        uint256 timestamp;
        address registrador;
        string metadata; // JSON string con metadata adicional
    }
    
    // Mapping de hash a información
    mapping(bytes32 => HashInfo) public hashRegistry;
    
    // Eventos
    event HashRegistered(bytes32 indexed hash, address indexed registrador, uint256 timestamp, string metadata);
    event HashVerified(bytes32 indexed hash, bool exists, uint256 timestamp);
    
    // Contador de hashes registrados
    uint256 public totalHashes;
    
    // Modificador para verificar que el hash no exista
    modifier hashNotExists(bytes32 hash) {
        require(!hashRegistry[hash].exists, "Hash ya registrado");
        _;
    }
    
    // Modificador para verificar que el hash existe
    modifier hashExists(bytes32 hash) {
        require(hashRegistry[hash].exists, "Hash no registrado");
        _;
    }
    
    /**
     * @dev Registra un nuevo hash de noticia
     * @param hash Hash de la noticia (keccak256 del contenido)
     * @param metadata Metadata adicional en formato JSON string
     * @return bool True si se registró exitosamente
     */
    function registerNewsHash(bytes32 hash, string memory metadata) 
        public 
        hashNotExists(hash) 
        returns (bool) 
    {
        hashRegistry[hash] = HashInfo({
            exists: true,
            timestamp: block.timestamp,
            registrador: msg.sender,
            metadata: metadata
        });
        
        totalHashes++;
        
        emit HashRegistered(hash, msg.sender, block.timestamp, metadata);
        return true;
    }
    
    /**
     * @dev Verifica si un hash existe en el registro
     * @param hash Hash a verificar
     * @return bool True si el hash existe
     */
    function existsHash(bytes32 hash) public view returns (bool) {
        return hashRegistry[hash].exists;
    }
    
    /**
     * @dev Obtiene información completa de un hash
     * @param hash Hash a consultar
     * @return exists Si existe
     * @return timestamp Timestamp de registro
     * @return registrador Dirección del registrador
     * @return metadata Metadata almacenada
     */
    function getHashInfo(bytes32 hash) 
        public 
        view 
        returns (bool exists, uint256 timestamp, address registrador, string memory metadata) 
    {
        HashInfo memory info = hashRegistry[hash];
        return (info.exists, info.timestamp, info.registrador, info.metadata);
    }
    
    /**
     * @dev Verifica la integridad de una noticia comparando su hash
     * @param content Contenido de la noticia
     * @return bool True si el hash coincide y existe
     */
    function verifyNewsIntegrity(string memory content) public view returns (bool) {
        bytes32 contentHash = keccak256(abi.encodePacked(content));
        return existsHash(contentHash);
    }
    
    /**
     * @dev Verifica la integridad de una noticia con hash precalculado
     * @param contentHash Hash precalculado del contenido
     * @return bool True si el hash existe
     */
    function verifyNewsIntegrityByHash(bytes32 contentHash) public view returns (bool) {
        return existsHash(contentHash);
    }
    
    /**
     * @dev Registra múltiples hashes en una sola transacción
     * @param hashes Array de hashes a registrar
     * @param metadatas Array de metadatas correspondientes
     * @return bool True si todos se registraron exitosamente
     */
    function registerMultipleHashes(bytes32[] memory hashes, string[] memory metadatas) 
        public 
        returns (bool) 
    {
        require(hashes.length == metadatas.length, "Arrays deben tener la misma longitud");
        
        for (uint i = 0; i < hashes.length; i++) {
            if (!hashRegistry[hashes[i]].exists) {
                registerNewsHash(hashes[i], metadatas[i]);
            }
        }
        
        return true;
    }
    
    /**
     * @dev Obtiene estadísticas del registro
     * @return totalHashesRegistrados Total de hashes únicos
     * @return totalRegistradores Total de direcciones únicas que han registrado
     */
    function getRegistryStats() public view returns (uint256 totalHashesRegistrados, uint256 totalRegistradores) {
        return (totalHashes, 0); // TODO: Implementar contador de registradores únicos
    }
    
    /**
     * @dev Verifica si un contenido específico ha sido registrado
     * @param content Contenido de la noticia
     * @return bool True si el contenido está registrado
     * @return uint256 Timestamp de registro si existe
     */
    function isContentRegistered(string memory content) 
        public 
        view 
        returns (bool, uint256) 
    {
        bytes32 contentHash = keccak256(abi.encodePacked(content));
        HashInfo memory info = hashRegistry[contentHash];
        return (info.exists, info.timestamp);
    }
    
    /**
     * @dev Obtiene el hash de un contenido
     * @param content Contenido de la noticia
     * @return bytes32 Hash del contenido
     */
    function getContentHash(string memory content) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(content));
    }
    
    /**
     * @dev Verifica la integridad y obtiene información completa
     * @param content Contenido de la noticia
     * @return bool Si está registrado
     * @return bytes32 Hash del contenido
     * @return uint256 Timestamp de registro
     * @return address Registrador
     * @return string Metadata
     */
    function verifyAndGetInfo(string memory content) 
        public 
        view 
        returns (bool, bytes32, uint256, address, string memory) 
    {
        bytes32 contentHash = keccak256(abi.encodePacked(content));
        HashInfo memory info = hashRegistry[contentHash];
        
        return (
            info.exists,
            contentHash,
            info.timestamp,
            info.registrador,
            info.metadata
        );
    }
} 