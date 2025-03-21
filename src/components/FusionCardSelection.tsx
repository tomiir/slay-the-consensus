import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../game/core/types';
import { useBlockchainService } from '../services/blockchain';

const Container = styled.div`
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

const Description = styled.p`
  color: #ccc;
  text-align: center;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const CardWrapper = styled.div<{ selected?: boolean }>`
  position: relative;
  cursor: pointer;
  transform: ${props => props.selected ? 'translateY(-10px)' : 'none'};
  transition: transform 0.3s ease;
`;

const CardContainer = styled.div<{ selected?: boolean, rarity: string }>`
  background: ${props => props.selected ? '#3c3c3c' : '#2c2c2c'};
  border-radius: 12px;
  padding: 1.5rem;
  border: ${props => props.selected ? '2px solid #ffd700' : '1px solid #444'};
  box-shadow: ${props => props.selected ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'};
  position: relative;

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

const SelectButton = styled.button`
  padding: 0.5rem 1rem;
  background: #ffd700;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  bottom: -2rem;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  opacity: ${props => props.selected ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const MintButton = styled.button`
  margin-top: 4rem;
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

interface FusionCardSelectionProps {
  deck: Card[];
  onComplete: () => void;
}

export const FusionCardSelection: React.FC<FusionCardSelectionProps> = ({ deck, onComplete }) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const { mintFusionCard } = useBlockchainService();

  // Randomly select 3 cards from the deck
  const availableCards = React.useMemo(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [deck]);

  const handleCardSelect = (card: Card) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      }
      if (prev.length < 2) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const handleMint = async () => {
    if (selectedCards.length !== 2) return;

    setIsMinting(true);
    try {
      const newCard = await mintFusionCard(selectedCards[0], selectedCards[1]);
      if (newCard) {
        console.log('Successfully minted fusion card:', newCard);
        onComplete();
      }
    } catch (error) {
      console.error('Failed to mint fusion card:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Container>
      <Title>Create Your Fusion Card</Title>
      <Description>
        Select 2 cards from your run to create a powerful fusion card NFT.
        This card will be available in future runs!
      </Description>

      <CardGrid>
        {availableCards.map(card => {
          const isSelected = selectedCards.some(c => c.id === card.id);
          return (
            <CardWrapper key={card.id} selected={isSelected}>
              <CardContainer
                onClick={() => handleCardSelect(card)}
                selected={isSelected}
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
              </CardContainer>
              <SelectButton selected={isSelected}>
                {isSelected ? 'Selected' : 'Select'}
              </SelectButton>
            </CardWrapper>
          );
        })}
      </CardGrid>

      <MintButton
        onClick={handleMint}
        disabled={selectedCards.length !== 2 || isMinting}
      >
        {isMinting ? (
          <>
            <LoadingSpinner />
            <span style={{ marginLeft: '1rem' }}>Minting...</span>
          </>
        ) : (
          'Mint Fusion Card'
        )}
      </MintButton>
    </Container>
  );
}; 