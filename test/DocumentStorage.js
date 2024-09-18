const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');
const { expect } = require('chai');
const { time, loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');

module.exports = buildModule("DocumentStorageModule", (m) => {
  // Deploy the DocumentStorage contract
  const documentStorage = m.contract("DocumentStorage");

  return { documentStorage };
});

describe("DocumentStorage", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployDocumentStorageFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // Deploy the DocumentStorage contract
    const DocumentStorage = await ethers.getContractFactory("DocumentStorage");
    const documentStorage = await DocumentStorage.deploy();

    return { documentStorage, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy the contract correctly", async function () {
      const { documentStorage } = await loadFixture(deployDocumentStorageFixture);

      expect(documentStorage.address).to.not.be.undefined;
    });
  });

  describe("Document Upload", function () {
    it("Should allow a user to upload a document", async function () {
      const { documentStorage, owner } = await loadFixture(deployDocumentStorageFixture);
      const ipfsHash = "QmTestHash12345";

      // Upload the document as the owner
      await documentStorage.uploadDocument(ipfsHash);

      // Verify the document hash was stored correctly
      const storedHash = await documentStorage.getDocumentHash(owner.address);
      expect(storedHash).to.equal(ipfsHash);
    });

    it("Should emit an event when a document is uploaded", async function () {
      const { documentStorage, owner } = await loadFixture(deployDocumentStorageFixture);
      const ipfsHash = "QmTestHash12345";

      // Expect the DocumentUploaded event to be emitted with the right arguments
      await expect(documentStorage.uploadDocument(ipfsHash))
        .to.emit(documentStorage, "DocumentUploaded")
        .withArgs(owner.address, ipfsHash);
    });

    it("Should allow another user to upload a document", async function () {
      const { documentStorage, otherAccount } = await loadFixture(deployDocumentStorageFixture);
      const ipfsHash = "QmAnotherTestHash54321";

      // Upload the document from another account
      await documentStorage.connect(otherAccount).uploadDocument(ipfsHash);

      // Verify the document hash was stored correctly for the other account
      const storedHash = await documentStorage.getDocumentHash(otherAccount.address);
      expect(storedHash).to.equal(ipfsHash);
    });
  });

  describe("Document Retrieval", function () {
    it("Should allow anyone to retrieve the document hash by user address", async function () {
      const { documentStorage, owner } = await loadFixture(deployDocumentStorageFixture);
      const ipfsHash = "QmTestHash12345";

      // Upload a document
      await documentStorage.uploadDocument(ipfsHash);

      // Retrieve the document hash from the contract
      const storedHash = await documentStorage.getDocumentHash(owner.address);
      expect(storedHash).to.equal(ipfsHash);
    });

    it("Should return an empty string if no document has been uploaded", async function () {
      const { documentStorage, owner } = await loadFixture(deployDocumentStorageFixture);

      // Check that an empty string is returned for an address with no document
      const storedHash = await documentStorage.getDocumentHash(owner.address);
      expect(storedHash).to.equal("");
    });
  });
});
