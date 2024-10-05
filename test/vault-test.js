const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault Contract", function () {
    let Vault, vault, owner, courtOfficial, client1, client2;

    beforeEach(async function () {
        // Deploy the contract before each test
        Vault = await ethers.getContractFactory("vault");
        vault = await Vault.deploy();
        [owner, courtOfficial, client1, client2] = await ethers.getSigners();
    });

    it("Should set the owner correctly", async function () {
        expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should add and remove court officials", async function () {
        await vault.addCourtOfficial(courtOfficial.address);
        expect(await vault.isCourtOfficial(courtOfficial.address)).to.be.true;

        await vault.removeCourtOfficial(courtOfficial.address);
        expect(await vault.isCourtOfficial(courtOfficial.address)).to.be.false;
    });

    it("Should allow court officials to upload a file", async function () {
        await vault.addCourtOfficial(courtOfficial.address);

        const ipfsHash = "QmHash";
        const title = "Case Title";
        const dateOfJudgment = "2024-01-01";
        const caseNumber = "123/2024";
        const category = "Civil";
        const judgeName = "Judge John Doe";
        const linkedClients = [client1.address];

        await vault.connect(courtOfficial).uploadFile(
            ipfsHash,
            title,
            dateOfJudgment,
            caseNumber,
            category,
            judgeName,
            linkedClients
        );

        const caseFile = await vault.getFile(1);

        expect(caseFile.uploader).to.equal(courtOfficial.address);
        expect(caseFile.ipfsHash).to.equal(ipfsHash);
        expect(caseFile.title).to.equal(title);
        expect(caseFile.linkedClients.length).to.equal(1);
        expect(caseFile.linkedClients[0]).to.equal(client1.address);
    });

    it("Should link clients to a case file", async function () {
        await vault.addCourtOfficial(courtOfficial.address);
        const linkedClients = [client1.address];

        await vault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            linkedClients
        );

        await vault.connect(courtOfficial).linkClient(1, client2.address);

        const caseFile = await vault.getFile(1);
        expect(caseFile.linkedClients.length).to.equal(2);
        expect(caseFile.linkedClients[1]).to.equal(client2.address);
    });

    it("Should retrieve case file by ID", async function () {
        await vault.addCourtOfficial(courtOfficial.address);
        const linkedClients = [client1.address];

        await vault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            linkedClients
        );

        const caseFile = await vault.getFile(1);

        expect(caseFile.uploader).to.equal(courtOfficial.address);
        expect(caseFile.title).to.equal("Case Title");
    });

    it("Should search case files by title", async function () {
        await vault.addCourtOfficial(courtOfficial.address);
        const linkedClients = [client1.address];

        await vault.connect(courtOfficial).uploadFile(
            "QmHash1",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            linkedClients
        );

        await vault.connect(courtOfficial).uploadFile(
            "QmHash2",
            "Another Case Title",
            "2024-02-01",
            "456/2024",
            "Criminal",
            "Judge Jane Doe",
            linkedClients
        );

        const matchingFiles = await vault.searchByTitle("Case Title");

        expect(matchingFiles.length).to.equal(1);
        expect(matchingFiles[0].ipfsHash).to.equal("QmHash1");
    });

    it("Should revert if non-court official tries to upload a file", async function () {
        await expect(
            vault.connect(client1).uploadFile(
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
        await vault.addCourtOfficial(courtOfficial.address);
        await vault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            [client1.address]
        );

        await expect(
            vault.connect(courtOfficial).linkClient(1, client1.address)
        ).to.be.revertedWith("Client already linked");
    });

    it("Should revert if invalid file ID is provided", async function () {
        await vault.addCourtOfficial(courtOfficial.address);
        await vault.connect(courtOfficial).uploadFile(
            "QmHash",
            "Case Title",
            "2024-01-01",
            "123/2024",
            "Civil",
            "Judge John Doe",
            [client1.address]
        );

        await expect(
            vault.connect(courtOfficial).linkClient(2, client1.address)
        ).to.be.revertedWith("Invalid file ID");
    });

    it("Should revert if no clients linked during upload", async function () {
        await vault.addCourtOfficial(courtOfficial.address);

        await expect(
            vault.connect(courtOfficial).uploadFile(
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
