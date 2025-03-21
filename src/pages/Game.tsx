import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import '@reown/appkit-ui/jsx';
import { Battle } from '../components/Battle';
import { DeckSelection } from '../components/DeckSelection';
import { FusionCardSelection } from '../components/FusionCardSelection';
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
  const { address, isConnected } = useAppKitAccount();
  const [selectedDeck, setSelectedDeck] = useState<Card[] | null>(null);
  const [showFusionSelection, setShowFusionSelection] = useState(false);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);

  const handleDeckSelect = (deck: Card[]) => {
    setSelectedDeck(deck);
  };

  const handleBattleComplete = (result: 'win' | 'lose') => {
    setBattleResult(result);
    if (result === 'win') {
      setShowFusionSelection(true);
    }
  };

  const handleFusionComplete = () => {
    setShowFusionSelection(false);
    setSelectedDeck(null);
    setBattleResult(null);
  };

  if (!isConnected) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        color: '#ffd700',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1>Welcome to Slay the Consensus</h1>
        <p>Please connect your wallet to start playing!</p>
      </div>
    );
  }

  if (showFusionSelection && selectedDeck) {
    return <FusionCardSelection deck={selectedDeck} onComplete={handleFusionComplete} />;
  }

  if (!selectedDeck) {
    return <DeckSelection onStartGame={handleDeckSelect} />;
  }

  return <Battle deck={selectedDeck} onComplete={handleBattleComplete} />;
};

export default Game;