const hre = require("hardhat");

async function main() {
  // Get the lawyer address from command line args
  const lawyerAddress = process.argv[2];
  
  if (!lawyerAddress) {
    console.error("Please provide a lawyer address to approve");
    console.error("Usage: npx hardhat run scripts/approve-lawyer.js <lawyer-address> --network localhost");
    process.exit(1);
  }
  
  // Get the contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get signers
  const [owner] = await hre.ethers.getSigners();
  console.log("Using owner address:", owner.address);
  console.log("Approving lawyer at address:", lawyerAddress);

  // Get the contract instance
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const contract = await NavinEvault.attach(contractAddress);

  // Check if the application is pending
  const isPending = await contract.pendingLawyers(lawyerAddress);
  
  if (!isPending) {
    console.error(`No pending application found for address: ${lawyerAddress}`);
    process.exit(1);
  }
  
  try {
    // Approve the lawyer
    console.log("Approving lawyer application...");
    const tx = await contract.approveLawyer(lawyerAddress);
    await tx.wait();
    
    // Verify the lawyer was approved
    const isLawyer = await contract.isLawyer(lawyerAddress);
    console.log("Is now a lawyer:", isLawyer);
    
    if (isLawyer) {
      console.log("Lawyer approved successfully!");
      
      // Get application details
      try {
        const details = await contract.lawyerApplications(lawyerAddress);
        console.log("Application details:");
        console.log("- Name:", details.name);
        console.log("- Bar Number:", details.barNumber);
        console.log("- Email:", details.email);
      } catch (error) {
        console.error("Error fetching application details:", error.message);
      }
    } else {
      console.error("Failed to approve lawyer. Unknown error occurred.");
    }
  } catch (error) {
    console.error("Error approving lawyer:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 