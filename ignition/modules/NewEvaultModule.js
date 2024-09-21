// ignition/modules/NewEVaultModule.js
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("NewEVaultModule", (m) => {
  // Deploy the NewEVault contract
  const newEvault = m.contract("NewEVault");

  return {
    newEvault,
    async run() {
      console.log("NewEVault contract deployed at:", newEvault.address);
      // You can add more logic here, such as initializing state or interacting with other contracts
    }
  };
});
