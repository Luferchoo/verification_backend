// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerificadorNoticias {
    
    struct Verificacion {
        string noticiaTexto;
        string veredicto;
        uint8 score;
        string razonamiento;
        uint256 timestamp;
        address verificador;
        bytes32 verificacionHash;
    }
    
    mapping(bytes32 => Verificacion) public verificaciones;
    mapping(address => bytes32[]) public verificacionesPorVerificador;
    
    event VerificacionSubida(
        bytes32 indexed verificacionHash,
        string noticiaTexto,
        string veredicto,
        uint8 score,
        address indexed verificador,
        uint256 timestamp
    );
    
    function subirVerificacion(
        string memory _noticiaTexto,
        string memory _veredicto,
        uint8 _score,
        string memory _razonamiento
    ) public {
        require(_score >= 70, "Score debe ser mayor o igual a 70");
        require(bytes(_noticiaTexto).length > 0, "Texto de noticia no puede estar vacio");
        
        // Crear hash único de la verificación
        bytes32 verificacionHash = keccak256(
            abi.encodePacked(
                _noticiaTexto,
                _veredicto,
                _score,
                _razonamiento,
                block.timestamp,
                msg.sender
            )
        );
        
        // Guardar verificación
        verificaciones[verificacionHash] = Verificacion({
            noticiaTexto: _noticiaTexto,
            veredicto: _veredicto,
            score: _score,
            razonamiento: _razonamiento,
            timestamp: block.timestamp,
            verificador: msg.sender,
            verificacionHash: verificacionHash
        });
        
        // Agregar a la lista del verificador
        verificacionesPorVerificador[msg.sender].push(verificacionHash);
        
        // Emitir evento
        emit VerificacionSubida(
            verificacionHash,
            _noticiaTexto,
            _veredicto,
            _score,
            msg.sender,
            block.timestamp
        );
    }
    
    function obtenerVerificacion(bytes32 _verificacionHash) public view returns (
        string memory noticiaTexto,
        string memory veredicto,
        uint8 score,
        string memory razonamiento,
        uint256 timestamp,
        address verificador
    ) {
        Verificacion memory ver = verificaciones[_verificacionHash];
        require(ver.timestamp > 0, "Verificacion no existe");
        
        return (
            ver.noticiaTexto,
            ver.veredicto,
            ver.score,
            ver.razonamiento,
            ver.timestamp,
            ver.verificador
        );
    }
    
    function obtenerVerificacionesPorVerificador(address _verificador) public view returns (bytes32[] memory) {
        return verificacionesPorVerificador[_verificador];
    }
    
    function verificarExistencia(bytes32 _verificacionHash) public view returns (bool) {
        return verificaciones[_verificacionHash].timestamp > 0;
    }
    
    function obtenerEstadisticas() public view returns (uint256 totalVerificaciones) {
        // Esta función es básica, puedes expandirla según necesites
        return verificacionesPorVerificador[msg.sender].length;
    }
} 