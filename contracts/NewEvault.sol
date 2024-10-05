// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NewEVault {
    address public owner;
    mapping(address => bool) private courtOfficials;

    struct CaseFile {
        address uploader;  // Address of the lawyer who uploaded the file
        string ipfsHash;   // IPFS hash of the file
        string title;      // Title of the case file
        string dateOfJudgment; // Date of judgment
        string caseNumber; // Unique case number
        string category;   // Category of the case
        string judgeName;  // Name of the judge
        uint256 timestamp; // Timestamp of upload
        address[] clients;  // Array of clients who can access this file
    }

    mapping(uint256 => CaseFile) public caseFiles; // Mapping of file ID to case files
    uint256 public totalCaseFiles; // Total number of case files

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
        address[] clients // Clients linked to the uploaded file
    );

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
        address[] memory _clients // Clients that can access this file
    ) public onlyCourtOfficial {
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
        require(_clients.length > 0, "At least one client must be linked");
        
        // Ensure client addresses are unique
        for (uint256 i = 0; i < _clients.length; i++) {
            for (uint256 j = i + 1; j < _clients.length; j++) {
                require(_clients[i] != _clients[j], "Client addresses must be unique");
            }
        }

        totalCaseFiles++;
        caseFiles[totalCaseFiles] = CaseFile({
            uploader: msg.sender,
            ipfsHash: _ipfsHash,
            title: _title,
            dateOfJudgment: _dateOfJudgment,
            caseNumber: _caseNumber,
            category: _category,
            judgeName: _judgeName,
            timestamp: block.timestamp,
            clients: _clients
        });

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
            _clients
        );
    }

    function canClientAccess(uint256 _fileId, address _client) public view returns (bool) {
        require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
        CaseFile memory file = caseFiles[_fileId];

        // Check if the client is in the list of clients for the file
        for (uint256 i = 0; i < file.clients.length; i++) {
            if (file.clients[i] == _client) {
                return true;
            }
        }
        return false;
    }

    function searchByTitle(string memory _title) public view returns (uint256[] memory) {
        uint256[] memory matchingFiles = new uint256[](totalCaseFiles);
        uint256 count = 0;

        for (uint256 fileId = 1; fileId <= totalCaseFiles; fileId++) {
            if (keccak256(bytes(caseFiles[fileId].title)) == keccak256(bytes(_title))) {
                matchingFiles[count] = fileId;
                count++;
            }
        }

        return sliceArray(matchingFiles, count);
    }

    function sliceArray(uint256[] memory arr, uint256 count) internal pure returns (uint256[] memory) {
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = arr[i];
        }
        return result;
    }

    // New function to retrieve clients for a specific file
    function getClientsForFile(uint256 _fileId) public view returns (address[] memory) {
        require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
        return caseFiles[_fileId].clients;
    }
}
