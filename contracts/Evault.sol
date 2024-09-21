// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EVault {
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
        uint256 timestamp;
    }

    mapping(uint256 => CaseFile) public caseFiles;
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
        uint256 timestamp
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
        owner = msg.sender;  // Set the contract deployer as the owner
    }

    function addCourtOfficial(address _official) public onlyOwner {
        courtOfficials[_official] = true;
    }

    function removeCourtOfficial(address _official) public onlyOwner {
        courtOfficials[_official] = false;
    }

    function uploadFile(
        string memory _ipfsHash,
        string memory _title,
        string memory _dateOfJudgment,
        string memory _caseNumber,
        string memory _category,
        string memory _judgeName
    ) public onlyCourtOfficial {
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");

        totalCaseFiles++;
        caseFiles[totalCaseFiles] = CaseFile(
            msg.sender,
            _ipfsHash,
            _title,
            _dateOfJudgment,
            _caseNumber,
            _category,
            _judgeName,
            block.timestamp
        );

        emit FileUploaded(
            msg.sender,
            totalCaseFiles,
            _ipfsHash,
            _title,
            _dateOfJudgment,
            _caseNumber,
            _category,
            _judgeName,
            block.timestamp
        );
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
}