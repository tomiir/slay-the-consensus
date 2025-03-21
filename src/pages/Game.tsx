import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import '@reown/appkit-ui/jsx';
import { Battle } from '../components/Battle';
import { DeckSelection } from '../components/DeckSelection';
import { Card } from '../game/core/types';
import { useAppKitAccount } from '@reown/appkit/react';

const GameContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: #2a2a2a;
  border-radius: 8px;
  margin-top: 2rem;
`;

const ConnectMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDeck, setSelectedDeck] = useState<Card[] | null>(null);
  const { status } = useAppKitAccount();

  const handleDeckSelect = (deck: Card[]) => {
    setSelectedDeck(deck);
  };

  const handleBattleEnd = (victory: boolean) => {
    if (victory) {
      // TODO: Handle victory rewards, fusion cards, etc.
      alert('Congratulations! You won!');
    } else {
      alert('Game Over! Try again!');
    }
    setSelectedDeck(null);
  };

  if (status !== 'connected') {
    return (
      <GameContainer>
        <ConnectPrompt>
          <ConnectMessage>Connect your wallet to start playing</ConnectMessage>
          <appkit-button />
        </ConnectPrompt>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      {!selectedDeck ? (
        <DeckSelection onStartGame={handleDeckSelect} />
      ) : (
        <Battle
          deck={selectedDeck}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </GameContainer>
  );
};

export default Game;