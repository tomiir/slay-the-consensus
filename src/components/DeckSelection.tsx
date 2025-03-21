import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, NetworkType } from '../game/core/types';
import { starterDecks } from '../game/core/starterDecks';
import { useBlockchainService } from '../services/blockchain';

const DeckSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
`;

const Title = styled.h1`
  color: #ffd700;
  margin-bottom: 2rem;
  text-align: center;
`;

const DeckOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const DeckCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected ? '#3c3c3c' : '#2c2c2c'};
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: ${props => props.selected ? '2px solid #ffd700' : 'none'};

  &:hover {
    transform: translateY(-5px);
  }
`;

const NFTCollection = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 1200px;
`;

const NFTTitle = styled.h2`
  color: #ffd700;
  margin-bottom: 1rem;
`;

const NFTCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const NFTCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected ? '#3c3c3c' : '#2c2c2c'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: ${props => props.selected ? '2px solid #ffd700' : 'none'};

  &:hover {
    transform: translateY(-5px);
  }
`;

const SelectedDeck = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 1200px;
`;

const SelectedDeckTitle = styled.h2`
  color: #ffd700;
  margin-bottom: 1rem;
`;

const SelectedDeckCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const StartButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: #ffd700;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`;

interface DeckSelectionProps {
  onStartGame: (deck: Card[]) => void;
}

export const DeckSelection: React.FC<DeckSelectionProps> = ({ onStartGame }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);
  const [selectedNFTCards, setSelectedNFTCards] = useState<Card[]>([]);
  const [nftCards, setNFTCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchNFTCards } = useBlockchainService();

  useEffect(() => {
    const loadNFTCards = async () => {
      setIsLoading(true);
      try {
        const cards = await fetchNFTCards();
        setNFTCards(cards);
      } catch (error) {
        console.error('Failed to fetch NFT cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNFTCards();
  }, [fetchNFTCards]);

  const handleNetworkSelect = (network: NetworkType) => {
    setSelectedNetwork(network);
  };

  const handleNFTCardSelect = (card: Card) => {
    setSelectedNFTCards(prev => {
      if (prev.find(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      }
      if (prev.length < 3) { // Allow up to 3 NFT cards
        return [...prev, card];
      }
      return prev;
    });
  };

  const getFinalDeck = (): Card[] => {
    if (!selectedNetwork) return [];
    
    const starterDeck = [...starterDecks[selectedNetwork].cards];
    const nftCardIds = selectedNFTCards.map(card => card.id);
    
    // Replace up to 3 cards from the starter deck with NFT cards
    const finalDeck = starterDeck.filter(card => !nftCardIds.includes(card.id));
    return [...finalDeck, ...selectedNFTCards];
  };

  const handleStartGame = () => {
    const finalDeck = getFinalDeck();
    if (finalDeck.length > 0) {
      onStartGame(finalDeck);
    }
  };

  return (
    <DeckSelectionContainer>
      <Title>Choose Your Deck</Title>
      
      <DeckOptions>
        {Object.entries(starterDecks).map(([network, deck]) => (
          network !== 'fusion' && (
            <DeckCard
              key={network}
              onClick={() => handleNetworkSelect(network as NetworkType)}
              selected={selectedNetwork === network}
            >
              <h2>{deck.name}</h2>
              <p>{deck.description}</p>
              <p>Cards: {deck.cards.length}</p>
            </DeckCard>
          )
        ))}
      </DeckOptions>

      {selectedNetwork && (
        <>
          <NFTCollection>
            <NFTTitle>Your NFT Cards</NFTTitle>
            {isLoading ? (
              <p>Loading your NFT cards...</p>
            ) : nftCards.length > 0 ? (
              <NFTCards>
                {nftCards.map(card => (
                  <NFTCard
                    key={card.id}
                    onClick={() => handleNFTCardSelect(card)}
                    selected={selectedNFTCards.some(c => c.id === card.id)}
                  >
                    <h3>{card.name}</h3>
                    <p>Energy: {card.energy}</p>
                    <p>{card.description}</p>
                  </NFTCard>
                ))}
              </NFTCards>
            ) : (
              <p>No NFT cards found. Complete runs to earn fusion cards!</p>
            )}
          </NFTCollection>

          <SelectedDeck>
            <SelectedDeckTitle>Your Final Deck</SelectedDeckTitle>
            <SelectedDeckCards>
              {getFinalDeck().map(card => (
                <NFTCard key={card.id}>
                  <h3>{card.name}</h3>
                  <p>Energy: {card.energy}</p>
                  <p>{card.description}</p>
                </NFTCard>
              ))}
            </SelectedDeckCards>
          </SelectedDeck>

          <StartButton onClick={handleStartGame}>
            Start Game
          </StartButton>
        </>
      )}
    </DeckSelectionContainer>
  );
}; 