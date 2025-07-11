const hre = require("hardhat");

async function main() {
  // Get the contract address from deployment
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get the owner's signer (Account #0) 
  const [owner, account1] = await hre.ethers.getSigners();
  console.log("Using owner address:", owner.address);
  console.log("Making this address an admin:", account1.address);

  // Get the contract instance
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const contract = await NavinEvault.attach(contractAddress);

  try {
    // Check if already an admin
    const isAdmin = await contract.admins(account1.address);
    if (isAdmin) {
      console.log("Address is already an admin");
      process.exit(0);
    }

    // Add the admin
    console.log("Adding admin:", account1.address);
    const tx = await contract.addAdmin(account1.address);
    await tx.wait();
    console.log("Successfully added admin:", account1.address);
    
    // Print message about using MetaMask
    console.log("\nTo use this admin account in MetaMask:");
    console.log("1. Import this private key into MetaMask:");
    console.log("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
    console.log("2. Connect to http://localhost:8545 network");
    console.log("3. Navigate to the admin portal");
  } catch (error) {
    console.error("Error adding admin:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 