const hre = require("hardhat");

async function main() {
  // Get the contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get signers
  const [owner] = await hre.ethers.getSigners();
  console.log("Using owner address:", owner.address);

  // Get the contract instance
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const contract = await NavinEvault.attach(contractAddress);

  // Get all accounts from hardhat
  const accounts = await hre.ethers.getSigners();
  console.log(`Checking ${accounts.length} accounts for pending applications...`);
  
  // Check each account for pending status
  const pendingAccounts = [];
  
  for (const account of accounts) {
    const address = await account.getAddress();
    const isPending = await contract.pendingLawyers(address);
    
    if (isPending) {
      // Get application details if available
      try {
        const details = await contract.lawyerApplications(address);
        
        // Only consider applications that are not yet reviewed
        if (!details.isReviewed) {
          pendingAccounts.push({
            address,
            name: details.name,
            barNumber: details.barNumber,
            email: details.email,
            additionalInfo: details.additionalInfo,
            applicationDate: Number(details.applicationDate)
          });
          console.log(`Found pending application for: ${address}`);
          console.log(`Name: ${details.name}, Bar Number: ${details.barNumber}`);
          console.log("-----------------");
        }
      } catch (err) {
        console.error(`Error getting details for ${address}:`, err);
      }
    }
  }
  
  console.log(`Total pending applications found: ${pendingAccounts.length}`);
  console.log("Pending accounts:", pendingAccounts);
  
  if (pendingAccounts.length > 0) {
    console.log("\nTo manually approve an application, run:");
    console.log(`npx hardhat run scripts/approve-lawyer.js ${pendingAccounts[0].address} --network localhost`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 