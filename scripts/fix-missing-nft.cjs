const { ethers } = require("ethers");
const FusionCardNFT = require("../src/contracts/artifacts/src/contracts/FusionCardNFT.sol/FusionCardNFT.json");

// Create your missing card with the correct attributes
async function main() {
  try {
    // Connect to localhost hardhat node
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    // Get the default signer (account #0 in hardhat)
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log("Using signer address:", address);
    
    // Contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    // Contract instance
    const nftContract = new ethers.Contract(contractAddress, FusionCardNFT.abi, signer);
    
    // Target address to check
    const targetAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    
    // Check current NFTs
    const ownedCards = await nftContract.getCardsOwnedBy(targetAddress);
    console.log(`Before: ${targetAddress} owns ${ownedCards.length} NFTs`);
    console.log("Current Token IDs:", ownedCards.map(id => id.toString()).join(', '));
    
    // Add the missing NFT directly to the blockchain
    console.log("\nMinting missing fusion card...");
    
    const missingCardName = "Attack + Attack";
    const missingCardDescription = "Fusion of Attack and Attack";
    const missingCardNetworkOrigin = "fusion"; 
    const missingCardType = "attack";
    const missingCardRarity = "common";
    const missingCardEnergy = 1;
    
    // First, check the contract function signature
    const mintCardFunc = nftContract.interface.getFunction("mintCard");
    console.log("mintCard function signature:", mintCardFunc.format());
    
    try {
      // Try with the function signature from the contract file
      const tx = await nftContract.mintCard(
        targetAddress,
        missingCardName,
        missingCardDescription,
        missingCardNetworkOrigin,
        missingCardType,
        missingCardRarity,
        missingCardEnergy,
        `ipfs://missing-card-${Date.now()}`
      );
      
      console.log("Transaction submitted:", tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      console.log("Transaction mined!");
    } catch (error) {
      console.error("Error with first mintCard approach:", error.message);
      
      console.log("\nTrying alternative approach...");
      try {
        // Try with an alternative function signature
        const tx = await nftContract.mintCard(
          targetAddress,
          missingCardName,
          missingCardNetworkOrigin,
          missingCardType,
          missingCardRarity,
          missingCardEnergy,
          `ipfs://missing-card-${Date.now()}`
        );
        
        console.log("Transaction submitted:", tx.hash);
        
        // Wait for transaction to be mined
        await tx.wait();
        console.log("Transaction mined!");
      } catch (error) {
        console.error("Error with second mintCard approach:", error.message);
        console.log("\nPlease check the contract's mintCard function and update this script accordingly.");
      }
    }
    
    // Check NFTs after adding
    const newOwnedCards = await nftContract.getCardsOwnedBy(targetAddress);
    console.log(`\nAfter: ${targetAddress} now owns ${newOwnedCards.length} NFTs`);
    console.log("New Token IDs:", newOwnedCards.map(id => id.toString()).join(', '));
    
    console.log("\nDon't forget to clear your localStorage cache in the browser:");
    console.log(`localStorage.removeItem('nft-cache-${targetAddress.toLowerCase()}')`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 