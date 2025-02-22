To check pinata
curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" -H "pinata_api_key: YOUR_PINATA_API_KEY" -H "pinata_secret_api_key: YOUR_PINATA_SECRET_API_KEY" -F "file=@C:\Kapil\opamp.pdf"

Compile Hardhat Contracts : npx hardhat node

Test the contracts : npx hardhat test

Contract Local Deployment : npx hardhat node

Contract Deployment on Sepolia : npx hardhat ignition deploy ignition/modules/NavinEVaultModule.js --network sepolia

Contract Deployment on localhost : npx hardhat ignition deploy ignition/modules/NavinEVaultModule.js --network localhost

NewEvault Contract Address on Sepolia Test network : 0xe530d0463bC6eF7E0465013f25EdAFA61926B6D4

NewEvault Contract is the Contract to be used , deployed on sepolia

npx hardhat run scripts/addCourtOfficial.js --network localhost

npx hardhat run scripts/storeHashInContract.js --network localhost

npx hardhat run scripts/getHashFromContract.js --network localhost
npx hardhat run scripts/addClient.js --network localhost
npx hardhat run scripts/linkClients.js --network localhost

Contract Owner

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)

latest contract updated navinEvault in new branch

Sepolia Deployed Latest Contract on 12 Oct Contract Address 0x7fE96194Da4Bfe9AB215a998ec0be4d8c44c948F

step 1
local host start - : npx hardhat node

step 2
run all the command in root
npx hardhat run scripts/addCourtOfficial.js --network localhost
(add addresses from local according)
npx hardhat run scripts/addClient.js --network localhost

step 3
