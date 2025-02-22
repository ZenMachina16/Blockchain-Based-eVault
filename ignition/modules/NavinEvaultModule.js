// ignition/modules/NavinEvaultModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NavinEvaultModule", (m) => {
  // Deploy the NavinEvault contract
  const navinEvault = m.contract("NavinEvault");

  return {
    navinEvault, // Correctly returning navinEvault instead of newEvault
    async run() {
      console.log("NavinEvault contract deployed at:", navinEvault.address);
      // You can add more logic here, such as initializing state or interacting with other contracts
    },
  };
});
