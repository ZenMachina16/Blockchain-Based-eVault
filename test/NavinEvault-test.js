const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NavinEvault Contract", function () {
    let NavinEvault, navinEvault;
    let owner, courtOfficial1, courtOfficial2, client1, client2, nonCourtOfficial;

    beforeEach(async function () {
        NavinEvault = await ethers.getContractFactory("NavinEvault");
        [owner, courtOfficial1, courtOfficial2, client1, client2, nonCourtOfficial] = await ethers.getSigners();
        navinEvault = await NavinEvault.deploy();
        await navinEvault.waitForDeployment();

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

    it("Should revert if a non-court-official tries to upload a file", async function () {
        const linkedClients = [client1.address];

        await expect(
            navinEvault.connect(nonCourtOfficial).uploadFile(
                "QmTestHash",
                "Case Title",
                "2024-10-08",
                "12345",
                "Criminal",
                "Judge Name",
                linkedClients
            )
        ).to.be.revertedWith("Only court officials can upload files");
    });

    it("Should allow a court official to link additional clients", async function () {
        const initialClients = [client1.address];

        // Upload a file with one client
        await navinEvault.connect(courtOfficial1).uploadFile(
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
        expect(caseDetails.linkedClients).to.deep.equal([client1.address, client2.address]);
    });

    it("Should revert if trying to link a client already linked", async function () {
        const linkedClients = [client1.address];

        // Upload a file with one client
        await navinEvault.connect(courtOfficial1).uploadFile(
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
        await navinEvault.connect(courtOfficial1).replaceCourtOfficial(1, courtOfficial2.address);

        const caseDetails = await navinEvault.connect(client1).getFile(1); // Client should still be able to access
        expect(caseDetails.linkedCourtOfficial).to.equal(courtOfficial2.address);
    });

    it("Should revert if a non-linked court official tries to replace the current court official", async function () {
        const linkedClients = [client1.address];

        // Court official 1 uploads the file
        await navinEvault.connect(courtOfficial1).uploadFile(
            "QmTestHash",
            "Case Title",
            "2024-10-08",
            "12345",
            "Criminal",
            "Judge Name",
            linkedClients
        );

        // Court official 2 tries to replace court official 1 without being linked
        await expect(
            navinEvault.connect(courtOfficial2).replaceCourtOfficial(1, courtOfficial2.address)
        ).to.be.revertedWith("You are not the current linked court official for this case");
    });

    it("Should allow clients and court officials to access the case file", async function () {
        const linkedClients = [client1.address, client2.address];

        // Court official uploads a file
        await navinEvault.connect(courtOfficial1).uploadFile(
            "QmTestHash",
            "Case Title",
            "2024-10-08",
            "12345",
            "Criminal",
            "Judge Name",
            linkedClients
        );

        // Client1 tries to access the file
        const caseDetailsClient1 = await navinEvault.connect(client1).getFile(1);
        expect(caseDetailsClient1.title).to.equal("Case Title");

        // Court official1 tries to access the file
        const caseDetailsCourtOfficial = await navinEvault.connect(courtOfficial1).getFile(1);
        expect(caseDetailsCourtOfficial.title).to.equal("Case Title");
    });

    it("Should prevent non-linked users from accessing the case file", async function () {
        const linkedClients = [client1.address];

        // Court official uploads a file
        await navinEvault.connect(courtOfficial1).uploadFile(
            "QmTestHash",
            "Case Title",
            "2024-10-08",
            "12345",
            "Criminal",
            "Judge Name",
            linkedClients
        );

        // Non-linked user (nonCourtOfficial) tries to access the file
        await expect(navinEvault.connect(nonCourtOfficial).getFile(1))
            .to.be.revertedWith("Access denied: You are not linked to this case");
    });

    it("Should allow clients to search for their own cases by title", async function () {
        const linkedClients1 = [client1.address];
        const linkedClients2 = [client2.address];

        // Upload first case by courtOfficial1
        await navinEvault.connect(courtOfficial1).uploadFile(
            "QmTestHash1",
            "Case A",
            "2024-10-08",
            "12345",
            "Criminal",
            "Judge A",
            linkedClients1
        );

        // Upload second case by courtOfficial2
        await navinEvault.connect(courtOfficial2).uploadFile(
            "QmTestHash2",
            "Case B",
            "2024-10-09",
            "67890",
            "Civil",
            "Judge B",
            linkedClients2
        );

        // Client1 searches for their case by title
        const searchResultClient1 = await navinEvault.connect(client1).searchByTitle("Case A");
        expect(searchResultClient1[0].title).to.equal("Case A");

        // Client2 searches for their case by title
        const searchResultClient2 = await navinEvault.connect(client2).searchByTitle("Case B");
        expect(searchResultClient2[0].title).to.equal("Case B");
    });
});