const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("DocumentStorageModule", (m) => {
  // Deploy the DocumentStorage contract
  const documentStorage = m.contract("DocumentStorage");

  return { documentStorage };
});
