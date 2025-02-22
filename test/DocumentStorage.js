const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentStorage", function () {
  let DocumentStorage, documentStorage;

  beforeEach(async function () {
    DocumentStorage = await ethers.getContractFactory("DocumentStorage");
    documentStorage = await DocumentStorage.deploy();
    await documentStorage.deployed(); // Ensure the contract is deployed before running tests
  });

  it("Should deploy the contract correctly", async function () {
    expect(documentStorage.address).to.properAddress; // Check if the contract has a valid address
  });
});
