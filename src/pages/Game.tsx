import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import '@reown/appkit-ui/jsx';
import { Battle } from '../components/Battle';
import { DeckSelection } from '../components/DeckSelection';
import { FusionCardSelection } from '../components/FusionCardSelection';
import { Card, Deck } from '../game/core/types';
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
  const location = useLocation();
  const { address, isConnected } = useAppKitAccount();
  const [selectedDeck, setSelectedDeck] = useState<Card[] | null>(null);
  const [showFusionSelection, setShowFusionSelection] = useState(false);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);

  // Get deck from location state or localStorage
  useEffect(() => {
    // Try loading from location state first
    if (location.state && location.state.deckId) {
      // Load from localStorage using the deckId
      const savedDeckJson = localStorage.getItem('selectedDeck');
      if (savedDeckJson) {
        try {
          const savedDeck = JSON.parse(savedDeckJson) as Deck;
          if (savedDeck.id === location.state.deckId) {
            setSelectedDeck(savedDeck.cards);
            console.log("Deck loaded from localStorage:", savedDeck);
          }
        } catch (error) {
          console.error("Error parsing saved deck:", error);
        }
      }
    }
  }, [location.state]);

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

  const handleReturn = () => {
    navigate('/');
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
        <h1>Welcome to Crypto Spire</h1>
        <p>Please connect your wallet to start playing!</p>
      </div>
    );
  }

  if (showFusionSelection && selectedDeck) {
    return <FusionCardSelection deck={selectedDeck} onComplete={handleFusionComplete} />;
  }

  if (!selectedDeck) {
    // The updated DeckSelection handles its own navigation
    return <DeckSelection />;
  }

  return <Battle deck={selectedDeck} onComplete={handleBattleComplete} />;
};

export default Game;