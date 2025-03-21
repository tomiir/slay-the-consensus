const { ethers } = require("ethers");
const FusionCardNFT = require("../src/contracts/artifacts/src/contracts/FusionCardNFT.sol/FusionCardNFT.json");

// Create a direct reset function for testing purposes
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
    
    // Get total token count from nextTokenId
    try {
      const nextTokenId = await nftContract._nextTokenId();
      console.log(`Contract's next token ID: ${nextTokenId} (meaning ${nextTokenId} tokens have been minted)`);
    } catch (error) {
      console.log("Could not get _nextTokenId:", error.message);
      console.log("Continuing with manual token checking...");
    }
    
    // Get the cardsOwnedBy mapping for the target address
    const ownedCards = await nftContract.getCardsOwnedBy(targetAddress);
    console.log(`Cards owned by ${targetAddress} according to contract: ${ownedCards.length}`);
    console.log("Token IDs:", ownedCards.map(id => id.toString()).join(', '));
    
    // Let's check tokens from 0 to 20 to be safe
    const maxTokenId = 20;
    
    // Check each token from 0 to maxTokenId
    console.log("\nChecking ownership of tokens 0 to", maxTokenId);
    for (let i = 0; i < maxTokenId; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        const metadata = await nftContract.getCardMetadata(i);
        console.log(`Token ${i}: owned by ${owner} (${owner.toLowerCase() === targetAddress.toLowerCase() ? 'YOUR TOKEN' : 'not yours'})`);
        console.log(`  Name: ${metadata.name}, Type: ${metadata.cardType}, Network: ${metadata.networkOrigin}`);
      } catch (error) {
        console.log(`Token ${i}: ${error.message}`);
      }
    }
    
    console.log("\nChecking if the cardsOwnedBy mapping is accurate:");
    let missingTokens = [];
    let extraTokens = [];
    
    // Find tokens that you own but are not in cardsOwnedBy
    for (let i = 0; i < maxTokenId; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        if (owner.toLowerCase() === targetAddress.toLowerCase()) {
          if (!ownedCards.some(id => id.toString() === i.toString())) {
            missingTokens.push(i);
          }
        }
      } catch (error) {
        // Token doesn't exist or was burned
      }
    }
    
    // Find tokens in cardsOwnedBy that you no longer own
    for (const id of ownedCards) {
      try {
        const owner = await nftContract.ownerOf(id);
        if (owner.toLowerCase() !== targetAddress.toLowerCase()) {
          extraTokens.push(id.toString());
        }
      } catch (error) {
        // Token doesn't exist or was burned
        extraTokens.push(id.toString());
      }
    }
    
    if (missingTokens.length > 0) {
      console.log("Tokens you own but are missing from cardsOwnedBy:", missingTokens.join(', '));
      console.log("These tokens are not visible in the UI because they're not in the mapping!");
    } else {
      console.log("No missing tokens found.");
    }
    
    if (extraTokens.length > 0) {
      console.log("Tokens in cardsOwnedBy that you don't actually own:", extraTokens.join(', '));
      console.log("These tokens may show up in the UI but don't exist or belong to someone else!");
    } else {
      console.log("No extra tokens found.");
    }
    
    console.log("\nFixes:");
    console.log("1. Clear local storage cache in browser:");
    console.log(`   localStorage.removeItem('nft-cache-${targetAddress.toLowerCase()}')`);
    console.log("2. If missing tokens are found, they need to be added to the mapping (requires contract modification)");
    
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