// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NavinEvault Contract", function () {
    let NavinEvault, navinEvault, owner, courtOfficial, client1, client2;

    beforeEach(async function () {
        // Deploy the contract before each test
        NavinEvault = await ethers.getContractFactory("NavinEvault");
        navinEvault = await NavinEvault.deploy();
        [owner, courtOfficial, client1, client2] = await ethers.getSigners();
    });

    it("Should set the owner correctly", async function () {
        expect(await navinEvault.owner()).to.equal(owner.address);
    });

    it("Should add and remove court officials", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);
        expect(await navinEvault.isCourtOfficial(courtOfficial.address)).to.be.true;

        await navinEvault.removeCourtOfficial(courtOfficial.address);
        expect(await navinEvault.isCourtOfficial(courtOfficial.address)).to.be.false;
    });

    it("Should allow court officials to upload a file", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);

        const ipfsHash = "QmHash";
        const title = "Case Title";
        const dateOfJudgment = "2024-01-01";
        const caseNumber = "123/2024";
        const category = "Civil";
        const judgeName = "Judge John Doe";
        const linkedClients = [client1.address];

        await navinEvault.connect(courtOfficial).uploadFile(
            ipfsHash,
            title,
            dateOfJudgment,
            caseNumber,
            category,
            judgeName,
            linkedClients
        );

        const caseFile = await navinEvault.getFile(1);

        expect(caseFile.uploader).to.equal(courtOfficial.address);
        expect(caseFile.ipfsHash).to.equal(ipfsHash);
        expect(caseFile.title).to.equal(title);
        expect(caseFile.linkedClients.length).to.equal(1);
        expect(caseFile.linkedClients[0]).to.equal(client1.address);
    });

    it("Should link clients to a case file", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);
        const linkedClients = [client1.address];

        await navinEvault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            linkedClients
        );

        await navinEvault.connect(courtOfficial).linkClients(1, [client2.address]);

        const caseFile = await navinEvault.getFile(1);
        expect(caseFile.linkedClients.length).to.equal(2);
        expect(caseFile.linkedClients[1]).to.equal(client2.address);
    });

    it("Should retrieve case file by ID", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);
        const linkedClients = [client1.address];

        await navinEvault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            linkedClients
        );

        const caseFile = await navinEvault.getFile(1);

        expect(caseFile.uploader).to.equal(courtOfficial.address);
        expect(caseFile.title).to.equal("Case Title");
    });

    it("Should search case files by title", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);
        const linkedClients = [client1.address];

        await navinEvault.connect(courtOfficial).uploadFile(
            "QmHash1",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            linkedClients
        );

        await navinEvault.connect(courtOfficial).uploadFile(
            "QmHash2",
            "Another Case Title",
            "2024-02-01",
            "456/2024",
            "Criminal",
            "Judge Jane Doe",
            linkedClients
        );

        const matchingFiles = await navinEvault.searchByTitle("Case Title");

        expect(matchingFiles.length).to.equal(1);
        expect(matchingFiles[0].ipfsHash).to.equal("QmHash1");
    });

    it("Should revert if non-court official tries to upload a file", async function () {
        await expect(
            navinEvault.connect(client1).uploadFile(
                "QmHash",
                "Case Title",
                "2024-01-01",
                "123/2024",
                "Civil",
                "Judge John Doe",
                [client1.address]
            )
        ).to.be.revertedWith("Only court officials can upload files");
    });

    it("Should revert if a client already linked", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);
        await navinEvault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            [client1.address]
        );

        await expect(
            navinEvault.connect(courtOfficial).linkClients(1, [client1.address])
        ).to.be.revertedWith("Client already linked");
    });

    it("Should revert if invalid file ID is provided", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);
        await navinEvault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            [client1.address]
        );

        await expect(
            navinEvault.connect(courtOfficial).linkClients(2, [client1.address])
        ).to.be.revertedWith("Invalid file ID");
    });

    it("Should revert if no clients linked during upload", async function () {
        await navinEvault.addCourtOfficial(courtOfficial.address);

        await expect(
            navinEvault.connect(courtOfficial).uploadFile(
                "QmHash",
                "Case Title",
                "2024-01-01",
                "123/2024",
                "Civil",
                "Judge John Doe",
                []
            )
        ).to.be.revertedWith("At least one client must be linked");
    });
});
