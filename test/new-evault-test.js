const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  
  describe("NewEVault", function () {
    // Fixture to deploy the NewEVault contract and set up initial state
    async function deployNewEVaultFixture() {
      const [owner, lawyer, client, otherAccount] = await ethers.getSigners();
  
      const NewEVault = await ethers.getContractFactory("NewEVault");
      const newEvault = await NewEVault.deploy();
  
      // Add lawyer and client as court officials
      await newEvault.addCourtOfficial(lawyer.address);
      await newEvault.addCourtOfficial(client.address);
  
      return { newEvault, owner, lawyer, client, otherAccount };
    }
  
    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { newEvault, owner } = await loadFixture(deployNewEVaultFixture);
        expect(await newEvault.owner()).to.equal(owner.address);
      });
    });
  
    describe("Court Official Functions", function () {
      it("Should verify if an address is a court official", async function () {
        const { newEvault, lawyer, otherAccount } = await loadFixture(deployNewEVaultFixture);
        expect(await newEvault.isCourtOfficial(lawyer.address)).to.equal(true);
        expect(await newEvault.isCourtOfficial(otherAccount.address)).to.equal(false);
      });
  
      it("Should allow owner to add a court official", async function () {
        const { newEvault, owner, otherAccount } = await loadFixture(deployNewEVaultFixture);
        await newEvault.connect(owner).addCourtOfficial(otherAccount.address);
        expect(await newEvault.isCourtOfficial(otherAccount.address)).to.equal(true);
      });
  
      it("Should allow owner to remove a court official", async function () {
        const { newEvault, owner, lawyer } = await loadFixture(deployNewEVaultFixture);
        await newEvault.connect(owner).removeCourtOfficial(lawyer.address);
        expect(await newEvault.isCourtOfficial(lawyer.address)).to.equal(false);
      });
    });
  
    describe("File Upload", function () {
      it("Should upload a file successfully by a court official", async function () {
        const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
  
        await newEvault.connect(lawyer).uploadFile(
          "QmSomeIpfsHash",
          "Case Title",
          "2024-09-17",
          "Case123",
          "Criminal",
          "Judge Doe"
        );
  
        expect(await newEvault.totalCaseFiles()).to.equal(1);
      });
  
      it("Should fail if a non-court official tries to upload a file", async function () {
        const { newEvault, otherAccount } = await loadFixture(deployNewEVaultFixture);
  
        await expect(
          newEvault.connect(otherAccount).uploadFile(
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
        const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
  
        await expect(
          newEvault.connect(lawyer).uploadFile(
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
        const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
  
        await newEvault.connect(lawyer).uploadFile(
          "QmSomeIpfsHash",
          "Case Title",
          "2024-09-17",
          "Case123",
          "Criminal",
          "Judge Doe"
        );
  
        const result = await newEvault.searchByTitle("Case Title");
        expect(result.length).to.equal(1);
      });
  
      it("Should return multiple files if more than one match the search criteria", async function () {
        const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
  
        await newEvault.connect(lawyer).uploadFile(
          "QmSomeIpfsHash1",
          "Case Title A",
          "2024-09-17",
          "Case123",
          "Criminal",
          "Judge Doe"
        );
  
        await newEvault.connect(lawyer).uploadFile(
          "QmSomeIpfsHash2",
          "Case Title B",
          "2024-09-18",
          "Case124",
          "Civil",
          "Judge Doe"
        );
  
        const result = await newEvault.searchByTitle("Case Title A");
        expect(result.length).to.equal(1);
      });
    });
  });
  