// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NavinEvault {  
    address public owner;
    mapping(address => bool) private courtOfficials;

    struct CaseFile {
        address uploader;
        string ipfsHash;
        string title;
        string dateOfJudgment;
        string caseNumber;
        string category;
        string judgeName;
        address[] linkedClients;  // Array of linked clients for the case file
        uint256 timestamp;
    }

    mapping(uint256 => CaseFile) public caseFiles;
    mapping(uint256 => mapping(address => bool)) public linkedClientsMap; // Mapping for linked clients
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

    event ClientLinked(uint256 indexed fileId, address client);  // Event for linking clients

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyCourtOfficial() {
        require(courtOfficials[msg.sender], "Only court officials can upload files");
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

    function isCourtOfficial(address _official) public view returns (bool) {
        return courtOfficials[_official];
    }

    function uploadFile(
        string memory _ipfsHash,
        string memory _title,
        string memory _dateOfJudgment,
        string memory _caseNumber,
        string memory _category,
        string memory _judgeName,
        address[] memory _linkedClients
    ) public onlyCourtOfficial {
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
        require(_linkedClients.length > 0, "At least one client must be linked");

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

        // Add linked clients to the mapping
        for (uint256 i = 0; i < _linkedClients.length; i++) {
            linkedClientsMap[totalCaseFiles][_linkedClients[i]] = true; // Link client
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
            require(!linkedClientsMap[_fileId][client], "Client already linked"); // O(1) check

            linkedClientsMap[_fileId][client] = true; // Link client
            caseFiles[_fileId].linkedClients.push(client); // Add to array for external visibility
            emit ClientLinked(_fileId, client);
        }
    }

    function getFile(uint256 _fileId) public view returns (
        address uploader,
        string memory ipfsHash,
        string memory title,
        string memory dateOfJudgment,
        string memory caseNumber,
        string memory category,
        string memory judgeName,
        address[] memory linkedClients,
        uint256 timestamp
    ) {
        require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
        CaseFile storage file = caseFiles[_fileId];
        return (
            file.uploader,
            file.ipfsHash,
            file.title,
            file.dateOfJudgment,
            file.caseNumber,
            file.category,
            file.judgeName,
            file.linkedClients,
            file.timestamp
        );
    }

    function searchByTitle(string memory _title) public view returns (CaseFile[] memory) {
        uint256 matchCount = 0;

        // First, count how many case files match the title
        for (uint256 i = 1; i <= totalCaseFiles; i++) {
            if (keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title))) {
                matchCount++;
            }
        }

        // Create an array to hold the matching case files
        CaseFile[] memory matchingFiles = new CaseFile[](matchCount);
        uint256 index = 0;

        // Populate the matchingFiles array with the matching case files
        for (uint256 i = 1; i <= totalCaseFiles; i++) {
            if (keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title))) {
                matchingFiles[index] = caseFiles[i];
                index++;
            }
        }

        return matchingFiles;
    }
}
