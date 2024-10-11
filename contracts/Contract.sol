// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Contract {
    address public owner;
    mapping(address => bool) private courtOfficials;
    mapping(address => bool) private clients;

    struct CaseFile {
        address uploader;
        string ipfsHash;
        string title;
        string dateOfJudgment;
        string caseNumber;
        string category;
        string judgeName;
        address[] linkedClients;
        uint256 timestamp;
    }

    mapping(uint256 => CaseFile) public caseFiles;
    mapping(uint256 => mapping(address => bool)) private linkedClientsMap;
    uint256 public totalCaseFiles;

    event FileUploaded(
        address indexed uploader,
        uint256 indexed fileId,
        string ipfsHash,
        string title,
        string dateOfJudgment,
        string caseNumber,
        string category,
        string judgeName,
        uint256 timestamp,
        address[] linkedClients
    );

    event ClientLinked(uint256 indexed fileId, address client);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyCourtOfficial() {
        require(courtOfficials[msg.sender], "Only court officials can upload files");
        _;
    }

    modifier onlyClient() {
        require(clients[msg.sender], "Only registered clients can upload files");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCourtOfficial(address _official) public onlyOwner {
        courtOfficials[_official] = true;
    }

    function removeCourtOfficial(address _official) public onlyOwner {
        courtOfficials[_official] = false;
    }

    function addClient(address _client) public onlyOwner {
        clients[_client] = true;
    }

    function removeClient(address _client) public onlyOwner {
        clients[_client] = false;
    }

    function isCourtOfficial(address _official) public view returns (bool) {
        return courtOfficials[_official];
    }

    function isClient(address _client) public view returns (bool) {
        return clients[_client];
    }

    function uploadFile(
        string memory _ipfsHash,
        string memory _title,
        string memory _dateOfJudgment,
        string memory _caseNumber,
        string memory _category,
        string memory _judgeName,
        address[] memory _linkedClients
    ) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
        require(_linkedClients.length > 0, "At least one client must be linked");
        require(courtOfficials[msg.sender] || clients[msg.sender], "Unauthorized uploader");

        totalCaseFiles++;
        caseFiles[totalCaseFiles] = CaseFile({
            uploader: msg.sender,
            ipfsHash: _ipfsHash,
            title: _title,
            dateOfJudgment: _dateOfJudgment,
            caseNumber: _caseNumber,
            category: _category,
            judgeName: _judgeName,
            linkedClients: _linkedClients,
            timestamp: block.timestamp
        });

        for (uint256 i = 0; i < _linkedClients.length; i++) {
            linkedClientsMap[totalCaseFiles][_linkedClients[i]] = true;
        }

        emit FileUploaded(
            msg.sender,
            totalCaseFiles,
            _ipfsHash,
            _title,
            _dateOfJudgment,
            _caseNumber,
            _category,
            _judgeName,
            block.timestamp,
            _linkedClients
        );
    }

    function linkClients(uint256 _fileId, address[] memory _clients) public onlyCourtOfficial {
        require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");

        for (uint256 i = 0; i < _clients.length; i++) {
            address client = _clients[i];
            require(!linkedClientsMap[_fileId][client], "Client already linked");

            linkedClientsMap[_fileId][client] = true;
            caseFiles[_fileId].linkedClients.push(client);

            emit ClientLinked(_fileId, client);
        }
    }

    function getFile(uint256 _fileId) public view returns (CaseFile memory) {
        require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
        require(
            caseFiles[_fileId].uploader == msg.sender || linkedClientsMap[_fileId][msg.sender],
            "Unauthorized access"
        );
        return caseFiles[_fileId];
    }

    function searchByTitle(string memory _title) public view returns (CaseFile[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= totalCaseFiles; i++) {
            if (keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title))) {
                count++;
            }
        }

        CaseFile[] memory matchingFiles = new CaseFile[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalCaseFiles; i++) {
            if (keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title))) {
                matchingFiles[index] = caseFiles[i];
                index++;
            }
        }

        return matchingFiles;
    }
}
