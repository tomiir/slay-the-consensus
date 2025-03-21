const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Get the contract factory
  const FusionCardNFT = await hre.ethers.getContractFactory("FusionCardNFT");
  
  // Get the deployed contract
  const contract = await FusionCardNFT.attach(process.env.VITE_CONTRACT_ADDRESS);
  
  // Get the signer (deployer)
  const [signer] = await hre.ethers.getSigners();
  
  // Card metadata
  const playerAddress = signer.address; // Use signer's address
  const name = "Test Card";
  const networkOrigin = "ethereum";
  const parentCards = []; // empty array for new cards
  const cardType = "attack";
  const rarity = "common";
  const energy = 3;
  const tokenURI = "ipfs://QmTest"; // placeholder URI

  // Mint the card
  console.log("Minting card...");
  const tx = await contract.mintCard(
    playerAddress,
    name,
    networkOrigin,
    parentCards,
    cardType,
    rarity,
    energy,
    tokenURI
  );
  
  console.log("Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Card minted successfully!");
  
  // Get the card metadata to verify
  // The tokenId will be the event data from CardMinted event
  const cardMintedEvent = receipt.logs.find(log => log.eventName === 'CardMinted');
  const tokenId = cardMintedEvent.args[0];
  const card = await contract.getCardMetadata(tokenId);
  console.log("Minted card metadata:", card);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 