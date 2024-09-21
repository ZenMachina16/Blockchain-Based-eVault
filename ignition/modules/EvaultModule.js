// ignition/modules/EVaultModule.js
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("EVaultModule", (m) => {
  // Deploy the EVault contract
  const evault = m.contract("EVault");

  return {
    evault,
    async run() {
      console.log("EVault contract deployed at:", evault.address);
      // Add any additional logic here if needed
    }
  };
});
