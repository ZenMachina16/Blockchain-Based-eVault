const { expect } = require("chai");
const request = require("supertest");
const app = require("../path/to/your/server"); // Adjust the path to your server file
const Web3 = require("web3");
const fs = require("fs");

describe("Store Hash in Contract", () => {
  it("should upload file to Pinata and store hash in contract", async () => {
    const filePath = "path/to/your/testFile.txt";
    const fileName = "testFile.txt";

    // Ensure the file exists
    expect(fs.existsSync(filePath)).to.be.true;

    const response = await request(app).post("/store-hash").send({
      filePath,
      fileName,
      functionName: "storeHash", // Update with your actual function name
      account: "0xYourEthereumAccountAddress", // Update with your actual account
    });

    // Check if the response is successful
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      "message",
      "File uploaded and hash stored in contract",
    );
    expect(response.body).to.have.property("ipfsHash");
    expect(response.body).to.have.property("transaction");
  });
});
