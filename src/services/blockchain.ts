import { Card } from '../game/core/types';
import { useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import FusionCardNFT from '../contracts/artifacts/src/contracts/FusionCardNFT.sol/FusionCardNFT.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

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
  const { address, status, provider } = useAppKitAccount();

  const getContract = () => {
    if (!provider || !CONTRACT_ADDRESS) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      FusionCardNFT.abi,
      provider
    );
  };

  const fetchNFTCards = async (): Promise<Card[]> => {
    if (status !== 'connected' || !address) {
      return [];
    }

    try {
      const contract = getContract();
      if (!contract) return [];

      // Get all token IDs owned by the player
      const tokenIds = await contract.getCardsOwnedBy(address);
      
      // Fetch metadata for each token
      const cards: Card[] = await Promise.all(
        tokenIds.map(async (tokenId: number) => {
          const metadata = await contract.getCardMetadata(tokenId);
          return {
            id: `nft-${tokenId}`,
            name: metadata.name,
            description: `${metadata.name} - ${metadata.rarity} ${metadata.cardType}`,
            networkOrigin: metadata.networkOrigin,
            cardType: metadata.cardType as Card['cardType'],
            rarity: metadata.rarity as Card['rarity'],
            energy: Number(metadata.energy),
            effects: [], // TODO: Add effects based on card type
            isFusion: metadata.networkOrigin === 'fusion',
            parentCards: metadata.parentCards,
            tokenId: tokenId.toString()
          };
        })
      );

      return cards;
    } catch (error) {
      console.error('Failed to fetch NFT cards:', error);
      return [];
    }
  };

  const mintFusionCard = async (card1: Card, card2: Card): Promise<Card | null> => {
    if (status !== 'connected' || !address) {
      return null;
    }

    try {
      const contract = getContract();
      if (!contract) return null;

      // Create metadata for the new card
      const newName = `${card1.name} + ${card2.name}`;
      const tokenURI = `ipfs://${card1.tokenId}-${card2.tokenId}`; // TODO: Upload actual metadata to IPFS

      // Call the contract's fuseCards function
      const tx = await contract.fuseCards(
        [card1.tokenId, card2.tokenId],
        newName,
        tokenURI
      );

      // Wait for transaction confirmation
      await tx.wait();

      // Get the new token ID from the event
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: { event: string }) => e.event === 'CardFused');
      const newTokenId = event?.args?.newTokenId;

      if (!newTokenId) return null;

      // Fetch the new card's metadata
      const metadata = await contract.getCardMetadata(newTokenId);
      return {
        id: `nft-${newTokenId}`,
        name: metadata.name,
        description: `${metadata.name} - ${metadata.rarity} ${metadata.cardType}`,
        networkOrigin: metadata.networkOrigin,
        cardType: metadata.cardType as Card['cardType'],
        rarity: metadata.rarity as Card['rarity'],
        energy: Number(metadata.energy),
        effects: [], // TODO: Add effects based on card type
        isFusion: true,
        parentCards: metadata.parentCards,
        tokenId: newTokenId.toString()
      };
    } catch (error) {
      console.error('Failed to mint fusion card:', error);
      return null;
    }
  };

  return {
    fetchNFTCards,
    mintFusionCard
  };
}; 