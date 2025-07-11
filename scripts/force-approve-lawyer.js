const hre = require("hardhat");

async function main() {
  // Get the contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get signers
  const [owner, account1] = await hre.ethers.getSigners();
  console.log("Using owner address:", owner.address);
  console.log("Target account to approve:", account1.address);

  // Get the contract instance
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const contract = await NavinEvault.attach(contractAddress);

  // Check if account1 has a pending application
  const isPending = await contract.pendingLawyers(account1.address);
  console.log("Is pending lawyer:", isPending);
  
  try {
    // If not already pending, submit an application for account1
    if (!isPending) {
      console.log("Submitting lawyer application for:", account1.address);
      
      // Submit application as account1
      const tx = await contract.connect(account1).requestLawyerStatus(
        "Jane Doe",
        "BAR654321",
        "jane@example.com",
        "Test application for approval"
      );
      
      await tx.wait();
      console.log("Application submitted successfully");
      
      // Verify it was registered
      const nowPending = await contract.pendingLawyers(account1.address);
      console.log("Now pending:", nowPending);
    }
    
    // Directly approve lawyer using the owner account
    console.log("Approving lawyer application...");
    const approveTx = await contract.approveLawyer(account1.address);
    await approveTx.wait();
    
    // Verify approval
    const isLawyer = await contract.isLawyer(account1.address);
    console.log("Is now a lawyer:", isLawyer);
    
    console.log("Lawyer approved successfully!");
    console.log("Use this account to access lawyer features:");
    console.log("Address:", account1.address);
    console.log("Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
    
  } catch (error) {
    console.error("Error:", error.message);
    // If the error contains "No pending request", then we need to create the request first
    if (error.message.includes("No pending request")) {
      console.log("No pending request found. Let's create one first.");
      // Implement the request creation here
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 