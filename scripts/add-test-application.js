const hre = require("hardhat");

async function main() {
  // Get the contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get signers
  const [owner, admin] = await hre.ethers.getSigners();
  console.log("Using owner address:", owner.address);

  // Get the contract instance
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const contract = await NavinEvault.attach(contractAddress);

  // Print pending status of owner account
  const isPending = await contract.pendingLawyers(owner.address);
  console.log("Owner account pending status:", isPending);
  
  try {
    // If not already pending, submit an application
    if (!isPending) {
      console.log("Submitting lawyer application from account:", owner.address);
      
      const tx = await contract.requestLawyerStatus(
        "John Doe",
        "BAR123456",
        "john@example.com",
        "Additional information for testing"
      );
      
      await tx.wait();
      console.log("Application submitted successfully");
    } else {
      console.log("Account already has a pending application");
    }
    
    // Add a direct entry to the list for testing - this is a hacky approach just for testing
    // In reality, you'd need to fix the getPendingLawyerApplications function in your contract
    console.log("Testing if application is visible to admin from address:", admin.address);
    
    // Get pending applications
    const pendingApps = await contract.connect(admin).getPendingLawyerApplications();
    console.log("Pending applications:", pendingApps);
    
    // Show application details if available
    if (pendingApps.length > 0) {
      for (const addr of pendingApps) {
        const details = await contract.getLawyerApplicationDetails(addr);
        console.log("Application details:", details);
      }
    } else {
      console.log("No pending applications found. The getPendingLawyerApplications function may need fixing.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 