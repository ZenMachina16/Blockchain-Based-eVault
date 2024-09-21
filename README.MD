
To check pinata
curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" -H "pinata_api_key: YOUR_PINATA_API_KEY" -H "pinata_secret_api_key: YOUR_PINATA_SECRET_API_KEY" -F "file=@C:\Kapil\opamp.pdf"


Compile Hardhat Contracts :  npx hardhat node

Test the contracts : npx hardhat test

Contract Local Deployment : npx hardhat node

Contract Deployment on Sepolia : npx hardhat ignition deploy ignition/modules/EVaultModule.js --network sepolia



NewEvault Contract Address on Sepolia Test network : 0xe530d0463bC6eF7E0465013f25EdAFA61926B6D4

NewEvault Contract is the Contract to be used , deployed on sepolia