const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("VaultModule", (m) => {
  const vault = m.contract("Vault"); // Ensure "Vault" matches the contract name exactly

  return {
    vault,
    async run() {
      console.log("Vault contract deployed at:", vault.address);
    },
  };
});
