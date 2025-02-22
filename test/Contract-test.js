const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract", function () {
  let Contract;
  let contract;
  let owner;
  let courtOfficial;
  let client1;
  let client2;
  let other;

  beforeEach(async function () {
    Contract = await ethers.getContractFactory("Contract");
    [owner, courtOfficial, client1, client2, other] = await ethers.getSigners();
    contract = await Contract.deploy();
    await contract.waitForDeployment();

    // Set up court official and clients
    await contract.connect(owner).addCourtOfficial(courtOfficial.address);
    await contract.connect(owner).addClient(client1.address);
    await contract.connect(owner).addClient(client2.address);
  });

  it("Should allow a court official to upload a file and link clients", async function () {
    const linkedClients = [client1.address, client2.address];

    await contract.connect(courtOfficial).uploadFile(
      "QmTestHash", // IPFS hash
      "Case Title",
      "2024-10-08", // Date of Judgment
      "12345", // Case Number
      "Criminal", // Category
      "Judge Name", // Judge Name
      linkedClients,
    );

    const caseDetails = await contract.getFile(1);
    expect(caseDetails.title).to.equal("Case Title");

    // Use 'have.members' to check array members without enforcing order
    expect(caseDetails.linkedClients).to.have.members(linkedClients);
  });

  it("Should allow court official to link additional clients to the case", async function () {
    const initialLinkedClients = [client1.address];

    // Upload file and link initial clients
    await contract
      .connect(courtOfficial)
      .uploadFile(
        "QmTestHash",
        "Case Title",
        "2024-10-08",
        "12345",
        "Criminal",
        "Judge Name",
        initialLinkedClients,
      );

    // Add additional clients
    await contract.connect(courtOfficial).linkClients(1, [client2.address]);

    const caseDetails = await contract.getFile(1);

    // Use 'have.members' to check the clients array without order enforcement
    expect(caseDetails.linkedClients).to.have.members([
      client1.address,
      client2.address,
    ]);
  });

  it("Should revert if a non-court-official tries to upload a file", async function () {
    const linkedClients = [client1.address];

    await expect(
      contract
        .connect(other)
        .uploadFile(
          "QmTestHash",
          "Unauthorized Case",
          "2024-10-08",
          "54321",
          "Civil",
          "Other Judge",
          linkedClients,
        ),
    ).to.be.revertedWith("Unauthorized uploader");
  });

  it("Should allow clients to view their own case files", async function () {
    const linkedClients = [client1.address];

    // Court official uploads a file
    await contract
      .connect(courtOfficial)
      .uploadFile(
        "QmTestHash",
        "Client Case",
        "2024-10-08",
        "56789",
        "Family",
        "Judge B",
        linkedClients,
      );

    // Client retrieves the file
    const caseDetails = await contract.connect(client1).getFile(1);
    expect(caseDetails.title).to.equal("Client Case");
  });

  it("Should revert if a non-linked client tries to access case files", async function () {
    const linkedClients = [client1.address];

    // Court official uploads a file
    await contract
      .connect(courtOfficial)
      .uploadFile(
        "QmTestHash",
        "Restricted Case",
        "2024-10-08",
        "67890",
        "Corporate",
        "Judge C",
        linkedClients,
      );

    // Other client attempts to retrieve the file
    await expect(contract.connect(other).getFile(1)).to.be.revertedWith(
      "Unauthorized access",
    );
  });

  it("Should allow searching files by title", async function () {
    const linkedClients = [client1.address];

    // Court official uploads a file
    await contract
      .connect(courtOfficial)
      .uploadFile(
        "QmTestHash",
        "Unique Case Title",
        "2024-10-08",
        "98765",
        "Tax",
        "Judge D",
        linkedClients,
      );

    // Search by title
    const result = await contract.searchByTitle("Unique Case Title");
    expect(result.length).to.equal(1);
    expect(result[0].title).to.equal("Unique Case Title");
  });
});
