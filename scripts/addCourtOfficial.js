require('dotenv').config(); // Load environment variables
const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.NAVINEVAULT_CONTRACT_ADDRESS; // Read from .env
  const [owner, lawyer] = await hre.ethers.getSigners(); // Using second account as lawyer

  const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress);

  const tx = await NavinEvault.addCourtOfficial(lawyer.address);
  await tx.wait();

  console.log(`Added court official: ${lawyer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
