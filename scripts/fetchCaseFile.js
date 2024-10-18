const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Fetching case file with the account:", deployer.address);

    const NavinEvault = await ethers.getContractFactory("NavinEvault");
    const contract = await NavinEvault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

    try {
        const totalFiles = await contract.totalCaseFiles();
        console.log(`Total case files: ${totalFiles.toString()}`);
        console.log(`Type of totalFiles: ${typeof totalFiles}`);

        if (totalFiles === 0n) {
            console.log("No case files exist. Please upload a case file before fetching.");
            return;
        }

        for (let i = 1; i <= totalFiles; i++) {
            const caseFile = await contract.getFile(i);
            const caseFileData = {
                caseNumber: caseFile.caseNumber.toString(), // Assuming caseNumber is a BigInt
                title: caseFile.title || "N/A",
                ipfsHash: caseFile.ipfsHash || null,
                dateOfJudgment: caseFile.dateOfJudgment || "N/A",
                category: caseFile.category || "N/A",
                judgeName: caseFile.judgeName || "N/A",
                linkedClients: caseFile.linkedClients || [],
                metadata: {
                    uploader: caseFile.uploader || "N/A",
                    timestamp: caseFile.timestamp.toString() || "N/A"
                }
            };

            console.log(JSON.stringify(caseFileData, null, 2)); // Pretty-print JSON
        }
    } catch (error) {
        console.error(JSON.stringify({ error: error.message || error }));
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(JSON.stringify({ error: error.message || error }));
    process.exitCode = 1;
});
