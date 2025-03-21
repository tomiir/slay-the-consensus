import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { Deck, Card } from '../game/core/types';
import deckService from '../services/deckService';
import { useBlockchainService } from '../services/blockchain';
import { GameCard } from './layout/GameCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: #121212;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(28, 54, 83, 0.2) 0%, transparent 25%),
    radial-gradient(circle at 80% 70%, rgba(75, 19, 79, 0.2) 0%, transparent 25%);
`;

const Title = styled.h1`
  color: #ffd700;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 2.8rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  letter-spacing: 2px;
`;

const Subtitle = styled.h2`
  color: #cccccc;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.5rem;
  max-width: 800px;
`;

const NetworkContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  max-width: 1200px;
`;

const NetworkCard = styled.div<{ network: string, selected: boolean }>`
  padding: 1.5rem;
  border-radius: 12px;
  width: 250px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? 
    (props.network === 'ethereum' ? '#627eea' : 
     props.network === 'solana' ? '#14f195' :
     '#f7931a') : 'transparent'};
  background: ${props => {
    if (props.network === 'ethereum') {
      return 'radial-gradient(circle, rgba(98, 126, 234, 0.1) 0%, rgba(30, 30, 40, 0.9) 100%)';
    } else if (props.network === 'solana') {
      return 'radial-gradient(circle, rgba(20, 241, 149, 0.1) 0%, rgba(30, 30, 40, 0.9) 100%)';
    } else {
      return 'radial-gradient(circle, rgba(247, 147, 26, 0.1) 0%, rgba(30, 30, 40, 0.9) 100%)';
    }
  }};
  box-shadow: ${props => props.selected ? 
    (props.network === 'ethereum' ? '0 0 15px rgba(98, 126, 234, 0.5)' : 
     props.network === 'solana' ? '0 0 15px rgba(20, 241, 149, 0.5)' :
     '0 0 15px rgba(247, 147, 26, 0.5)') : 'none'};
  transform: ${props => props.selected ? 'translateY(-5px)' : 'none'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => 
      props.network === 'ethereum' ? '0 0 15px rgba(98, 126, 234, 0.3)' : 
      props.network === 'solana' ? '0 0 15px rgba(20, 241, 149, 0.3)' :
      '0 0 15px rgba(247, 147, 26, 0.3)'};
  }
`;

const NetworkIcon = styled.div<{ network: string }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: ${props => {
    if (props.network === 'ethereum') {
      return '#627eea';
    } else if (props.network === 'solana') {
      return '#14f195';
    } else {
      return '#f7931a';
    }
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
    animation: shine 2s infinite linear;
  }
  
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const NetworkName = styled.h3<{ network: string }>`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: ${props => {
    if (props.network === 'ethereum') {
      return '#627eea';
    } else if (props.network === 'solana') {
      return '#14f195';
    } else {
      return '#f7931a';
    }
  }};
`;

const NetworkDesc = styled.p`
  color: #cccccc;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const DeckPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
  padding: 2rem;
  width: 100%;
  background: rgba(25, 25, 35, 0.7);
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  max-width: 1200px;
`;

const DeckTitle = styled.h2`
  color: #ffd700;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  width: 100%;
`;

const ActionButton = styled.button<{ network?: string }>`
  margin-top: 2rem;
  padding: 1rem 3rem;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  
  background: ${props => {
    if (props.network === 'ethereum') {
      return 'linear-gradient(135deg, #627eea 0%, #3b5998 100%)';
    } else if (props.network === 'solana') {
      return 'linear-gradient(135deg, #14f195 0%, #0c8c5c 100%)';
    } else if (props.network === 'bitcoin') {
      return 'linear-gradient(135deg, #f7931a 0%, #c67610 100%)';
    } else {
      return 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)';
    }
  }};
  color: white;
  box-shadow: ${props => {
    if (props.network === 'ethereum') {
      return '0 0 15px rgba(98, 126, 234, 0.3)';
    } else if (props.network === 'solana') {
      return '0 0 15px rgba(20, 241, 149, 0.3)';
    } else if (props.network === 'bitcoin') {
      return '0 0 15px rgba(247, 147, 26, 0.3)';
    } else {
      return '0 0 15px rgba(255, 215, 0, 0.3)';
    }
  }};
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => {
      if (props.network === 'ethereum') {
        return '0 0 20px rgba(98, 126, 234, 0.5)';
      } else if (props.network === 'solana') {
        return '0 0 20px rgba(20, 241, 149, 0.5)';
      } else if (props.network === 'bitcoin') {
        return '0 0 20px rgba(247, 147, 26, 0.5)';
      } else {
        return '0 0 20px rgba(255, 215, 0, 0.5)';
      }
    }};
    
    &:before {
      left: 100%;
    }
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    &:before {
      display: none;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid #ffd700;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #cccccc;
  font-size: 1.2rem;
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid #ffd700;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background: rgba(255, 215, 0, 0.3);
  }
`;

const CardOverlay = styled.div<{ selected: boolean; canAdd: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: ${props => props.selected ? '3px solid #ffd700' : 'none'};
  box-shadow: ${props => props.selected ? '0 0 10px #ffd700' : 'none'};
  background: ${props => !props.canAdd ? 'rgba(255, 0, 0, 0.3)' : 'transparent'};
  pointer-events: none;
  z-index: 2;
`;

const CardContainer = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const InfoMessage = styled.p`
  color: #cccccc;
  margin: 1rem 0;
  text-align: center;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{active: boolean}>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'rgba(255, 215, 0, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#ffd700' : '#aaaaaa'};
  border: none;
  border-bottom: ${props => props.active ? '2px solid #ffd700' : '2px solid transparent'};
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    color: #ffd700;
  }
`;

export const DeckSelection: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [editingDeck, setEditingDeck] = useState(false);
  const [currentDeckCards, setCurrentDeckCards] = useState<Card[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nftCards, setNftCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<'deck' | 'nft'>('deck');
  const [showingNftCards, setShowingNftCards] = useState(false);
  
  const MAX_DECK_SIZE = 10;

  const navigate = useNavigate();
  const { address } = useAppKitAccount();
  const { fetchNFTCards } = useBlockchainService();

  // Default decks for each network
  const networks = [
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      icon: 'Ξ',
      description: 'A balanced deck focused on powerful combos and synergies between cards. Better scaling in the late game.'
    },
    { 
      id: 'solana', 
      name: 'Solana', 
      icon: 'S',
      description: 'A speed-oriented deck with fast attacks and card cycling abilities. Quick to setup but requires careful planning.'
    },
    { 
      id: 'bitcoin', 
      name: 'Bitcoin', 
      icon: '₿',
      description: 'A defense-heavy deck that excels in building up block and launching powerful finishers. Slow but steady.'
    }
  ];

  // Load NFT cards when needed
  useEffect(() => {
    if (editingDeck && nftCards.length === 0) {
      loadNFTCards();
    }
  }, [editingDeck]);

  // Update current deck cards when selected deck changes
  useEffect(() => {
    if (selectedDeck) {
      setCurrentDeckCards([...selectedDeck.cards]);
    }
  }, [selectedDeck]);

  const handleNetworkSelect = async (networkId: string) => {
    setSelectedNetwork(networkId);
    setIsLoading(true);
    
    try {
      const deck = await deckService.fetchDeckByNetwork(networkId);
      setSelectedDeck(deck);
    } catch (error) {
      console.error(`Error fetching ${networkId} deck:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNFTCards = async () => {
    setIsLoading(true);
    try {
      const cards = await fetchNFTCards();
      setNftCards(cards);
    } catch (error) {
      console.error('Error fetching NFT cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNFTs = async () => {
    setIsLoading(true);
    setShowingNftCards(true);
    
    try {
      const cards = await fetchNFTCards();
      setNftCards(cards);
    } catch (error) {
      console.error('Error fetching NFT cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (selectedDeck) {
      console.log("Starting game with deck:", selectedDeck.id);
      
      // Create a fully serializable version of the deck with only the necessary properties
      const serializableDeck = {
        id: selectedDeck.id,
        name: selectedDeck.name,
        networkTheme: selectedDeck.networkTheme,
        description: selectedDeck.description
      };
      
      // Create a serializable version of the cards
      const serializableCards = currentDeckCards.map(card => ({
        id: card.id,
        name: card.name,
        description: card.description,
        networkOrigin: card.networkOrigin,
        cardType: card.cardType,
        rarity: card.rarity,
        energy: card.energy,
        effects: card.effects.map(effect => ({
          type: effect.type,
          value: effect.value,
          target: effect.target
        })),
        image: card.image || '',
        isFusion: card.isFusion || false,
        tokenId: card.tokenId || '',
        parentCards: card.parentCards || []
      }));
      
      // Store the deck in localStorage with cards
      localStorage.setItem('selectedDeck', JSON.stringify({
        ...serializableDeck,
        cards: serializableCards
      }));
      console.log("Deck saved to localStorage");
      
      // Navigate with just the deckId in state to avoid DataCloneError
      // The Game component will load the full deck from localStorage
      navigate('/game', { 
        state: { 
          deckId: selectedDeck.id
        } 
      });
    } else {
      console.error("No deck selected");
    }
  };

  const handleGoBack = () => {
    if (showingNftCards) {
      setShowingNftCards(false);
    } else if (editingDeck) {
      setEditingDeck(false);
      setActiveTab('deck');
      // Revert changes if user cancels editing
      if (selectedDeck) {
        setCurrentDeckCards([...selectedDeck.cards]);
      }
      setSelectedCardIndex(null);
    } else {
      setSelectedNetwork(null);
      setSelectedDeck(null);
    }
  };

  const handleToggleEdit = () => {
    setEditingDeck(!editingDeck);
    if (!editingDeck) {
      loadNFTCards();
    } else {
      setSelectedCardIndex(null);
      setActiveTab('deck');
    }
  };

  const handleCardSelect = (index: number) => {
    if (!editingDeck) return;
    
    if (activeTab === 'deck') {
      // If a card in deck is clicked, select it for potential removal
      setSelectedCardIndex(index);
    } else if (activeTab === 'nft') {
      const nftCard = nftCards[index];
      
      // If a card in NFT collection is clicked
      if (currentDeckCards.length < MAX_DECK_SIZE) {
        // If deck has space, add the NFT card directly
        setCurrentDeckCards([...currentDeckCards, nftCard]);
      } else if (selectedCardIndex !== null) {
        // If deck is full and a card is selected for replacement
        const newDeckCards = [...currentDeckCards];
        newDeckCards[selectedCardIndex] = nftCard;
        setCurrentDeckCards(newDeckCards);
        setSelectedCardIndex(null);
      }
    }
  };

  const handleRemoveCard = () => {
    if (selectedCardIndex !== null) {
      const newDeckCards = [...currentDeckCards];
      newDeckCards.splice(selectedCardIndex, 1);
      setCurrentDeckCards(newDeckCards);
      setSelectedCardIndex(null);
    }
  };

  const isCardInDeck = (cardId: string) => {
    return currentDeckCards.some(card => card.id === cardId);
  };

  if (showingNftCards) {
    return (
      <StyledContainer>
        <Title>Your Fusion NFT Collection</Title>
        <Subtitle>
          These are your hard-earned fusion cards. They will be available in all your future runs regardless of the network you choose.
        </Subtitle>
        
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading your NFT collection...</LoadingText>
          </LoadingContainer>
        ) : nftCards.length > 0 ? (
          <DeckPreview>
            <DeckTitle>Your Fusion Cards</DeckTitle>
            <CardsContainer>
              {nftCards.map((card, index) => (
                <GameCard key={index} card={card} />
              ))}
            </CardsContainer>
          </DeckPreview>
        ) : (
          <div style={{ margin: '3rem 0', textAlign: 'center' }}>
            <h3 style={{ color: '#cccccc', marginBottom: '1rem' }}>No fusion cards found</h3>
            <p style={{ color: '#999999' }}>Complete a run to create your first fusion card!</p>
          </div>
        )}
        
        <ActionButton onClick={handleGoBack}>
          Back to Deck Selection
        </ActionButton>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Title>Crypto Spire</Title>
      <Subtitle>
        {selectedNetwork 
          ? `Preview the ${selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} deck and start your run`
          : 'Select a blockchain network to determine your starting deck'}
      </Subtitle>
      
      {!selectedNetwork ? (
        <>
          <NetworkContainer>
            {networks.map(network => (
              <NetworkCard 
                key={network.id}
                network={network.id}
                selected={selectedNetwork === network.id}
                onClick={() => handleNetworkSelect(network.id)}
              >
                <NetworkIcon network={network.id}>{network.icon}</NetworkIcon>
                <NetworkName network={network.id}>{network.name}</NetworkName>
                <NetworkDesc>{network.description}</NetworkDesc>
              </NetworkCard>
            ))}
          </NetworkContainer>
          
          <ActionButton onClick={handleViewNFTs}>
            View Your NFT Collection
          </ActionButton>
        </>
      ) : isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading {selectedNetwork} deck...</LoadingText>
        </LoadingContainer>
      ) : selectedDeck ? (
        <>
          {editingDeck ? (
            <>
              <DeckPreview>
                <DeckTitle>{selectedDeck.name} - Editing Mode</DeckTitle>
                
                <TabsContainer>
                  <Tab 
                    active={activeTab === 'deck'} 
                    onClick={() => setActiveTab('deck')}
                  >
                    Current Deck ({currentDeckCards.length}/{MAX_DECK_SIZE})
                  </Tab>
                  <Tab 
                    active={activeTab === 'nft'} 
                    onClick={() => setActiveTab('nft')}
                  >
                    NFT Collection ({nftCards.length})
                  </Tab>
                </TabsContainer>
                
                {activeTab === 'deck' ? (
                  <>
                    <InfoMessage>
                      {selectedCardIndex !== null 
                        ? 'Click "Remove Card" to remove this card, or select a NFT card to replace it' 
                        : 'Select a card to replace or remove it'}
                    </InfoMessage>
                    
                    {selectedCardIndex !== null && (
                      <EditButton onClick={handleRemoveCard}>
                        Remove Card
                      </EditButton>
                    )}
                    
                    <CardsContainer>
                      {currentDeckCards.map((card, index) => (
                        <CardContainer key={index} onClick={() => handleCardSelect(index)}>
                          <CardOverlay 
                            selected={selectedCardIndex === index}
                            canAdd={true}
                          />
                          <GameCard card={card} />
                        </CardContainer>
                      ))}
                    </CardsContainer>
                    
                    {currentDeckCards.length === 0 && (
                      <InfoMessage>
                        Your deck is empty. Switch to NFT Collection to add cards.
                      </InfoMessage>
                    )}
                  </>
                ) : (
                  <>
                    <InfoMessage>
                      {currentDeckCards.length < MAX_DECK_SIZE 
                        ? 'Click on a NFT card to add it to your deck' 
                        : selectedCardIndex !== null 
                          ? 'Click on a NFT card to replace the selected card' 
                          : 'Your deck is full. Select a card from your deck first to replace it'}
                    </InfoMessage>
                    
                    <CardsContainer>
                      {nftCards.map((card, index) => (
                        <CardContainer key={index} onClick={() => handleCardSelect(index)}>
                          <CardOverlay 
                            selected={false}
                            canAdd={currentDeckCards.length < MAX_DECK_SIZE || selectedCardIndex !== null}
                          />
                          <GameCard card={card} />
                        </CardContainer>
                      ))}
                    </CardsContainer>
                    
                    {nftCards.length === 0 && (
                      <InfoMessage>
                        You don't have any NFT cards yet. Complete a run to create fusion cards.
                      </InfoMessage>
                    )}
                  </>
                )}
              </DeckPreview>
            </>
          ) : (
            <DeckPreview>
              <DeckTitle>{selectedDeck.name}</DeckTitle>
              <p style={{ color: '#cccccc', marginBottom: '2rem', maxWidth: '800px', textAlign: 'center' }}>
                {selectedDeck.description}
              </p>
              
              <CardsContainer>
                {currentDeckCards.map((card, index) => (
                  <GameCard key={index} card={card} />
                ))}
              </CardsContainer>
            </DeckPreview>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <ActionButton onClick={handleGoBack}>
              {editingDeck ? 'Cancel' : 'Back'}
            </ActionButton>
            
            <ActionButton onClick={handleToggleEdit}>
              {editingDeck ? 'Save Changes' : 'Edit Deck'}
            </ActionButton>
            
            {!editingDeck && (
              <ActionButton 
                network={selectedNetwork}
                onClick={handleStartGame}
              >
                Start Run
              </ActionButton>
            )}
          </div>
        </>
      ) : (
        <div>Failed to load deck. Please try again.</div>
      )}
    </StyledContainer>
  );
}; 