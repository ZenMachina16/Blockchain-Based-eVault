    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;

    contract NavinEvault {
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
            address linkedCourtOfficial;
            uint256 version;
            string documentStatus;
            string documentType;
            string description;
            bool isVerified;
            address verifiedBy;
            uint256 lastModified;
            string[] previousVersions;
        }

        mapping(uint256 => CaseFile) public caseFiles;
        mapping(uint256 => mapping(address => bool)) private linkedClientsMap;
        mapping(uint256 => mapping(uint256 => string)) private documentVersions;
        mapping(uint256 => uint256) private documentVersionCount;
        mapping(uint256 => mapping(address => bool)) private documentPermissions;
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
            address[] linkedClients,
            address linkedCourtOfficial
        );

        event ClientLinked(uint256 indexed fileId, address client);
        event CourtOfficialLinked(uint256 indexed fileId, address courtOfficial);
        event CourtOfficialReplaced(uint256 indexed fileId, address newCourtOfficial);
        event DocumentUpdated(uint256 indexed fileId, string newIpfsHash, uint256 version);
        event DocumentVerified(uint256 indexed fileId, address verifier);
        event DocumentStatusChanged(uint256 indexed fileId, string newStatus);
        event DocumentPermissionGranted(uint256 indexed fileId, address user);
        event DocumentPermissionRevoked(uint256 indexed fileId, address user);

        modifier onlyOwner() {
            require(msg.sender == owner, "Only the owner can perform this action");
            _;
        }

        modifier onlyCourtOfficial() {
            require(courtOfficials[msg.sender], "Only court officials can upload files");
            _;
        }

        modifier onlyAuthorizedUploader() {
            require(courtOfficials[msg.sender] || clients[msg.sender], "Only authorized users can upload files");
            _;
        }

        constructor() {
            owner = msg.sender;
        }

        // Register court officials and clients
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

        // Allow authorized users (court officials or clients) to upload files
        function uploadFile(
            string memory _ipfsHash,
            string memory _title,
            string memory _dateOfJudgment,
            string memory _caseNumber,
            string memory _category,
            string memory _judgeName,
            address[] memory _linkedClients,
            string memory _documentType,
            string memory _description
        ) public onlyAuthorizedUploader {
            require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
            require(_linkedClients.length > 0, "At least one client must be linked");

            totalCaseFiles++;
            address courtOfficial = courtOfficials[msg.sender] ? msg.sender : address(0);
            
            caseFiles[totalCaseFiles] = CaseFile({
                uploader: msg.sender,
                ipfsHash: _ipfsHash,
                title: _title,
                dateOfJudgment: _dateOfJudgment,
                caseNumber: _caseNumber,
                category: _category,
                judgeName: _judgeName,
                linkedClients: _linkedClients,
                timestamp: block.timestamp,
                linkedCourtOfficial: courtOfficial,
                version: 1,
                documentStatus: "active",
                documentType: _documentType,
                description: _description,
                isVerified: false,
                verifiedBy: address(0),
                lastModified: block.timestamp,
                previousVersions: new string[](0)
            });

            documentVersions[totalCaseFiles][1] = _ipfsHash;
            documentVersionCount[totalCaseFiles] = 1;

            for (uint256 i = 0; i < _linkedClients.length; i++) {
                linkedClientsMap[totalCaseFiles][_linkedClients[i]] = true;
                documentPermissions[totalCaseFiles][_linkedClients[i]] = true;
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
                _linkedClients,
                courtOfficial
            );
        }

        // Link clients
        function linkClients(uint256 _fileId, address[] memory _clients) public onlyCourtOfficial {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(caseFiles[_fileId].linkedCourtOfficial == msg.sender, "You are not the linked court official for this case");

            for (uint256 i = 0; i < _clients.length; i++) {
                address client = _clients[i];
                require(!linkedClientsMap[_fileId][client], "Client is already linked to this case");
                linkedClientsMap[_fileId][client] = true; // Link client
                caseFiles[_fileId].linkedClients.push(client); // Add to array for external visibility
                emit ClientLinked(_fileId, client);
            }
        }

        // Replace court official for the case
        function replaceCourtOfficial(uint256 _fileId, address _newCourtOfficial) public {
            require(
                courtOfficials[msg.sender] || caseFiles[_fileId].linkedCourtOfficial == msg.sender,
                "You are not authorized to replace the official"
            );
            require(courtOfficials[_newCourtOfficial], "New official must be registered");

            caseFiles[_fileId].linkedCourtOfficial = _newCourtOfficial;

            emit CourtOfficialReplaced(_fileId, _newCourtOfficial);
        }

        // Clients or court officials can get case file details
        function getFile(uint256 _fileId) public view returns (
            address uploader,
            string memory ipfsHash,
            string memory title,
            string memory dateOfJudgment,
            string memory caseNumber,
            string memory category,
            string memory judgeName,
            address[] memory linkedClients,
            uint256 timestamp,
            address linkedCourtOfficial,
            uint256 version,
            string memory documentStatus,
            string memory documentType,
            string memory description,
            bool isVerified,
            address verifiedBy,
            uint256 lastModified,
            string[] memory previousVersions
        ) {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                courtOfficials[msg.sender] || 
                linkedClientsMap[_fileId][msg.sender] || 
                documentPermissions[_fileId][msg.sender],
                "Access denied"
            );

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
                file.timestamp,
                file.linkedCourtOfficial,
                file.version,
                file.documentStatus,
                file.documentType,
                file.description,
                file.isVerified,
                file.verifiedBy,
                file.lastModified,
                file.previousVersions
            );
        }

        // Search by title (clients can search for their own cases)
        function searchByTitle(string memory _title) public view returns (CaseFile[] memory) {
            uint256 matchCount = 0;

            // First, count how many case files match the title and are linked to the client
            for (uint256 i = 1; i <= totalCaseFiles; i++) {
                if (
                    keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title)) &&
                    linkedClientsMap[i][msg.sender]
                ) {
                    matchCount++;
                }
            }

            // Create an array to hold the matching case files
            CaseFile[] memory matchingFiles = new CaseFile[](matchCount);
            uint256 index = 0;

            // Populate the matchingFiles array with the matching case files where the client is linked
            for (uint256 i = 1; i <= totalCaseFiles; i++) {
                if (
                    keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title)) &&
                    linkedClientsMap[i][msg.sender]
                ) {
                    matchingFiles[index] = caseFiles[i];
                    index++;
                }
            }

            return matchingFiles;
        }

        // New function to update document
        function updateDocument(
            uint256 _fileId,
            string memory _newIpfsHash,
            string memory _description
        ) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                courtOfficials[msg.sender] || caseFiles[_fileId].linkedCourtOfficial == msg.sender,
                "Not authorized to update document"
            );

            CaseFile storage file = caseFiles[_fileId];
            file.previousVersions.push(file.ipfsHash);
            file.version++;
            file.ipfsHash = _newIpfsHash;
            file.description = _description;
            file.lastModified = block.timestamp;

            documentVersions[_fileId][file.version] = _newIpfsHash;
            documentVersionCount[_fileId] = file.version;

            emit DocumentUpdated(_fileId, _newIpfsHash, file.version);
        }

        // New function to verify document
        function verifyDocument(uint256 _fileId) public onlyCourtOfficial {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            
            CaseFile storage file = caseFiles[_fileId];
            file.isVerified = true;
            file.verifiedBy = msg.sender;

            emit DocumentVerified(_fileId, msg.sender);
        }

        // New function to change document status
        function changeDocumentStatus(uint256 _fileId, string memory _newStatus) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                courtOfficials[msg.sender] || caseFiles[_fileId].linkedCourtOfficial == msg.sender,
                "Not authorized to change status"
            );

            CaseFile storage file = caseFiles[_fileId];
            file.documentStatus = _newStatus;
            file.lastModified = block.timestamp;

            emit DocumentStatusChanged(_fileId, _newStatus);
        }

        // New function to grant document permissions
        function grantDocumentPermission(uint256 _fileId, address _user) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                courtOfficials[msg.sender] || caseFiles[_fileId].linkedCourtOfficial == msg.sender,
                "Not authorized to grant permissions"
            );

            documentPermissions[_fileId][_user] = true;
            emit DocumentPermissionGranted(_fileId, _user);
        }

        // New function to revoke document permissions
        function revokeDocumentPermission(uint256 _fileId, address _user) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                courtOfficials[msg.sender] || caseFiles[_fileId].linkedCourtOfficial == msg.sender,
                "Not authorized to revoke permissions"
            );

            documentPermissions[_fileId][_user] = false;
            emit DocumentPermissionRevoked(_fileId, _user);
        }

        // New function to get document version history
        function getDocumentVersions(uint256 _fileId) public view returns (string[] memory) {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                courtOfficials[msg.sender] || 
                linkedClientsMap[_fileId][msg.sender] || 
                documentPermissions[_fileId][msg.sender],
                "Access denied"
            );

            uint256 versionCount = documentVersionCount[_fileId];
            string[] memory versions = new string[](versionCount);
            
            for(uint256 i = 1; i <= versionCount; i++) {
                versions[i-1] = documentVersions[_fileId][i];
            }
            
            return versions;
        }
    }