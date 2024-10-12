const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NavinEvault Contract", function () {
  let NavinEvault, navinEvault;
  let owner, courtOfficial1, courtOfficial2, client1, client2, nonCourtOfficial;

  beforeEach(async function () {
    NavinEvault = await ethers.getContractFactory("NavinEvault");
    [
      owner,
      courtOfficial1,
      courtOfficial2,
      client1,
      client2,
      nonCourtOfficial,
    ] = await ethers.getSigners();
    navinEvault = await NavinEvault.deploy();

    // Set up court officials and clients
    await navinEvault.connect(owner).addCourtOfficial(courtOfficial1.address);
    await navinEvault.connect(owner).addCourtOfficial(courtOfficial2.address);
    await navinEvault.connect(owner).addClient(client1.address);
    await navinEvault.connect(owner).addClient(client2.address);
  });

  it("Should allow a court official to upload a file and link clients", async function () {
    const linkedClients = [client1.address, client2.address];

    await navinEvault.connect(courtOfficial1).uploadFile(
      "QmTestHash", // IPFS hash
      "Case Title",
      "2024-10-08", // Date of Judgment
      "12345", // Case Number
      "Criminal", // Category
      "Judge Name", // Judge Name
      linkedClients
    );

    const caseDetails = await navinEvault.connect(client1).getFile(1); // Linked client should be able to access
    expect(caseDetails.title).to.equal("Case Title");
    expect(caseDetails.linkedClients).to.deep.equal(linkedClients);
    expect(caseDetails.linkedCourtOfficial).to.equal(courtOfficial1.address);
  });

  it("Should allow a client to upload a file (if authorized) and link themselves", async function () {
    const linkedClients = [client1.address];

    // Assume we are adding client1 as a court official for this test
    await navinEvault.connect(owner).addCourtOfficial(client1.address);

    await navinEvault.connect(client1).uploadFile(
      "QmClientHash", // IPFS hash
      "Client Case",
      "2024-10-10", // Date of Judgment
      "98765", // Case Number
      "Civil", // Category
      "Judge Client", // Judge Name
      linkedClients
    );

    const caseDetails = await navinEvault.connect(client1).getFile(1); // Adjust this if your file ID is different
    expect(caseDetails.title).to.equal("Client Case");
    expect(caseDetails.linkedClients).to.deep.equal(linkedClients);
    expect(caseDetails.linkedCourtOfficial).to.equal(client1.address);
  });

  it("Should revert if a non-client or non-court-official tries to upload a file", async function () {
    const linkedClients = [client1.address];

    await expect(
      navinEvault
        .connect(nonCourtOfficial)
        .uploadFile(
          "QmTestHash",
          "Invalid Upload",
          "2024-10-08",
          "54321",
          "Invalid",
          "Invalid Judge",
          linkedClients
        )
    ).to.be.revertedWith("Only authorized users can upload files"); // Updated to match actual error
  });

  it("Should allow a court official to link additional clients", async function () {
    const initialClients = [client1.address];

    // Upload a file with one client
    await navinEvault
      .connect(courtOfficial1)
      .uploadFile(
        "QmTestHash",
        "Case Title",
        "2024-10-08",
        "12345",
        "Criminal",
        "Judge Name",
        initialClients
      );

    // Link additional client
    await navinEvault.connect(courtOfficial1).linkClients(1, [client2.address]);

    const caseDetails = await navinEvault.connect(client1).getFile(1); // Check case details
    expect(caseDetails.linkedClients).to.deep.equal([
      client1.address,
      client2.address,
    ]);
  });

  it("Should revert if trying to link a client already linked", async function () {
    const linkedClients = [client1.address];

    // Upload a file with one client
    await navinEvault
      .connect(courtOfficial1)
      .uploadFile(
        "QmTestHash",
        "Case Title",
        "2024-10-08",
        "12345",
        "Criminal",
        "Judge Name",
        linkedClients
      );

    // Attempt to link the same client again
    await expect(
      navinEvault.connect(courtOfficial1).linkClients(1, [client1.address])
    ).to.be.revertedWith("Client is already linked to this case");
  });

  it("Should allow a court official to replace themselves with another court official", async function () {
    const linkedClients = [client1.address];

    await navinEvault.connect(courtOfficial1).uploadFile(
      "QmTestHash", // IPFS hash
      "Case Title",
      "2024-10-08", // Date of Judgment
      "12345", // Case Number
      "Criminal", // Category
      "Judge Name", // Judge Name
      linkedClients
    );

    // Replace court official
    await navinEvault
      .connect(courtOfficial1)
      .replaceCourtOfficial(1, courtOfficial2.address);

    const caseDetails = await navinEvault.connect(client1).getFile(1); // Client should still be able to access
    expect(caseDetails.linkedCourtOfficial).to.equal(courtOfficial2.address);
  });

  it("Should prevent non-linked users from accessing the case file", async function () {
    const linkedClients = [client1.address];

    // Court official uploads a file
    await navinEvault
      .connect(courtOfficial1)
      .uploadFile(
        "QmTestHash",
        "Case Title",
        "2024-10-08",
        "12345",
        "Criminal",
        "Judge Name",
        linkedClients
      );

    // Non-linked user (nonCourtOfficial) tries to access the file
    await expect(
      navinEvault.connect(nonCourtOfficial).getFile(1)
    ).to.be.revertedWith("Access denied: You are not linked to this case");
  });

  it("Should allow clients to search for their linked cases by title", async function () {
    const linkedClients = [client1.address];

    // Upload a file with one client
    await navinEvault
      .connect(courtOfficial1)
      .uploadFile(
        "QmTestHash",
        "Case A",
        "2024-10-08",
        "12345",
        "Criminal",
        "Judge Name",
        linkedClients
      );

    // Client1 searches for "Case A"
    const result = await navinEvault.connect(client1).searchByTitle("Case A");
    expect(result.length).to.equal(1);
    expect(result[0].ipfsHash).to.equal("QmTestHash");
    expect(result[0].title).to.equal("Case A");

    // Client2 searches for "Case A" but is not linked, should get an empty array
    const resultNotLinked = await navinEvault
      .connect(client2)
      .searchByTitle("Case A");
    expect(resultNotLinked.length).to.equal(0);

    // Search for a non-existent title
    const resultNonExistent = await navinEvault
      .connect(client1)
      .searchByTitle("NonExistentTitle");
    expect(resultNonExistent.length).to.equal(0);
  });
});