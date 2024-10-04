require('dotenv').config();
const hre = require("hardhat");
const path = require('path');
const fs = require('fs'); // Add this to handle file streams
const { uploadToPinata } = require('./pinataIntegration');

async function main() {
  const contractAddress = process.env.NAVINEVAULT_CONTRACT_ADDRESS;
  const [_, lawyer] = await hre.ethers.getSigners();

  const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress);

  // Set the path for the file you want to upload to Pinata
  const filePath = path.join("C:/Kapil/Blockchain-Based-eVault/hello-world.txt");

  // Read the file stream
  const fileStream = fs.createReadStream(filePath);

  // Upload the file to Pinata (fileStream + filename)
  const ipfsHash = await uploadToPinata(fileStream, "hello-world.txt");
  console.log("IPFS Hash:", ipfsHash);

  // Prepare metadata for blockchain storage
  const title = "Sample Case File";
  const dateOfJudgment = "2023-09-30";
  const caseNumber = "123ABC";
  const category = "Civil";
  const judgeName = "Judge Judy";
  const linkedClients = ["0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"];

  // Call the contract function to store the hash and metadata
  const tx = await NavinEvault.connect(lawyer).uploadFile(
    ipfsHash,
    title,
    dateOfJudgment,
    caseNumber,
    category,
    judgeName,
    linkedClients
  );

  await tx.wait();
  console.log(`File uploaded and stored on blockchain with IPFS hash: ${ipfsHash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
