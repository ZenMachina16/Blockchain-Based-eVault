const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("kevault", function () {
  let kevault, contractInstance, owner, courtOfficial, client1, client2;

  beforeEach(async function () {
    [owner, courtOfficial, client1, client2] = await ethers.getSigners();
    kevault = await ethers.getContractFactory("kevault");
    contractInstance = await kevault.deploy();
    await contractInstance.deployed();
  });

  it("Should verify if an address is a court official", async function () {
    const result = await contractInstance.isCourtOfficial(
      courtOfficial.address,
    );
    expect(result).to.be.false;
  });

  it("Should allow the owner to add a court official", async function () {
    await contractInstance.addCourtOfficial(courtOfficial.address);
    const result = await contractInstance.isCourtOfficial(
      courtOfficial.address,
    );
    expect(result).to.be.true;
  });

  it("Should allow a court official to upload a file", async function () {
    await contractInstance.addCourtOfficial(courtOfficial.address);
    const linkedClients = [client1.address, client2.address];

    const tx = await contractInstance
      .connect(courtOfficial)
      .uploadFile(
        "QmT6N8WnReB1vj1sa3GSkRPHCkWJFe6xQoiq6wFzPw5rJQ",
        "Case Title",
        "2023-10-01",
        "CASE123",
        "Criminal",
        "Judge A",
        linkedClients,
      );
    await tx.wait();

    const file = await contractInstance.getFile(1);
    expect(file.uploader).to.equal(courtOfficial.address);
    expect(file.title).to.equal("Case Title");
    expect(file.linkedClients).to.deep.equal(linkedClients);
  });

  it("Should not allow non-court officials to upload a file", async function () {
    const linkedClients = [client1.address];
    await expect(
      contractInstance.uploadFile(
        "QmT6N8WnReB1vj1sa3GSkRPHCkWJFe6xQoiq6wFzPw5rJQ",
        "Unauthorized Upload",
        "2023-10-01",
        "CASE999",
        "Civil",
        "Judge B",
        linkedClients,
      ),
    ).to.be.revertedWith("Only court officials can upload files");
  });

  it("Should allow linking a new client to an existing case file", async function () {
    await contractInstance.addCourtOfficial(courtOfficial.address);
    const linkedClients = [client1.address];

    await contractInstance
      .connect(courtOfficial)
      .uploadFile(
        "QmT6N8WnReB1vj1sa3GSkRPHCkWJFe6xQoiq6wFzPw5rJQ",
        "Case Title",
        "2023-10-01",
        "CASE123",
        "Criminal",
        "Judge A",
        linkedClients,
      );

    await contractInstance
      .connect(courtOfficial)
      .linkClient(1, client2.address);
    const file = await contractInstance.getFile(1);
    expect(file.linkedClients).to.include(client2.address);
  });

  it("Should return correct case file IDs when searching by title", async function () {
    await contractInstance.addCourtOfficial(courtOfficial.address);
    const linkedClients = [client1.address];

    await contractInstance
      .connect(courtOfficial)
      .uploadFile(
        "QmT6N8WnReB1vj1sa3GSkRPHCkWJFe6xQoiq6wFzPw5rJQ",
        "Case Title A",
        "2023-10-01",
        "CASE123",
        "Criminal",
        "Judge A",
        linkedClients,
      );

    await contractInstance
      .connect(courtOfficial)
      .uploadFile(
        "QmT6N8WnReB1vj1sa3GSkRPHCkWJFe6xQoiq6wFzPw5rJQ",
        "Case Title B",
        "2023-10-02",
        "CASE456",
        "Civil",
        "Judge B",
        linkedClients,
      );

    const matchingFiles = await contractInstance.searchByTitle("Case Title A");
    expect(matchingFiles.length).to.equal(1);
    expect(matchingFiles[0]).to.equal(1);
  });
});
