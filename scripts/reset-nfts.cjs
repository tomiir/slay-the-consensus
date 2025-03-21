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
    
    // Contract address from logs
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    // The contract instance
    const nftContract = new ethers.Contract(
      contractAddress,
      [
        // Add a custom function to reset NFTs for testing
        "function resetNFTsForAddress(address _address) external",
        "function getCardsOwnedBy(address _owner) external view returns (uint256[])",
        // Function to show all NFT data
        "function getCardMetadata(uint256 _tokenId) external view returns (tuple(string name, string networkOrigin, string[] parentCards, uint256 mintedAt, string cardType, string rarity, uint256 energy))"
      ],
      signer
    );
    
    // Check NFTs before reset
    const targetAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const beforeTokens = await nftContract.getCardsOwnedBy(targetAddress);
    console.log(`Before reset: Address ${targetAddress} has ${beforeTokens.length} NFTs`);
    
    // Try to display metadata for each token
    if (beforeTokens.length > 0) {
      console.log("Metadata for existing tokens:");
      for (let i = 0; i < beforeTokens.length; i++) {
        try {
          const tokenId = beforeTokens[i];
          const metadata = await nftContract.getCardMetadata(tokenId);
          console.log(`Token ID ${tokenId}:`, {
            name: metadata.name,
            networkOrigin: metadata.networkOrigin,
            cardType: metadata.cardType,
            rarity: metadata.rarity,
            energy: metadata.energy.toString()
          });
        } catch (error) {
          console.log(`Failed to get metadata for token ${beforeTokens[i]}:`, error.message);
        }
      }
    }
    
    console.log("\nTo reset your NFTs in the game, copy and paste this code into your browser's console in the game:");
    console.log("--------------------------------------------------");
    console.log(`localStorage.removeItem('nft-cache-${targetAddress.toLowerCase()}')`);
    console.log("--------------------------------------------------");
    console.log("\nThen refresh the page to clear the NFT cache.\n");
    
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