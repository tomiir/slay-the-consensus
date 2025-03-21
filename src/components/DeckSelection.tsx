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
  min-height: 100vh;
  background: #1a1a1a;
`;

const Title = styled.h1`
  color: #ffd700;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
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
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: ${props => props.selected ? '2px solid #ffd700' : '1px solid #444'};
  box-shadow: ${props => props.selected ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  h2 {
    color: #ffd700;
    margin-bottom: 1rem;
  }

  p {
    color: #ccc;
    margin: 0.5rem 0;
  }
`;

const NFTCollection = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 1200px;
  background: #2c2c2c;
  border-radius: 12px;
  padding: 2rem;
`;

const NFTTitle = styled.h2`
  color: #ffd700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-size: 1rem;
    color: #888;
  }
`;

const NFTCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const NFTCard = styled.div<{ selected?: boolean, rarity: string }>`
  background: ${props => props.selected ? '#3c3c3c' : '#1a1a1a'};
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: ${props => props.selected ? '2px solid #ffd700' : '1px solid #444'};
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  h3 {
    color: #ffd700;
    margin-bottom: 0.5rem;
  }

  .energy {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #ffd700;
    color: #1a1a1a;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
  }

  .rarity {
    color: ${props => {
      switch (props.rarity) {
        case 'rare': return '#ffd700';
        case 'uncommon': return '#c0c0c0';
        default: return '#b87333';
      }
    }};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .description {
    color: #ccc;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .effects {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .effect {
    background: #444;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #ccc;
  }
`;

const SelectedDeck = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 1200px;
  background: #2c2c2c;
  border-radius: 12px;
  padding: 2rem;
`;

const SelectedDeckTitle = styled.h2`
  color: #ffd700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-size: 1rem;
    color: #888;
  }
`;

const SelectedDeckCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StartButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 3rem;
  background: #ffd700;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid #ffd700;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
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
  }, []);

  const handleNetworkSelect = (network: NetworkType) => {
    setSelectedNetwork(network);
  };

  const handleNFTCardSelect = (card: Card) => {
    setSelectedNFTCards(prev => {
      if (prev.find(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      }
      
      // Limit selected NFT cards based on available slots in the deck
      // A deck should have exactly 10 cards total
      const maxNFTCards = 10;
      if (prev.length < maxNFTCards) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const getFinalDeck = (): Card[] => {
    if (!selectedNetwork) return [];
    
    // Get starter deck cards
    const starterDeck = starterDecks[selectedNetwork].cards.map(card => ({...card}));
    
    // Limit the total deck size to 10 cards
    // If there are NFT cards selected, replace some of the starter deck cards
    const maxDeckSize = 10;
    
    // If we have NFT cards, replace starter cards with them (up to the full deck)
    if (selectedNFTCards.length > 0) {
      // Take enough starter cards to fill the remaining slots after NFT cards
      const starterCardsToKeep = Math.max(0, maxDeckSize - selectedNFTCards.length);
      const limitedStarterDeck = starterDeck.slice(0, starterCardsToKeep);
      
      // Combine with selected NFT cards
      return [...limitedStarterDeck, ...selectedNFTCards];
    }
    
    // If no NFT cards, just take the first 10 cards from the starter deck
    return starterDeck.slice(0, maxDeckSize);
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
              <p>Starting Cards: {deck.cards.length}</p>
            </DeckCard>
          )
        ))}
      </DeckOptions>

      {selectedNetwork && (
        <>
          <NFTCollection>
            <NFTTitle>
              Your NFT Cards
              <span>(Select up to {10 - (selectedNetwork ? Math.min(10, starterDecks[selectedNetwork].cards.length) : 0)} cards to include in your deck)</span>
            </NFTTitle>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <LoadingSpinner />
                <p style={{ color: '#ccc', marginTop: '1rem' }}>Loading your NFT cards...</p>
              </div>
            ) : nftCards.length > 0 ? (
              <NFTCards>
                {nftCards.map(card => (
                  <NFTCard
                    key={card.id}
                    onClick={() => handleNFTCardSelect(card)}
                    selected={selectedNFTCards.some(c => c.id === card.id)}
                    rarity={card.rarity}
                  >
                    <div className="energy">{card.energy}</div>
                    <h3>{card.name}</h3>
                    <div className="rarity">{card.rarity}</div>
                    <div className="description">{card.description}</div>
                    <div className="effects">
                      {card.effects.map((effect, index) => (
                        <span key={index} className="effect">
                          {effect.type}: {effect.value}
                        </span>
                      ))}
                    </div>
                  </NFTCard>
                ))}
              </NFTCards>
            ) : (
              <p style={{ color: '#ccc', textAlign: 'center', padding: '2rem' }}>
                No NFT cards found. Complete runs to earn fusion cards!
              </p>
            )}
          </NFTCollection>

          <SelectedDeck>
            <SelectedDeckTitle>
              Your Final Deck
              <span>({getFinalDeck().length} cards)</span>
            </SelectedDeckTitle>
            <SelectedDeckCards>
              {getFinalDeck().map(card => (
                <NFTCard key={card.id} rarity={card.rarity}>
                  <div className="energy">{card.energy}</div>
                  <h3>{card.name}</h3>
                  <div className="rarity">{card.rarity}</div>
                  <div className="description">{card.description}</div>
                  <div className="effects">
                    {card.effects.map((effect, index) => (
                      <span key={index} className="effect">
                        {effect.type}: {effect.value}
                      </span>
                    ))}
                  </div>
                </NFTCard>
              ))}
            </SelectedDeckCards>
          </SelectedDeck>

          <StartButton 
            onClick={handleStartGame}
            disabled={getFinalDeck().length === 0}
          >
            Start Game
          </StartButton>
        </>
      )}
    </DeckSelectionContainer>
  );
}; 