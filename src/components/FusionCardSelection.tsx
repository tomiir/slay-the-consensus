import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../game/core/types';
import { useBlockchainService } from '../services/blockchain';
import { GameCard } from './layout/GameCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
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
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  letter-spacing: 1px;
`;

const Description = styled.p`
  color: #ccc;
  text-align: center;
  max-width: 600px;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  max-width: 1200px;
  width: 100%;
  padding: 1rem;
`;

const CardWrapper = styled.div<{ selected?: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
`;

const MintButton = styled.button`
  margin-top: 4rem;
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  color: #121212;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);

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
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid #ffd700;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin: 2rem 0;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const FusionPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(30, 30, 30, 0.8);
  padding: 2rem;
  border-radius: 15px;
  margin-top: 3rem;
  box-shadow: 0 0 30px rgba(138, 43, 226, 0.3);
  border: 1px solid rgba(138, 43, 226, 0.5);
  transition: all 0.3s ease;
  max-width: 900px;
  width: 100%;
`;

const FusionTitle = styled.h2`
  color: #9966cc;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(153, 102, 204, 0.5);
`;

const FusionCards = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  position: relative;
  width: 100%;
  
  &:after {
    content: '+';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    z-index: 2;
  }
`;

interface FusionCardSelectionProps {
  deck: Card[];
  onComplete: () => void;
  gold: number;
}

export const FusionCardSelection: React.FC<FusionCardSelectionProps> = ({ deck, onComplete, gold }) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedCard, setMintedCard] = useState<Card | null>(null);
  const { mintFusionCard } = useBlockchainService();
  
  // Determine number of fusion options based on gold (min 1, max 3)
  const maxFusionOptions = Math.min(3, Math.max(1, Math.floor(gold / 50)));

  const handleCardSelect = (card: Card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      if (selectedCards.length < 2) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const handleMint = async () => {
    if (selectedCards.length !== 2 || isMinting) return;

    setIsMinting(true);
    try {
      const fusedCard = await mintFusionCard(selectedCards[0], selectedCards[1]);
      console.log('Successfully minted fusion card:', fusedCard);
      setMintedCard(fusedCard);
      
      // Short delay to see the minted card before completion
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error minting fusion card:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Container>
      <Title>Create Fusion Card</Title>
      <Description>
        Select two cards from your deck to create a powerful fusion card. 
        Fusion cards combine the effects of both parent cards and are minted as NFTs on the blockchain.
        <br /><br />
        <strong>Gold: {gold} coins</strong> - You can select from {maxFusionOptions} fusion option{maxFusionOptions !== 1 ? 's' : ''}.
      </Description>

      {mintedCard ? (
        <FusionPreview>
          <FusionTitle>Fusion Successful!</FusionTitle>
          <GameCard card={mintedCard} />
        </FusionPreview>
      ) : isMinting ? (
        <>
          <FusionPreview>
            <FusionTitle>Creating Fusion...</FusionTitle>
            <FusionCards>
              {selectedCards.map((card, index) => (
                <GameCard key={index} card={card} />
              ))}
            </FusionCards>
          </FusionPreview>
          <LoadingSpinner />
        </>
      ) : (
        <>
          {selectedCards.length > 0 && (
            <FusionPreview>
              <FusionTitle>Selected Cards</FusionTitle>
              <FusionCards>
                {selectedCards.map((card, index) => (
                  <GameCard key={index} card={card} />
                ))}
              </FusionCards>
            </FusionPreview>
          )}
          
          <CardGrid>
            {deck.map((card, index) => (
              <CardWrapper key={index} selected={selectedCards.includes(card)}>
                <GameCard 
                  card={card} 
                  selected={selectedCards.includes(card)}
                  onClick={() => handleCardSelect(card)}
                  showSelectButton={true}
                />
              </CardWrapper>
            ))}
          </CardGrid>
          
          <MintButton 
            disabled={selectedCards.length !== 2} 
            onClick={handleMint}
          >
            Fuse Cards
          </MintButton>
        </>
      )}
    </Container>
  );
}; 