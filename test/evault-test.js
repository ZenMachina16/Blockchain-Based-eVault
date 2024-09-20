const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("EVault", function () {
  // Fixture to deploy the EVault contract and set up initial state
  async function deployEVaultFixture() {
    const [owner, lawyer, client, otherAccount] = await ethers.getSigners();

    const EVault = await ethers.getContractFactory("EVault");
    const evault = await EVault.deploy();

    // Add lawyer and client as court officials
    await evault.addCourtOfficial(lawyer.address);
    await evault.addCourtOfficial(client.address);

    return { evault, owner, lawyer, client, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { evault, owner } = await loadFixture(deployEVaultFixture);

      expect(await evault.owner()).to.equal(owner.address);
    });
  });

  describe("File Upload", function () {
    it("Should upload a file successfully by a court official", async function () {
      const { evault, lawyer } = await loadFixture(deployEVaultFixture);

      // Use .connect(lawyer) to specify the transaction sender
      await evault.connect(lawyer).uploadFile(
        "QmSomeIpfsHash",
        "Case Title",
        "2024-09-17",
        "Case123",
        "Criminal",
        "Judge Doe"
      );

      expect(await evault.totalCaseFiles()).to.equal(1);
    });

    it("Should fail if a non-court official tries to upload a file", async function () {
      const { evault, otherAccount } = await loadFixture(deployEVaultFixture);

      // Use .connect(otherAccount) to simulate the wrong user trying to upload a file
      await expect(
        evault.connect(otherAccount).uploadFile(
          "QmSomeIpfsHash",
          "Case Title",
          "2024-09-17",
          "Case123",
          "Criminal",
          "Judge Doe"
        )
      ).to.be.revertedWith("Only court officials can upload files");
    });

    it("Should fail if required file fields are missing", async function () {
      const { evault, lawyer } = await loadFixture(deployEVaultFixture);

      // Attempt to upload a file with a missing IPFS hash
      await expect(
        evault.connect(lawyer).uploadFile(
          "", // Missing IPFS hash
          "Case Title",
          "2024-09-17",
          "Case123",
          "Criminal",
          "Judge Doe"
        )
      ).to.be.revertedWith("IPFS hash is required");
    });
  });

  describe("Search Functions", function () {
    it("Should return the correct case file when searching by title", async function () {
      const { evault, lawyer } = await loadFixture(deployEVaultFixture);

      // Upload a file to search for later
      await evault.connect(lawyer).uploadFile(
        "QmSomeIpfsHash",
        "Case Title",
        "2024-09-17",
        "Case123",
        "Criminal",
        "Judge Doe"
      );

      const result = await evault.searchByTitle("Case Title");
      expect(result.length).to.equal(1);
    });

    it("Should return multiple files if more than one match the search criteria", async function () {
      const { evault, lawyer } = await loadFixture(deployEVaultFixture);

      // Upload two files with different titles
      await evault.connect(lawyer).uploadFile(
        "QmSomeIpfsHash1",
        "Case Title A",
        "2024-09-17",
        "Case123",
        "Criminal",
        "Judge Doe"
      );

      await evault.connect(lawyer).uploadFile(
        "QmSomeIpfsHash2",
        "Case Title B",
        "2024-09-18",
        "Case124",
        "Civil",
        "Judge Doe"
      );

      // Search for "Case Title A"
      const result = await evault.searchByTitle("Case Title A");
      expect(result.length).to.equal(1);
    });
  });
});
