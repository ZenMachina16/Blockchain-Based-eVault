const hre = require("hardhat");

async function main() {
    const contractAddress = process.env.NAVINEVAULT_CONTRACT_ADDRESS; // Load contract address from .env
    const [_, lawyer] = await hre.ethers.getSigners();

    const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress);
    
    // Get the total number of case files
    const totalCaseFiles = await NavinEvault.totalCaseFiles();

    console.log(`Total Case Files: ${totalCaseFiles.toString()}`);

    // Retrieve and display each case file's details
    for (let i = 1; i <= totalCaseFiles; i++) {
        try {
            const fileData = await NavinEvault.getFile(i); // Pass file ID

            console.log(`File ID: ${i}`);
            console.log(`Uploader: ${fileData.uploader}`);
            console.log(`IPFS Hash: ${fileData.ipfsHash}`);
            console.log(`Title: ${fileData.title}`);
            console.log(`Date of Judgment: ${fileData.dateOfJudgment}`);
            console.log(`Case Number: ${fileData.caseNumber}`);
            console.log(`Category: ${fileData.category}`);
            console.log(`Judge Name: ${fileData.judgeName}`);
            // Handling linked clients
            const linkedClients = fileData.linkedClients.length > 0 ? fileData.linkedClients.join(', ') : 'No clients linked';
            console.log(`Linked Clients: ${linkedClients}`);
            // Convert timestamp to human-readable format
            const timestamp = fileData.timestamp;
            const timestampValue = typeof timestamp === "object" && timestamp.toString ? timestamp.toString() : timestamp; // Ensure it can be converted
            console.log(`Timestamp: ${new Date(parseInt(timestampValue) * 1000).toLocaleString()}`);
            console.log('-----------------------------------');
        } catch (error) {
            console.error(`Error retrieving file with ID ${i}:`, error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
