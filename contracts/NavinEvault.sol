    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;

    contract NavinEvault {
        address public owner;
        mapping(address => bool) private lawyers;
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
            address linkedLawyer;
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
            address linkedLawyer
        );

        event ClientLinked(uint256 indexed fileId, address client);
        event LawyerLinked(uint256 indexed fileId, address lawyer);
        event LawyerReplaced(uint256 indexed fileId, address newLawyer);
        event DocumentUpdated(uint256 indexed fileId, string newIpfsHash, uint256 version);
        event DocumentVerified(uint256 indexed fileId, address verifier);
        event DocumentStatusChanged(uint256 indexed fileId, string newStatus);
        event DocumentPermissionGranted(uint256 indexed fileId, address user);
        event DocumentPermissionRevoked(uint256 indexed fileId, address user);

        modifier onlyOwner() {
            require(msg.sender == owner, "Only the owner can perform this action");
            _;
        }

        modifier onlyLawyer() {
            require(lawyers[msg.sender], "Only lawyers can upload files");
            _;
        }

        modifier onlyAuthorizedUploader() {
            require(lawyers[msg.sender] || clients[msg.sender], "Only authorized users can upload files");
            _;
        }

        constructor() {
            owner = msg.sender;
        }

        // Register lawyers and clients
        function addLawyer(address _lawyer) public onlyOwner {
            lawyers[_lawyer] = true;
        }

        function removeLawyer(address _lawyer) public onlyOwner {
            lawyers[_lawyer] = false;
        }

        function addClient(address _client) public onlyOwner {
            clients[_client] = true;
        }

        function removeClient(address _client) public onlyOwner {
            clients[_client] = false;
        }

        function isLawyer(address _lawyer) public view returns (bool) {
            return lawyers[_lawyer];
        }

        function isClient(address _client) public view returns (bool) {
            return clients[_client];
        }

        // Allow authorized users (lawyers or clients) to upload files
        function uploadFile(
            string memory ipfsHash,
            string memory title,
            string memory description,
            string memory fileType,
            string memory caseNumber,
            string memory clientName,
            string memory clientEmail,
            string memory clientPhone,
            string memory clientAddress,
            string memory courtName,
            string memory judgeName,
            string memory filingDate,
            string memory status
        ) public onlyAuthorizedUploader {
            require(bytes(ipfsHash).length > 0, "IPFS hash is required");
            
            totalCaseFiles++;
            address linkedLawyer = lawyers[msg.sender] ? msg.sender : address(0);
            
            // Create an empty array for linkedClients if none exist yet
            address[] memory emptyClientArray = new address[](0);
            
            caseFiles[totalCaseFiles] = CaseFile({
                uploader: msg.sender,
                ipfsHash: ipfsHash,
                title: title,
                dateOfJudgment: filingDate,
                caseNumber: caseNumber,
                category: courtName,
                judgeName: judgeName,
                linkedClients: emptyClientArray,
                timestamp: block.timestamp,
                linkedLawyer: linkedLawyer,
                version: 1,
                documentStatus: status,
                documentType: fileType,
                description: description,
                isVerified: false,
                verifiedBy: address(0),
                lastModified: block.timestamp,
                previousVersions: new string[](0)
            });

            documentVersions[totalCaseFiles][1] = ipfsHash;
            documentVersionCount[totalCaseFiles] = 1;

            emit FileUploaded(
                msg.sender,
                totalCaseFiles,
                ipfsHash,
                title,
                filingDate,
                caseNumber,
                courtName,
                judgeName,
                block.timestamp,
                emptyClientArray,
                linkedLawyer
            );
        }

        // Link clients
        function linkClients(uint256 _fileId, address[] memory _clients) public onlyLawyer {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(caseFiles[_fileId].linkedLawyer == msg.sender, "You are not the linked lawyer for this case");

            for (uint256 i = 0; i < _clients.length; i++) {
                address client = _clients[i];
                require(!linkedClientsMap[_fileId][client], "Client is already linked to this case");
                linkedClientsMap[_fileId][client] = true; // Link client
                
                // Add to the clients array
                address[] storage currentClients = caseFiles[_fileId].linkedClients;
                // Create a new array with one more element
                address[] memory newClients = new address[](currentClients.length + 1);
                // Copy existing clients
                for (uint256 j = 0; j < currentClients.length; j++) {
                    newClients[j] = currentClients[j];
                }
                // Add the new client
                newClients[currentClients.length] = client;
                // Update the storage array
                caseFiles[_fileId].linkedClients = newClients;
                
                emit ClientLinked(_fileId, client);
            }
        }

        // Replace lawyer for the case
        function replaceLawyer(uint256 _fileId, address _newLawyer) public {
            require(
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
                "You are not authorized to replace the lawyer"
            );
            require(lawyers[_newLawyer], "New lawyer must be registered");

            caseFiles[_fileId].linkedLawyer = _newLawyer;

            emit LawyerReplaced(_fileId, _newLawyer);
        }

        // Clients or lawyers can get case file details
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
            address linkedLawyer,
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
                lawyers[msg.sender] || 
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
                file.linkedLawyer,
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
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
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
        function verifyDocument(uint256 _fileId) public onlyLawyer {
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
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
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
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
                "Not authorized to grant permissions"
            );

            documentPermissions[_fileId][_user] = true;
            emit DocumentPermissionGranted(_fileId, _user);
        }

        // New function to revoke document permissions
        function revokeDocumentPermission(uint256 _fileId, address _user) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
                "Not authorized to revoke permissions"
            );

            documentPermissions[_fileId][_user] = false;
            emit DocumentPermissionRevoked(_fileId, _user);
        }

        // New function to get document version history
        function getDocumentVersions(uint256 _fileId) public view returns (string[] memory) {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                lawyers[msg.sender] || 
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

        /**
         * @dev Returns all document hashes stored in the contract
         * @return Array of IPFS hashes
         */
        function getAllDocumentHashes() public view returns (string[] memory) {
            // If there are no documents, return an empty array
            if (totalCaseFiles == 0) {
                string[] memory emptyHashes = new string[](0);
                return emptyHashes;
            }
            
            // Count non-empty hashes
            uint256 nonEmptyCount = 0;
            for (uint256 i = 1; i <= totalCaseFiles; i++) {
                if (bytes(caseFiles[i].ipfsHash).length > 0) {
                    nonEmptyCount++;
                }
            }

            // If no non-empty hashes, return an empty array
            if (nonEmptyCount == 0) {
                string[] memory emptyHashes = new string[](0);
                return emptyHashes;
            }

            // Create array with only non-empty hashes
            string[] memory hashes = new string[](nonEmptyCount);
            uint256 index = 0;
            for (uint256 i = 1; i <= totalCaseFiles; i++) {
                if (bytes(caseFiles[i].ipfsHash).length > 0) {
                    hashes[index] = caseFiles[i].ipfsHash;
                    index++;
                }
            }
            return hashes;
        }

        /**
         * @dev Returns metadata for a specific document hash
         * @param hash The IPFS hash of the document
         * @return title The document title
         * @return description The document description
         * @return fileType The document type
         * @return date The document date
         */
        function getDocumentMetadata(string memory hash) public view returns (
            string memory title,
            string memory description,
            string memory fileType,
            string memory date
        ) {
            // Find the document with the given hash
            for (uint256 i = 0; i < totalCaseFiles; i++) {
                if (keccak256(bytes(caseFiles[i].ipfsHash)) == keccak256(bytes(hash))) {
                    return (
                        caseFiles[i].title,
                        caseFiles[i].description,
                        caseFiles[i].documentType,
                        caseFiles[i].dateOfJudgment
                    );
                }
            }
            
            // If not found, return empty strings
            return ("", "", "", "");
        }

        /**
         * @dev Deletes a document from the contract
         * @param documentId The IPFS hash of the document to delete
         */
        function deleteDocument(string memory documentId) public {
            // Find the document with the given hash
            for (uint256 i = 0; i < totalCaseFiles; i++) {
                if (keccak256(bytes(caseFiles[i].ipfsHash)) == keccak256(bytes(documentId))) {
                    // Only allow deletion by the uploader or the owner
                    require(
                        msg.sender == caseFiles[i].uploader || msg.sender == owner,
                        "Only the uploader or owner can delete this document"
                    );
                    
                    // Mark as deleted by setting the hash to empty
                    caseFiles[i].ipfsHash = "";
                    caseFiles[i].documentStatus = "DELETED";
                    caseFiles[i].lastModified = block.timestamp;
                    
                    return;
                }
            }
            
            // If not found, revert
            revert("Document not found");
        }
    }