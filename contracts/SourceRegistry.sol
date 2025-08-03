// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SourceRegistry
 * @dev Contrato para registrar y verificar fuentes/autores confiables
 * @author Clarium Team
 */
contract SourceRegistry {
    
    // Estructura para almacenar información de la fuente
    struct SourceInfo {
        bool isVerified;
        uint256 timestamp;
        address admin;
        string metadata; // JSON string con información adicional
        uint256 trustScore; // Score de confianza (0-100)
        string sourceType; // "author", "media", "organization"
        bool isActive;
    }
    
    // Mapping de dirección a información de fuente
    mapping(address => SourceInfo) public sources;
    
    // Mapping de admin a permisos
    mapping(address => bool) public isAdmin;
    
    // Eventos
    event SourceRegistered(address indexed source, address indexed admin, uint256 timestamp, string metadata);
    event SourceVerified(address indexed source, uint256 trustScore, string sourceType);
    event SourceDeactivated(address indexed source, address indexed admin);
    event AdminAdded(address indexed admin, address indexed newAdmin);
    event AdminRemoved(address indexed admin, address indexed removedAdmin);
    
    // Contadores
    uint256 public totalSources;
    uint256 public totalVerifiedSources;
    uint256 public totalAdmins;
    
    // Modificador para verificar que solo los admins pueden ejecutar
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Solo admins pueden ejecutar esta funcion");
        _;
    }
    
    // Modificador para verificar que la fuente no esté registrada
    modifier sourceNotExists(address source) {
        require(!sources[source].isVerified, "Fuente ya registrada");
        _;
    }
    
    // Modificador para verificar que la fuente existe
    modifier sourceExists(address source) {
        require(sources[source].isVerified, "Fuente no registrada");
        _;
    }
    
    // Constructor - el deployer es el primer admin
    constructor() {
        isAdmin[msg.sender] = true;
        totalAdmins = 1;
    }
    
    /**
     * @dev Agrega un nuevo admin
     * @param newAdmin Dirección del nuevo admin
     */
    function addAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Direccion invalida");
        require(!isAdmin[newAdmin], "Ya es admin");
        
        isAdmin[newAdmin] = true;
        totalAdmins++;
        
        emit AdminAdded(msg.sender, newAdmin);
    }
    
    /**
     * @dev Remueve un admin
     * @param adminToRemove Dirección del admin a remover
     */
    function removeAdmin(address adminToRemove) public onlyAdmin {
        require(adminToRemove != msg.sender, "No puedes removerte a ti mismo");
        require(isAdmin[adminToRemove], "No es admin");
        require(totalAdmins > 1, "Debe haber al menos un admin");
        
        isAdmin[adminToRemove] = false;
        totalAdmins--;
        
        emit AdminRemoved(msg.sender, adminToRemove);
    }
    
    /**
     * @dev Registra una nueva fuente
     * @param source Dirección de la fuente
     * @param metadata Metadata en formato JSON string
     * @param trustScore Score de confianza (0-100)
     * @param sourceType Tipo de fuente ("author", "media", "organization")
     */
    function registerSource(
        address source, 
        string memory metadata, 
        uint256 trustScore, 
        string memory sourceType
    ) public onlyAdmin sourceNotExists(source) {
        require(source != address(0), "Direccion invalida");
        require(trustScore <= 100, "Trust score debe ser <= 100");
        
        sources[source] = SourceInfo({
            isVerified: true,
            timestamp: block.timestamp,
            admin: msg.sender,
            metadata: metadata,
            trustScore: trustScore,
            sourceType: sourceType,
            isActive: true
        });
        
        totalSources++;
        totalVerifiedSources++;
        
        emit SourceRegistered(source, msg.sender, block.timestamp, metadata);
        emit SourceVerified(source, trustScore, sourceType);
    }
    
    /**
     * @dev Verifica si una fuente está registrada y es confiable
     * @param source Dirección de la fuente
     * @return bool True si la fuente está verificada
     */
    function verifySource(address source) public view returns (bool) {
        return sources[source].isVerified && sources[source].isActive;
    }
    
    /**
     * @dev Obtiene información completa de una fuente
     * @param source Dirección de la fuente
     * @return isVerified Si está verificada
     * @return timestamp Timestamp de registro
     * @return admin Admin que la registró
     * @return metadata Metadata almacenada
     * @return trustScore Score de confianza
     * @return sourceType Tipo de fuente
     * @return isActive Si está activa
     */
    function getSourceInfo(address source) 
        public 
        view 
        returns (
            bool isVerified, 
            uint256 timestamp, 
            address admin, 
            string memory metadata, 
            uint256 trustScore, 
            string memory sourceType, 
            bool isActive
        ) 
    {
        SourceInfo memory info = sources[source];
        return (
            info.isVerified,
            info.timestamp,
            info.admin,
            info.metadata,
            info.trustScore,
            info.sourceType,
            info.isActive
        );
    }
    
    /**
     * @dev Actualiza el trust score de una fuente
     * @param source Dirección de la fuente
     * @param newTrustScore Nuevo score de confianza
     */
    function updateTrustScore(address source, uint256 newTrustScore) 
        public 
        onlyAdmin 
        sourceExists(source) 
    {
        require(newTrustScore <= 100, "Trust score debe ser <= 100");
        
        sources[source].trustScore = newTrustScore;
        
        emit SourceVerified(source, newTrustScore, sources[source].sourceType);
    }
    
    /**
     * @dev Desactiva una fuente
     * @param source Dirección de la fuente
     */
    function deactivateSource(address source) public onlyAdmin sourceExists(source) {
        require(sources[source].isActive, "Fuente ya desactivada");
        
        sources[source].isActive = false;
        totalVerifiedSources--;
        
        emit SourceDeactivated(source, msg.sender);
    }
    
    /**
     * @dev Reactiva una fuente
     * @param source Dirección de la fuente
     */
    function reactivateSource(address source) public onlyAdmin sourceExists(source) {
        require(!sources[source].isActive, "Fuente ya activa");
        
        sources[source].isActive = true;
        totalVerifiedSources++;
        
        emit SourceVerified(source, sources[source].trustScore, sources[source].sourceType);
    }
    
    /**
     * @dev Verifica si una fuente tiene un trust score mínimo
     * @param source Dirección de la fuente
     * @param minTrustScore Score mínimo requerido
     * @return bool True si cumple con el score mínimo
     */
    function verifySourceWithMinScore(address source, uint256 minTrustScore) 
        public 
        view 
        returns (bool) 
    {
        SourceInfo memory info = sources[source];
        return info.isVerified && info.isActive && info.trustScore >= minTrustScore;
    }
    
    /**
     * @dev Registra múltiples fuentes en una sola transacción
     * @param sourcesArray Array de direcciones de fuentes
     * @param metadatas Array de metadatas correspondientes
     * @param trustScores Array de trust scores correspondientes
     * @param sourceTypes Array de tipos de fuente correspondientes
     */
    function registerMultipleSources(
        address[] memory sourcesArray,
        string[] memory metadatas,
        uint256[] memory trustScores,
        string[] memory sourceTypes
    ) public onlyAdmin {
        require(
            sourcesArray.length == metadatas.length &&
            sourcesArray.length == trustScores.length &&
            sourcesArray.length == sourceTypes.length,
            "Arrays deben tener la misma longitud"
        );
        
        for (uint i = 0; i < sourcesArray.length; i++) {
            if (!sources[sourcesArray[i]].isVerified) {
                registerSource(sourcesArray[i], metadatas[i], trustScores[i], sourceTypes[i]);
            }
        }
    }
    
    /**
     * @dev Obtiene estadísticas del registry
     * @return totalSourcesRegistradas Total de fuentes registradas
     * @return totalFuentesVerificadas Total de fuentes verificadas y activas
     * @return totalAdmins Total de admins
     */
    function getRegistryStats() 
        public 
        view 
        returns (uint256 totalSourcesRegistradas, uint256 totalFuentesVerificadas, uint256 totalAdmins) 
    {
        return (totalSources, totalVerifiedSources, totalAdmins);
    }
    
    /**
     * @dev Verifica si una dirección es admin
     * @param admin Dirección a verificar
     * @return bool True si es admin
     */
    function isAdminAddress(address admin) public view returns (bool) {
        return isAdmin[admin];
    }
    
    /**
     * @dev Obtiene fuentes por tipo
     * @param sourceType Tipo de fuente a buscar
     * @return addresses Array de direcciones de fuentes del tipo especificado
     * @return trustScores Array de trust scores correspondientes
     */
    function getSourcesByType(string memory sourceType) 
        public 
        view 
        returns (address[] memory addresses, uint256[] memory trustScores) 
    {
        // Esta función requeriría iterar sobre todas las fuentes
        // Por simplicidad, retornamos arrays vacíos
        // En una implementación completa, usarías un mapping adicional
        return (new address[](0), new uint256[](0));
    }
    
    /**
     * @dev Verifica múltiples fuentes de una vez
     * @param sourcesArray Array de direcciones de fuentes
     * @return results Array de resultados booleanos
     */
    function verifyMultipleSources(address[] memory sourcesArray) 
        public 
        view 
        returns (bool[] memory results) 
    {
        results = new bool[](sourcesArray.length);
        
        for (uint i = 0; i < sourcesArray.length; i++) {
            results[i] = verifySource(sourcesArray[i]);
        }
        
        return results;
    }
    
    /**
     * @dev Obtiene fuentes con trust score alto
     * @param minTrustScore Score mínimo requerido
     * @return addresses Array de direcciones de fuentes con score alto
     * @return trustScores Array de trust scores correspondientes
     */
    function getHighTrustSources(uint256 minTrustScore) 
        public 
        view 
        returns (address[] memory addresses, uint256[] memory trustScores) 
    {
        // Esta función requeriría iterar sobre todas las fuentes
        // Por simplicidad, retornamos arrays vacíos
        // En una implementación completa, usarías un mapping adicional
        return (new address[](0), new uint256[](0));
    }
} 