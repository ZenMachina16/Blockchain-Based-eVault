// scripts/uploadAndStore.js

const fs = require("fs"); // Import the fs module
const path = require("path");
const { uploadToPinata, storeHashInContract } = require("./pinataIntegration"); // Import the functions from pinataIntegration.js

// Define your input parameters
const filePath = 'C:\\Kapil\\Blockchain-Based-eVault\\hello-world.txt'; // Use double backslashes or single forward slashes
const title = "Backend Works great"; // Adjust as needed
const dateOfJudgment = "2024-10-18"; // Replace with the actual date
const caseNumber = "12346"; // Replace with the actual case number
const category = "Blockchain"; // Replace with the actual category
const judgeName = "Rajat Dalal"; // Replace with the actual judge name
const linkedClients = [
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
]; // Replace with actual linked client addresses

// Function to upload the file and store the IPFS hash
(async () => {
    try {
        // Create a file stream for reading the file
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);

        const ipfsHash = await uploadToPinata(fileStream, fileName); // Upload to Pinata
        console.log("Uploaded to Pinata. IPFS Hash:", ipfsHash);
        
        await storeHashInContract(ipfsHash, title, dateOfJudgment, caseNumber, category, judgeName, linkedClients); // Store the hash in your contract
    } catch (error) {
        console.error("Error during upload and storage process:", error);
    }
})();