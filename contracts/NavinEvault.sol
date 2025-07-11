    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;

    contract NavinEvault {
        address public owner;
        mapping(address => bool) private lawyers;
        mapping(address => bool) private clients;
        mapping(address => bool) public admins;
        mapping(address => bool) public pendingLawyers;
        mapping(address => LawyerApplication) public lawyerApplications;

        struct LawyerApplication {
            string name;
            string barNumber;
            string email;
            string additionalInfo;
            uint256 applicationDate;
            bool isReviewed;
            bool isApproved;
            address reviewedBy;
            uint256 reviewDate;
        }

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
        event LawyerRequestSubmitted(address indexed applicant, string name, string barNumber);
        event LawyerApproved(address indexed lawyer, address indexed approvedBy);
        event LawyerRejected(address indexed applicant, address indexed rejectedBy);
        event AdminAdded(address indexed admin);
        event AdminRemoved(address indexed admin);

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

        modifier onlyAdmin() {
            require(admins[msg.sender], "Only admins can perform this action");
            _;
        }

        constructor() {
            owner = msg.sender;
            admins[msg.sender] = true;
        }

        function addAdmin(address _admin) public onlyOwner {
            require(!admins[_admin], "Already an admin");
            admins[_admin] = true;
            emit AdminAdded(_admin);
        }

        function removeAdmin(address _admin) public onlyOwner {
            require(_admin != owner, "Cannot remove owner as admin");
            require(admins[_admin], "Not an admin");
            admins[_admin] = false;
            emit AdminRemoved(_admin);
        }

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

        function linkClients(uint256 _fileId, address[] memory _clients) public onlyLawyer {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(caseFiles[_fileId].linkedLawyer == msg.sender, "You are not the linked lawyer for this case");

            for (uint256 i = 0; i < _clients.length; i++) {
                address client = _clients[i];
                require(!linkedClientsMap[_fileId][client], "Client is already linked to this case");
                linkedClientsMap[_fileId][client] = true;
                
                address[] storage currentClients = caseFiles[_fileId].linkedClients;
                address[] memory newClients = new address[](currentClients.length + 1);
                for (uint256 j = 0; j < currentClients.length; j++) {
                    newClients[j] = currentClients[j];
                }
                newClients[currentClients.length] = client;
                caseFiles[_fileId].linkedClients = newClients;
                
                emit ClientLinked(_fileId, client);
            }
        }

        function replaceLawyer(uint256 _fileId, address _newLawyer) public {
            require(
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
                "You are not authorized to replace the lawyer"
            );
            require(lawyers[_newLawyer], "New lawyer must be registered");

            caseFiles[_fileId].linkedLawyer = _newLawyer;

            emit LawyerReplaced(_fileId, _newLawyer);
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

        function searchByTitle(string memory _title) public view returns (CaseFile[] memory) {
            uint256 matchCount = 0;

            for (uint256 i = 1; i <= totalCaseFiles; i++) {
                if (
                    keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title)) &&
                    linkedClientsMap[i][msg.sender]
                ) {
                    matchCount++;
                }
            }

            CaseFile[] memory matchingFiles = new CaseFile[](matchCount);
            uint256 index = 0;

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

        function verifyDocument(uint256 _fileId) public onlyLawyer {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            
            CaseFile storage file = caseFiles[_fileId];
            file.isVerified = true;
            file.verifiedBy = msg.sender;

            emit DocumentVerified(_fileId, msg.sender);
        }

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

        function grantDocumentPermission(uint256 _fileId, address _user) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
                "Not authorized to grant permissions"
            );

            documentPermissions[_fileId][_user] = true;
            emit DocumentPermissionGranted(_fileId, _user);
        }

        function revokeDocumentPermission(uint256 _fileId, address _user) public {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(
                lawyers[msg.sender] || caseFiles[_fileId].linkedLawyer == msg.sender,
                "Not authorized to revoke permissions"
            );

            documentPermissions[_fileId][_user] = false;
            emit DocumentPermissionRevoked(_fileId, _user);
        }

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

        function getAllDocumentHashes() public view returns (string[] memory) {
            if (totalCaseFiles == 0) {
                string[] memory emptyHashes = new string[](0);
                return emptyHashes;
            }
            
            uint256 nonEmptyCount = 0;
            for (uint256 i = 1; i <= totalCaseFiles; i++) {
                if (bytes(caseFiles[i].ipfsHash).length > 0) {
                    nonEmptyCount++;
                }
            }

            if (nonEmptyCount == 0) {
                string[] memory emptyHashes = new string[](0);
                return emptyHashes;
            }

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

        function getDocumentMetadata(string memory hash) public view returns (
            string memory title,
            string memory description,
            string memory fileType,
            string memory date
        ) {
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
            
            return ("", "", "", "");
        }

        function deleteDocument(string memory documentId) public {
            for (uint256 i = 0; i < totalCaseFiles; i++) {
                if (keccak256(bytes(caseFiles[i].ipfsHash)) == keccak256(bytes(documentId))) {
                    require(
                        msg.sender == caseFiles[i].uploader || msg.sender == owner,
                        "Only the uploader or owner can delete this document"
                    );
                    
                    caseFiles[i].ipfsHash = "";
                    caseFiles[i].documentStatus = "DELETED";
                    caseFiles[i].lastModified = block.timestamp;
                    
                    return;
                }
            }
            
            revert("Document not found");
        }

        function requestLawyerStatus(
            string memory _name,
            string memory _barNumber,
            string memory _email,
            string memory _additionalInfo
        ) public {
            require(!isLawyer(msg.sender), "Already a lawyer");
            require(!pendingLawyers[msg.sender], "Request already pending");
            
            pendingLawyers[msg.sender] = true;
            lawyerApplications[msg.sender] = LawyerApplication({
                name: _name,
                barNumber: _barNumber,
                email: _email,
                additionalInfo: _additionalInfo,
                applicationDate: block.timestamp,
                isReviewed: false,
                isApproved: false,
                reviewedBy: address(0),
                reviewDate: 0
            });
            
            emit LawyerRequestSubmitted(msg.sender, _name, _barNumber);
        }

        function approveLawyer(address _lawyer) public onlyAdmin {
            require(pendingLawyers[_lawyer], "No pending request");
            require(!lawyerApplications[_lawyer].isReviewed, "Already reviewed");
            
            lawyers[_lawyer] = true;
            pendingLawyers[_lawyer] = false;
            
            lawyerApplications[_lawyer].isReviewed = true;
            lawyerApplications[_lawyer].isApproved = true;
            lawyerApplications[_lawyer].reviewedBy = msg.sender;
            lawyerApplications[_lawyer].reviewDate = block.timestamp;
            
            emit LawyerApproved(_lawyer, msg.sender);
        }

        function rejectLawyer(address _lawyer) public onlyAdmin {
            require(pendingLawyers[_lawyer], "No pending request");
            require(!lawyerApplications[_lawyer].isReviewed, "Already reviewed");
            
            pendingLawyers[_lawyer] = false;
            
            lawyerApplications[_lawyer].isReviewed = true;
            lawyerApplications[_lawyer].isApproved = false;
            lawyerApplications[_lawyer].reviewedBy = msg.sender;
            lawyerApplications[_lawyer].reviewDate = block.timestamp;
            
            emit LawyerRejected(_lawyer, msg.sender);
        }
        
        function getLawyerApplicationDetails(address _lawyer) public view returns (
            string memory name,
            string memory barNumber,
            string memory email,
            string memory additionalInfo,
            uint256 applicationDate,
            bool isReviewed,
            bool isApproved,
            address reviewedBy,
            uint256 reviewDate
        ) {
            require(admins[msg.sender] || msg.sender == _lawyer, "Not authorized");
            
            LawyerApplication storage application = lawyerApplications[_lawyer];
            return (
                application.name,
                application.barNumber,
                application.email,
                application.additionalInfo,
                application.applicationDate,
                application.isReviewed,
                application.isApproved,
                application.reviewedBy,
                application.reviewDate
            );
        }
        
        function getPendingLawyerApplications() public view onlyAdmin returns (address[] memory) {
            uint256 count = 0;
            
            for (uint256 i = 0; i < totalCaseFiles; i++) {
                address applicant = caseFiles[i].uploader;
                if (pendingLawyers[applicant] && !lawyerApplications[applicant].isReviewed) {
                    count++;
                }
            }
            
            address[] memory pendingApplicants = new address[](count);
            uint256 index = 0;
            
            for (uint256 i = 0; i < totalCaseFiles; i++) {
                address applicant = caseFiles[i].uploader;
                if (pendingLawyers[applicant] && !lawyerApplications[applicant].isReviewed) {
                    pendingApplicants[index] = applicant;
                    index++;
                }
            }
            
            return pendingApplicants;
        }
    }