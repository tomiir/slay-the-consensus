import { Card, CardEffect, EffectType, EffectTarget } from '../game/core/types';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { ethers } from 'ethers';
import FusionCardNFT from '../contracts/artifacts/src/contracts/FusionCardNFT.sol/FusionCardNFT.json';
import { Provider } from '@reown/appkit-adapter-ethers';


declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
  interface ImportMeta {
    env: {
      VITE_CONTRACT_ADDRESS: string;
    };
  }
}

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error('Contract address not found in environment variables');
}

export const useBlockchainService = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');

  const getContract = async (withSigner = false) => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) {
      throw new Error('Contract initialization failed: Missing required parameters');
    }

    try {
      if (!walletProvider) {
        throw new Error('Wallet provider not available');
      }

      // Create ethers provider from walletProvider
      const provider = new ethers.BrowserProvider(walletProvider);
      
      // Create contract interface
      const contractInterface = new ethers.Interface(FusionCardNFT.abi);
      
      // Create contract instance
      let contract;
      if (withSigner) {
        const signer = await provider.getSigner(address);
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractInterface, signer);
      } else {
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractInterface, provider);
      }
      
      return contract;
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  };

  const fetchNFTCards = async (): Promise<Card[]> => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return [];

    try {
      console.log('Fetching NFT cards for address:', address);
      const contract = await getContract(false);
      
      let tokenIds: bigint[] = [];
      try {
        tokenIds = await contract.getCardsOwnedBy(address);
        console.log('Retrieved token IDs:', tokenIds);
      } catch (error: any) {
        // If the error is due to empty data (0x), this is expected for new users
        if (error.code === 'BAD_DATA' && error.value === '0x') {
          console.log('No cards found for address (new user)');
          return [];
        }
        throw error; // Re-throw other errors
      }
      
      // If tokenIds is empty or undefined, return empty array
      if (!tokenIds || tokenIds.length === 0) {
        console.log('No cards found for address');
        return [];
      }

      const cards: Card[] = [];

      for (const tokenId of tokenIds) {
        try {
          const metadata = await contract.getCardMetadata(tokenId);
          console.log('Retrieved metadata for token:', tokenId, metadata);
          
          // Generate appropriate effects based on card type
          const effects: CardEffect[] = [];
          if (metadata.cardType === 'attack') {
            effects.push({
              type: 'damage' as EffectType,
              value: metadata.energy.toString() === '1' ? 6 : metadata.energy.toString() === '2' ? 9 : 12,
              target: 'enemy' as EffectTarget
            });
          } else if (metadata.cardType === 'skill') {
            effects.push({
              type: 'block' as EffectType,
              value: metadata.energy.toString() === '1' ? 5 : metadata.energy.toString() === '2' ? 8 : 12,
              target: 'self' as EffectTarget
            });
          } else if (metadata.cardType === 'power') {
            effects.push({
              type: 'draw' as EffectType,
              value: 1,
              target: 'self' as EffectTarget
            });
          }
          
          // Add the card with complete metadata
          cards.push({
            id: tokenId.toString(),
            name: metadata.name || '',
            description: `A ${metadata.cardType} card from ${metadata.networkOrigin}`,
            networkOrigin: metadata.networkOrigin || 'unknown',
            cardType: metadata.cardType || 'attack',
            rarity: metadata.rarity || 'common',
            energy: Number(metadata.energy) || 1,
            effects: effects,
            isFusion: metadata.networkOrigin === 'fusion',
            parentCards: metadata.parentCards || [],
            tokenId: tokenId.toString()
          });
        } catch (error) {
          console.error('Error fetching metadata for token:', tokenId, error);
        }
      }

      return cards;
    } catch (error) {
      console.error('Error in fetchNFTCards:', error);
      return [];
    }
  };

  const mintFusionCard = async (card1: Card, card2: Card): Promise<Card | null> => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return null;

    try {
      console.log('Card 1:', card1);
      console.log('Card 2:', card2);

      const contract = await getContract(true);
      
      console.log('Fusing cards:', card1.name, 'and', card2.name);
      
      // Combine effects from both cards, looking for interesting combinations
      const combinedEffects = [...card1.effects];
      card2.effects.forEach(effect2 => {
        // If there's a matching effect type, enhance it
        const matchingEffect = combinedEffects.find(e => e.type === effect2.type && e.target === effect2.target);
        if (matchingEffect) {
          // Increase the matching effect value, but apply a balance factor
          matchingEffect.value = Math.round((matchingEffect.value + effect2.value) * 0.75);
        } else {
          // Otherwise add the new effect
          combinedEffects.push({...effect2});
        }
      });
      
      // Create fusion metadata
      const cardName = `${card1.name} + ${card2.name}`;
      const cardDescription = `Fusion of ${card1.name} and ${card2.name}`;
      const cardEnergy = Math.max(1, Math.floor((card1.energy + card2.energy) * 0.8)); // Slight discount for fusion
      const cardRarity = card1.rarity === 'rare' || card2.rarity === 'rare' ? 'rare' : 
                        card1.rarity === 'uncommon' || card2.rarity === 'uncommon' ? 'uncommon' : 'common';
      
      // Try to mint a real NFT on the blockchain
      try {
        // Log attempt to mint a fusion card with the proper function signature
        console.log('Attempting to mint fusion card with contract call...');
        
        // Use the correct function signature from the contract
        const tx = await contract.mintCard(
          address, // player
          cardName,
          cardDescription,
          'fusion', // networkOrigin
          card1.cardType, // use the card type from the first card
          cardRarity,
          BigInt(cardEnergy),
          `ipfs://${Date.now()}` // tokenURI
        );
        
        console.log('Fusion minting transaction submitted:', tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Fusion minting transaction mined');
        
        // Try to get the token ID from the event
        let newTokenId: string = '';
        
        if (receipt.logs && receipt.logs.length > 0) {
          // Find CardMinted event to get token ID
          const event = receipt.logs.find((log: any) => 
            log.topics && log.topics[0] === ethers.id("CardMinted(uint256,address,string)")
          );
          
          if (event && event.args) {
            newTokenId = event.args[0].toString();
            console.log('Fusion card minted with ID:', newTokenId);
          }
        }
        
        if (!newTokenId) {
          // Fallback token ID
          newTokenId = Date.now().toString();
          console.log('Using fallback token ID for fusion card:', newTokenId);
        }
        
        // Return the new fusion card with combined attributes
        const newCard: Card = {
          id: `fusion-${newTokenId}`,
          name: cardName,
          description: cardDescription,
          networkOrigin: 'fusion',
          cardType: card1.cardType,
          rarity: cardRarity,
          energy: cardEnergy,
          effects: combinedEffects,
          isFusion: true,
          parentCards: [card1.id, card2.id],
          tokenId: newTokenId
        };
        
        // Clear any cached NFT data in localStorage
        try {
          if (address) {
            const cacheKey = `nft-cache-${address.toLowerCase()}`;
            localStorage.removeItem(cacheKey);
            console.log('Cleared NFT cache to ensure new cards appear');
          }
        } catch (e) {
          console.warn('Failed to clear NFT cache:', e);
        }
        
        return newCard;
        
      } catch (error) {
        console.error('Error minting fusion card:', error);
        // Fall back to simulated fusion if blockchain mint fails
      }
      
      // If the blockchain minting fails, create a simulated fusion card
      console.log('WARNING: Using simulated fusion card (not on blockchain)');
      const timestamp = Date.now().toString();
      const simulatedCard: Card = {
        id: `simulated-fusion-${timestamp}`,
        name: cardName,
        description: cardDescription,
        networkOrigin: 'fusion',
        cardType: card1.cardType,
        rarity: cardRarity,
        energy: cardEnergy,
        effects: [], // TODO: Add effects based on card type
        isFusion: true,
        parentCards: [card1.id, card2.id],
        tokenId: timestamp
      };
      
      console.log('Created simulated fusion card:', simulatedCard);
      
      // Clear any cached NFT data in localStorage
      try {
        if (address) {
          const cacheKey = `nft-cache-${address.toLowerCase()}`;
          localStorage.removeItem(cacheKey);
          console.log('Cleared NFT cache to ensure new cards appear');
        }
      } catch (e) {
        console.warn('Failed to clear NFT cache:', e);
      }
      
      return simulatedCard;
      
    } catch (error) {
      console.error('Error minting fusion card:', error);
      
      // Fallback to simulated fusion with attributes
      const timestamp = Date.now().toString();
      
      // Combine effects from both parent cards
      const combinedEffects = [...card1.effects];
      card2.effects.forEach(effect2 => {
        const matchingEffect = combinedEffects.find(e => e.type === effect2.type && e.target === effect2.target);
        if (matchingEffect) {
          matchingEffect.value = Math.round((matchingEffect.value + effect2.value) * 0.75);
        } else {
          combinedEffects.push({...effect2});
        }
      });
      
      return {
        id: `simulated-fusion-${timestamp}`,
        name: `${card1.name} + ${card2.name}`,
        description: `A fusion of ${card1.name} and ${card2.name}`,
        networkOrigin: 'fusion',
        cardType: card1.cardType,
        rarity: card1.rarity === 'rare' || card2.rarity === 'rare' ? 'rare' : 
                card1.rarity === 'uncommon' || card2.rarity === 'uncommon' ? 'uncommon' : 'common',
        energy: Math.max(1, Math.floor((card1.energy + card2.energy) * 0.8)),
        effects: combinedEffects,
        isFusion: true,
        parentCards: [card1.id, card2.id],
        tokenId: timestamp
      };
    }
  };

  const checkGameServerAuthorization = async (): Promise<boolean> => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return false;

    try {
      const contract = await getContract(false);
      const gameServerAddress = await contract.gameServerAddress();
      
      console.log('Game server address:', gameServerAddress);
      console.log('Current user address:', address);
      
      const isAuthorized = gameServerAddress.toLowerCase() === address.toLowerCase();
      console.log('Is user authorized as game server:', isAuthorized);
      
      return isAuthorized;
    } catch (error) {
      console.error('Error checking game server authorization:', error);
      return false;
    }
  };

  const mintSingleCard = async (card: Card): Promise<Card | null> => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return null;

    try {
      const contract = await getContract(true);
      
      console.log('Minting single card:', card.name);
      
      // Check if user is authorized
      const isAuthorized = await checkGameServerAuthorization();
      if (!isAuthorized) {
        console.warn('User is not authorized as game server, using simulation mode');
        // Return simulated card since we can't mint for real
        const timestamp = Date.now().toString();
        return {
          ...card,
          id: `simulated-${timestamp}`,
          tokenId: timestamp,
          isFusion: false
        };
      }
      
      // If authorized, actually mint the card
      try {
        const tx = await contract.mintCard(
          address,
          card.name,
          card.description || '',
          card.networkOrigin,
          card.cardType,
          card.rarity,
          card.energy.toString(),
          [], // parentCards
          `ipfs://${card.id}`
        );
        
        console.log('Minting transaction submitted:', tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Minting transaction mined');
        
        // Try to get the token ID from the event
        let newTokenId: string = '';
        
        if (receipt.logs && receipt.logs.length > 0) {
          // Find CardMinted event to get token ID
          const event = receipt.logs.find((log: any) => 
            log.topics && log.topics[0] === ethers.id("CardMinted(uint256,address,string)")
          );
          
          if (event && event.args) {
            newTokenId = event.args[0].toString();
            console.log('Card minted with ID:', newTokenId);
          }
        }
        
        if (!newTokenId) {
          // Fallback token ID
          newTokenId = Date.now().toString();
          console.log('Using fallback token ID for card:', newTokenId);
        }
        
        // Return the new card with minted attributes
        const newCard: Card = {
          id: newTokenId,
          name: card.name,
          description: card.description,
          networkOrigin: card.networkOrigin,
          cardType: card.cardType,
          rarity: card.rarity,
          energy: card.energy,
          effects: card.effects,
          isFusion: card.isFusion,
          parentCards: card.parentCards,
          tokenId: newTokenId
        };
        
        // Clear any cached NFT data in localStorage
        try {
          if (address) {
            const cacheKey = `nft-cache-${address.toLowerCase()}`;
            localStorage.removeItem(cacheKey);
            console.log('Cleared NFT cache to ensure new cards appear');
          }
        } catch (e) {
          console.warn('Failed to clear NFT cache:', e);
        }
        
        return newCard;
      } catch (error) {
        console.error('Error minting single card:', error);
        return null;
      }
    } catch (error) {
      console.error('Error minting single card:', error);
      return null;
    }
  };

  // Clear NFT cache to force a fresh load from the blockchain
  const clearNFTCache = () => {
    try {
      if (address) {
        const cacheKey = `nft-cache-${address.toLowerCase()}`;
        localStorage.removeItem(cacheKey);
        console.log('NFT cache cleared for address:', address);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing NFT cache:', error);
      return false;
    }
  };

  return {
    fetchNFTCards,
    mintFusionCard,
    checkGameServerAuthorization,
    mintSingleCard,
    clearNFTCache
  };
};