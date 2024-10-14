const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("NewEVault", function () {
    async function deployNewEVaultFixture() {
        const [owner, lawyer, client1, client2, otherAccount] = await ethers.getSigners();

        const NewEVault = await ethers.getContractFactory("NewEVault");
        const newEvault = await NewEVault.deploy();

        await newEvault.addCourtOfficial(lawyer.address);

        return { newEvault, owner, lawyer, client1, client2, otherAccount };
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
        // Helper function to compare two address arrays
        function arraysEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) return false;
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) return false;
            }
            return true;
        }

        it("Should upload a file successfully by a court official", async function () {
            const { newEvault, lawyer, client1, client2 } = await loadFixture(deployNewEVaultFixture);
            const clients = [client1.address, client2.address];

            await newEvault.connect(lawyer).uploadFile(
                "QmSomeIpfsHash",
                "Case Title",
                "2024-09-17",
                "Case123",
                "Criminal",
                "Judge Doe",
                clients // Ensure this matches the function signature
            );

            expect(await newEvault.totalCaseFiles()).to.equal(1);
            const file = await newEvault.caseFiles(1);
            expect(file.uploader).to.equal(lawyer.address);

            // Debugging output
            console.log("Uploaded file clients: ", file.clients);
            console.log("Expected clients: ", clients);

            // Check if file.clients is defined before calling arraysEqual
            expect(file.clients).to.not.be.undefined;
            expect(arraysEqual(file.clients, clients)).to.equal(true); // Use the helper function here
        });

        it("Should fail if a non-court official tries to upload a file", async function () {
            const { newEvault, otherAccount } = await loadFixture(deployNewEVaultFixture);
            const clients = [otherAccount.address];

            await expect(
                newEvault.connect(otherAccount).uploadFile(
                    "QmSomeIpfsHash",
                    "Case Title",
                    "2024-09-17",
                    "Case123",
                    "Criminal",
                    "Judge Doe",
                    clients // Passing clients
                )
            ).to.be.revertedWith("Only court officials can upload files");
        });

        it("Should fail if required file fields are missing", async function () {
            const { newEvault, lawyer, client1 } = await loadFixture(deployNewEVaultFixture);
            const clients = [client1.address];

            await expect(
                newEvault.connect(lawyer).uploadFile(
                    "", // Missing IPFS hash
                    "Case Title",
                    "2024-09-17",
                    "Case123",
                    "Criminal",
                    "Judge Doe",
                    clients // Passing clients
                )
            ).to.be.revertedWith("IPFS hash is required");
        });

        it("Should fail if no clients are linked", async function () {
            const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
            const clients = []; // No clients

            await expect(
                newEvault.connect(lawyer).uploadFile(
                    "QmSomeIpfsHash",
                    "Case Title",
                    "2024-09-17",
                    "Case123",
                    "Criminal",
                    "Judge Doe",
                    clients // Passing no clients
                )
            ).to.be.revertedWith("At least one client must be linked");
        });

        it("Should fail if client addresses are not unique", async function () {
            const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
            const clients = [lawyer.address, lawyer.address]; // Duplicate client address

            await expect(
                newEvault.connect(lawyer).uploadFile(
                    "QmSomeIpfsHash",
                    "Case Title",
                    "2024-09-17",
                    "Case123",
                    "Criminal",
                    "Judge Doe",
                    clients // Passing duplicate clients
                )
            ).to.be.revertedWith("Client addresses must be unique");
        });
    });

    describe("Search Functions", function () {
        it("Should return the correct case file when searching by title", async function () {
            const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
            const clients = [lawyer.address];

            await newEvault.connect(lawyer).uploadFile(
                "QmSomeIpfsHash",
                "Case Title",
                "2024-09-17",
                "Case123",
                "Criminal",
                "Judge Doe",
                clients // Passing clients
            );

            const result = await newEvault.searchByTitle("Case Title");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(1); // Ensure the returned ID is correct
        });

        it("Should return multiple files if more than one match the search criteria", async function () {
            const { newEvault, lawyer } = await loadFixture(deployNewEVaultFixture);
            const clientsA = [lawyer.address];
            const clientsB = [lawyer.address];

            await newEvault.connect(lawyer).uploadFile(
                "QmSomeIpfsHash1",
                "Case Title A",
                "2024-09-17",
                "Case123",
                "Criminal",
                "Judge Doe",
                clientsA // Passing clients for A
            );

            await newEvault.connect(lawyer).uploadFile(
                "QmSomeIpfsHash2",
                "Case Title A",
                "2024-09-18",
                "Case124",
                "Civil",
                "Judge Doe",
                clientsB // Passing clients for B
            );

            const result = await newEvault.searchByTitle("Case Title A");
            expect(result.length).to.equal(2);
            expect(result[0]).to.equal(1); // ID of the first uploaded file
            expect(result[1]).to.equal(2); // ID of the second uploaded file
        });
    });

    describe("Client Access", function () {
        it("Should allow a client to access the uploaded file if they are linked", async function () {
            const { newEvault, lawyer, client1 } = await loadFixture(deployNewEVaultFixture);
            const clients = [client1.address];

            await newEvault.connect(lawyer).uploadFile(
                "QmSomeIpfsHash",
                "Case Title",
                "2024-09-17",
                "Case123",
                "Criminal",
                "Judge Doe",
                clients // Passing clients
            );

            expect(await newEvault.canClientAccess(1, client1.address)).to.equal(true);
        });

        it("Should not allow a client to access the uploaded file if they are not linked", async function () {
            const { newEvault, lawyer, client1, client2 } = await loadFixture(deployNewEVaultFixture);
            const clients = [client1.address];

            await newEvault.connect(lawyer).uploadFile(
                "QmSomeIpfsHash",
                "Case Title",
                "2024-09-17",
                "Case123",
                "Criminal",
                "Judge Doe",
                clients // Passing clients
            );

            expect(await newEvault.canClientAccess(1, client2.address)).to.equal(false);
        });
    });
});
