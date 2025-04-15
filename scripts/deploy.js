const hre = require("hardhat");

async function main() {
  const NavinEvault = await hre.ethers.getContractFactory("NavinEvault");
  const navinEvault = await NavinEvault.deploy();

  await navinEvault.waitForDeployment();

  console.log("NavinEvault deployed to:", await navinEvault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 