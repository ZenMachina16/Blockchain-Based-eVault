
To check pinata
curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" -H "pinata_api_key: YOUR_PINATA_API_KEY" -H "pinata_secret_api_key: YOUR_PINATA_SECRET_API_KEY" -F "file=@C:\Kapil\opamp.pdf"


Compile Hardhat Contracts :  npx hardhat node

Test the contracts : npx hardhat test

Contract Local Deployment : npx hardhat node

Contract Deployment on Sepolia : npx hardhat ignition deploy ignition/modules/EVaultModule.js --network sepolia



NewEvault Contract Address on Sepolia Test network : 0xe530d0463bC6eF7E0465013f25EdAFA61926B6D4

NewEvault Contract is the Contract to be used , deployed on sepolia



npx hardhat run scripts/addCourtOfficial.js --network localhost

npx hardhat run scripts/storeHashInContract.js --network localhost

npx hardhat run scripts/getHashFromContract.js --network localhost

npx hardhat run scripts/linkClients.js --network localhost




Contract Owner

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a   