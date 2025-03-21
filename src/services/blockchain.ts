import { Card } from '../game/core/types';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { ethers } from 'ethers';
import FusionCardNFT from '../contracts/artifacts/src/contracts/FusionCardNFT.sol/FusionCardNFT.json';
import { Provider } from '@reown/appkit-adapter-ethers';

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (args: any) => void) => void;
  removeListener: (eventName: string, handler: (args: any) => void) => void;
  isMetaMask?: boolean;
};

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

// Mock data for testing - replace with actual blockchain calls
const mockNFTCards: Card[] = [
  {
    id: 'nft-1',
    name: 'Fusion Strike',
    description: 'A powerful fusion card combining attack and defense.',
    networkOrigin: 'fusion',
    cardType: 'attack',
    rarity: 'rare',
    energy: 2,
    effects: [
      { type: 'damage', value: 12, target: 'enemy' },
      { type: 'block', value: 6, target: 'self' }
    ],
    isFusion: true,
    parentCards: ['card-1', 'card-2'],
    tokenId: '1'
  },
  {
    id: 'nft-2',
    name: 'Chain Link',
    description: 'A fusion card that draws cards and gains energy.',
    networkOrigin: 'fusion',
    cardType: 'skill',
    rarity: 'uncommon',
    energy: 1,
    effects: [
      { type: 'draw', value: 2, target: 'self' },
      { type: 'energy', value: 2, target: 'self' }
    ],
    isFusion: true,
    parentCards: ['card-3', 'card-4'],
    tokenId: '2'
  }
];

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
          
          cards.push({
            id: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            networkOrigin: metadata.networkOrigin,
            cardType: metadata.cardType,
            rarity: metadata.rarity,
            energy: metadata.energy,
            effects: [], // TODO: Add effects based on card type
            isFusion: metadata.networkOrigin === 'fusion',
            parentCards: metadata.parentCards,
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
      
      // For direct fusion of cards (can be NFTs or regular cards)
      try {
        // Step 1: If cards don't have tokenId, first mint them individually
        let tokenId1 = card1.tokenId ? BigInt(card1.tokenId) : undefined;
        let tokenId2 = card2.tokenId ? BigInt(card2.tokenId) : undefined;
        
        if (!tokenId1) {
          console.log('Minting first card:', card1.name);
          const tx1 = await contract.mintCard(
            address, // player
            card1.name,
            card1.description || '',
            card1.networkOrigin,
            card1.cardType,
            card1.rarity,
            BigInt(card1.energy),
            `ipfs://${card1.id}` // tokenURI
          );
          
          console.log('First card minting transaction submitted');
          const receipt1 = await tx1.wait();
          console.log('First card minting transaction mined');
          
          if (receipt1.logs && receipt1.logs.length > 0) {
            for (const log of receipt1.logs) {
              try {
                if (log.topics[0] === ethers.id("CardMinted(uint256,address,string)")) {
                  const firstTopic = ethers.decodeBytes32String(log.topics[1]);
                  tokenId1 = BigInt(firstTopic);
                  console.log('First card minted with ID:', tokenId1);
                  break;
                }
              } catch (e) {
                console.log('Could not decode log topic:', e);
              }
            }
          }
          
          if (!tokenId1) {
            // If we couldn't get the token ID from events, guess based on nextTokenId - 1
            tokenId1 = BigInt(0);
            console.log('Using default token ID for first card:', tokenId1);
          }
        }
        
        if (!tokenId2) {
          console.log('Minting second card:', card2.name);
          const tx2 = await contract.mintCard(
            address, // player
            card2.name,
            card2.description || '',
            card2.networkOrigin,
            card2.cardType,
            card2.rarity,
            BigInt(card2.energy),
            `ipfs://${card2.id}` // tokenURI
          );
          
          console.log('Second card minting transaction submitted');
          const receipt2 = await tx2.wait();
          console.log('Second card minting transaction mined');
          
          if (receipt2.logs && receipt2.logs.length > 0) {
            for (const log of receipt2.logs) {
              try {
                if (log.topics[0] === ethers.id("CardMinted(uint256,address,string)")) {
                  const firstTopic = ethers.decodeBytes32String(log.topics[1]);
                  tokenId2 = BigInt(firstTopic);
                  console.log('Second card minted with ID:', tokenId2);
                  break;
                }
              } catch (e) {
                console.log('Could not decode log topic:', e);
              }
            }
          }
          
          if (!tokenId2) {
            // If we couldn't get the token ID from events, guess based on nextTokenId - 1
            tokenId2 = tokenId1 ? tokenId1 + BigInt(1) : BigInt(1);
            console.log('Using default token ID for second card:', tokenId2);
          }
        }
        
        // Now we have both tokenIds (either original or newly minted)
        console.log('Fusing cards with token IDs:', tokenId1, tokenId2);
        
        // Step 2: Now fuse the two cards
        const tx = await contract.fuseCards(
          [tokenId1, tokenId2],
          `${card1.name} + ${card2.name}`,
          `ipfs://${card1.id}-${card2.id}` // tokenURI
        );
        
        console.log('Fusion transaction submitted:', tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Fusion transaction mined');
        
        // Try to get the token ID from the event
        let newTokenId: bigint | undefined;
        
        if (receipt.logs && receipt.logs.length > 0) {
          for (const log of receipt.logs) {
            try {
              if (log.topics[0] === ethers.id("CardFused(uint256,uint256[])")) {
                const firstTopic = ethers.decodeBytes32String(log.topics[1]);
                newTokenId = BigInt(firstTopic);
                console.log('Fusion card minted with ID:', newTokenId);
                break;
              }
            } catch (e) {
              console.log('Could not decode log topic:', e);
            }
          }
        }
        
        if (!newTokenId) {
          // If we couldn't get the token ID from events, guess based on nextTokenId - 1
          newTokenId = tokenId2 ? tokenId2 + BigInt(1) : BigInt(2);
          console.log('Using default token ID for fusion card:', newTokenId);
        }
        
        // Try to get metadata for the new card
        try {
          const metadata = await contract.getCardMetadata(newTokenId);
          console.log('Retrieved metadata for fusion card:', metadata);
          
          return {
            id: newTokenId.toString(),
            name: metadata.name,
            description: `A fusion of ${card1.name} and ${card2.name}`,
            networkOrigin: metadata.networkOrigin || 'fusion',
            cardType: metadata.cardType || card1.cardType,
            rarity: metadata.rarity || card1.rarity,
            energy: Number(metadata.energy || Math.floor((card1.energy + card2.energy) / 2)),
            effects: [],
            isFusion: true,
            parentCards: [card1.id, card2.id],
            tokenId: newTokenId.toString()
          };
        } catch (metadataError) {
          console.log('Error getting metadata, returning simulated card:', metadataError);
        }
      } catch (contractError) {
        console.error('Error in contract interactions:', contractError);
      }
      
      // Fallback to simulated card if anything goes wrong
      // Use timestamp as a unique ID to ensure different IDs for each fusion
      const timestamp = Date.now().toString();
      const simulatedCard: Card = {
        id: `fusion-${timestamp}`,
        name: `${card1.name} + ${card2.name}`,
        description: `A fusion of ${card1.name} and ${card2.name}`,
        networkOrigin: 'fusion',
        cardType: card1.cardType,
        rarity: card1.rarity === 'rare' || card2.rarity === 'rare' ? 'rare' : 
                card1.rarity === 'uncommon' || card2.rarity === 'uncommon' ? 'uncommon' : 'common',
        energy: Math.max(1, Math.floor((card1.energy + card2.energy) / 2)),
        effects: [],
        isFusion: true,
        parentCards: [card1.id, card2.id],
        tokenId: timestamp
      };
      
      console.log('Created simulated fusion card:', simulatedCard);
      return simulatedCard;
    } catch (error) {
      console.error('Error minting fusion card:', error);
      
      // Return a simulated card even if everything fails
      const timestamp = Date.now().toString();
      return {
        id: `fusion-${timestamp}`,
        name: `${card1.name} + ${card2.name}`,
        description: `A fusion of ${card1.name} and ${card2.name}`,
        networkOrigin: 'fusion',
        cardType: card1.cardType,
        rarity: card1.rarity === 'rare' || card2.rarity === 'rare' ? 'rare' : 
                card1.rarity === 'uncommon' || card2.rarity === 'uncommon' ? 'uncommon' : 'common',
        energy: Math.max(1, Math.floor((card1.energy + card2.energy) / 2)),
        effects: [],
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
          `ipfs://${card.id}` // TODO: Upload actual metadata to IPFS
        );
        
        console.log('Transaction submitted:', tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction mined successfully:', receipt);
        
        // Try to get the token ID from the event
        const event = receipt.logs?.find((log: any) => 
          log.topics && log.topics[0] === ethers.id("CardMinted(uint256,address,string)")
        );
        
        if (event && event.args) {
          const newTokenId = event.args[0];
          console.log('New card minted with token ID:', newTokenId);
          
          return {
            ...card,
            id: newTokenId.toString(),
            tokenId: newTokenId.toString()
          };
        }
        
        // If we couldn't get the token ID from the event, return the original card
        return card;
      } catch (error) {
        console.error('Error in contract call:', error);
        // Return simulated card
        const timestamp = Date.now().toString();
        return {
          ...card,
          id: `simulated-${timestamp}`,
          tokenId: timestamp
        };
      }
    } catch (error) {
      console.error('Error minting single card:', error);
      return null;
    }
  };

  return {
    fetchNFTCards,
    mintFusionCard,
    checkGameServerAuthorization,
    mintSingleCard
  };
}; 