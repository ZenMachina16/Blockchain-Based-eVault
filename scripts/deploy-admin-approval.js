const hre = require("hardhat");

async function main() {
  // Deploy the NavinEvault contract
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const navinEvault = await NavinEvault.deploy();

  await navinEvault.waitForDeployment();

  const deployedAddress = await navinEvault.getAddress();
  console.log(`NavinEvault contract deployed to: ${deployedAddress}`);

  // Get deployer address (will be the owner and an admin)
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Contract owner and admin: ${deployer.address}`);

  // Add another address as admin for testing (optional)
  // const adminAddress = "0xYourAdminAddressHere"; // Replace with your desired admin address
  // await navinEvault.addAdmin(adminAddress);
  // console.log(`Added ${adminAddress} as admin`);

  console.log("\nSetup for testing:");
  console.log("1. Update the contract address in your .env file:");
  console.log(`REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS=${deployedAddress}`);
  console.log("\n2. Use the owner account to approve any lawyer applications.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 