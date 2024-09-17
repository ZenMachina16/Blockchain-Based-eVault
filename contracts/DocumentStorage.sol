// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DocumentStorage {
    mapping(address => string) public documentHashes;

    event DocumentUploaded(address indexed user, string ipfsHash);

    function uploadDocument(string memory _ipfsHash) public {
        documentHashes[msg.sender] = _ipfsHash;
        emit DocumentUploaded(msg.sender, _ipfsHash);
    }

    function getDocumentHash(address _user) public view returns (string memory) {
        return documentHashes[_user];
    }
}
