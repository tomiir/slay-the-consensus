const { ethers } = require("ethers");
const FusionCardNFT = require("../src/contracts/artifacts/src/contracts/FusionCardNFT.sol/FusionCardNFT.json");

async function main() {
  // Replace with the address of the deployed FusionCardNFT contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Account to wipe NFTs from
  const accountToWipe = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  // Dead address to send NFTs to (effectively burning them)
  const burnAddress = "0x000000000000000000000000000000000000dEaD";

  // Connect to localhost provider
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  
  // Use the first account as signer (which should be the owner)
  const signers = await provider.listAccounts();
  const wallet = await provider.getSigner(signers[0]);
  
  console.log(`Connected with account: ${await wallet.getAddress()}`);

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, FusionCardNFT.abi, wallet);
  
  try {
    // Check if we are the owner or game server
    const gameServerAddress = await contract.gameServerAddress();
    const owner = await contract.owner();
    const signerAddress = await wallet.getAddress();
    
    console.log(`Contract owner: ${owner}`);
    console.log(`Game server: ${gameServerAddress}`);
    
    if (signerAddress.toLowerCase() !== owner.toLowerCase() && 
        signerAddress.toLowerCase() !== gameServerAddress.toLowerCase()) {
      console.error("You need to be the owner or game server to perform this operation");
      return;
    }
    
    // Get all cards owned by the account
    const cards = await contract.getCardsOwnedBy(accountToWipe);
    console.log(`Found ${cards.length} NFTs owned by ${accountToWipe}`);
    
    if (cards.length === 0) {
      console.log("No NFTs to wipe");
      return;
    }
    
    // Create a new script that will set the cardsOwnedBy mapping directly
    console.log("Creating reset script...");
    
    // Method 1: Try to use transferFrom to move all NFTs to the burn address
    console.log("Attempting to transfer all NFTs to burn address...");
    
    for (let i = 0; i < cards.length; i++) {
      const tokenId = cards[i];
      console.log(`Transferring token ID ${tokenId} to burn address...`);
      
      try {
        // Check if we're approved or owner
        const currentOwner = await contract.ownerOf(tokenId);
        console.log(`Current owner of token ${tokenId}: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
          // We need to be approved
          console.log(`Approving transfer of token ${tokenId}...`);
          const approveTx = await contract.approve(signerAddress, tokenId);
          await approveTx.wait();
        }
        
        // Transfer the token
        const tx = await contract.transferFrom(currentOwner, burnAddress, tokenId);
        await tx.wait();
        console.log(`Successfully transferred token ${tokenId} to burn address`);
      } catch (error) {
        console.error(`Error transferring token ${tokenId}:`, error.message);
      }
    }
    
    // Verify the wipe was successful
    const remainingCards = await contract.getCardsOwnedBy(accountToWipe);
    console.log(`After wipe: ${remainingCards.length} NFTs remaining for ${accountToWipe}`);
    
  } catch (error) {
    console.error("Error wiping NFTs:", error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
