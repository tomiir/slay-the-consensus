import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import '@reown/appkit-ui/jsx';
import { Battle } from '../components/Battle';
import { DeckSelection } from '../components/DeckSelection';
import { FusionCardSelection } from '../components/FusionCardSelection';
import { MapView } from '../components/MapView';
import { Card, Deck, GameMap, GameProgress, MapNode } from '../game/core/types';
import { generateMap, selectNode, restSiteHeal, enemyData } from '../game/core/mapGenerator';
import { useAppKitAccount } from '@reown/appkit/react';

const GameContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
`;

const PlayerStats = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StatBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatIcon = styled.span`
  font-size: 1.2rem;
`;

const StatValue = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
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

const ConnectButton = styled.button`
  background: #4caf50;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #45a049;
  }
`;

// Game states
type GameState = 'deck_selection' | 'map' | 'battle' | 'rest' | 'fusion' | 'complete';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useAppKitAccount();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('deck_selection');
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Card[] | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<any | null>(null);
  const [battleOutcome, setBattleOutcome] = useState<'win' | 'lose' | null>(null);

  // Initialize game state on mount
  useEffect(() => {
    // Reset game state to deck_selection when component mounts
    console.log("Game component mounted, initializing to deck selection");
    setGameState('deck_selection');
    setGameProgress(null);
    setSelectedDeck(null);
    setCurrentNodeId(null);
    setCurrentEnemy(null);
    setBattleOutcome(null);
  }, []);

  // Load deck based on location state
  useEffect(() => {
    console.log("Location state changed:", location.state);
    
    if (!location.state) {
      // No state passed, stay in deck selection
      return;
    }
    
    // Check for deckId from location state
    const deckId = location.state?.deckId;
    
    if (deckId) {
      console.log("Using deckId from location state:", deckId);
      // Load deck from localStorage
      try {
        const savedDeckString = localStorage.getItem('selectedDeck');
        if (savedDeckString) {
          const savedDeck = JSON.parse(savedDeckString);
          console.log("Found saved deck in localStorage:", savedDeck.id);
          
          // Verify we have cards
          if (savedDeck.cards && Array.isArray(savedDeck.cards)) {
            setSelectedDeck(savedDeck.cards);
            
            // Initialize new game
            const newMap = generateMap();
            const newGameProgress: GameProgress = {
              map: newMap,
              player: {
                health: 75,
                maxHealth: 75,
                block: 0,
                energy: 3,
                maxEnergy: 3,
                effects: {}
              },
              deck: savedDeck.cards,
              gold: 0,
              completedBattles: 0
            };
            setGameProgress(newGameProgress);
            setGameState('map');
          } else {
            console.error("Invalid deck structure in localStorage", savedDeck);
            setGameState('deck_selection');
          }
        } else {
          console.error("No deck found in localStorage");
          setGameState('deck_selection');
        }
      } catch (error) {
        console.error("Error loading saved deck:", error);
        setGameState('deck_selection');
      }
    } else {
      console.error("No deckId in location state");
      setGameState('deck_selection');
    }
  }, [location.state]);
  
  // Handle node selection on the map
  const handleNodeSelect = (nodeId: string) => {
    if (!gameProgress) return;
    
    const updatedMap = selectNode(gameProgress.map, nodeId);
    const selectedNode = updatedMap.nodes[nodeId];
    setCurrentNodeId(nodeId);
    
    // Update game progress with new map
    setGameProgress({
      ...gameProgress,
      map: updatedMap
    });
    
    // Handle node type
    switch (selectedNode.type) {
      case 'enemy':
      case 'elite':
      case 'boss':
        if (selectedNode.enemyId) {
          setCurrentEnemy(enemyData[selectedNode.enemyId]);
          setGameState('battle');
        }
        break;
      case 'rest':
        // Rest site heals the player
        const healedPlayer = restSiteHeal(gameProgress.player);
        setGameProgress({
          ...gameProgress,
          player: {
            ...gameProgress.player,
            health: healedPlayer.health
          },
          map: updatedMap
        });
        setGameState('rest');
        break;
    }
  };
  
  // Handle battle completion
  const handleBattleComplete = (result: 'win' | 'lose') => {
    setBattleOutcome(result);
    
    if (!gameProgress || !currentNodeId) return;
    
    if (result === 'win') {
      // Get the current node and enemy
      const currentNode = gameProgress.map.nodes[currentNodeId];
      const enemy = currentNode.enemyId ? enemyData[currentNode.enemyId] : null;
      
      // Mark the node as completed
      const updatedMap = { ...gameProgress.map };
      updatedMap.nodes[currentNodeId].completed = true;
      
      // Add gold reward if enemy was defeated
      const goldReward = enemy ? enemy.goldReward : 0;
      
      // Update game progress
      const updatedProgress = {
        ...gameProgress,
        map: updatedMap,
        gold: gameProgress.gold + goldReward,
        completedBattles: gameProgress.completedBattles + 1
      };
      
      setGameProgress(updatedProgress);
      
      // Check if we defeated the boss
      if (currentNode.type === 'boss') {
        setGameState('fusion');
      } else {
        // Return to map
        setGameState('map');
      }
    } else {
      // Game over on loss
      setGameState('complete');
    }
  };
  
  // Handle rest site completion
  const handleRestComplete = () => {
    setGameState('map');
  };
  
  // Handle fusion completion
  const handleFusionComplete = () => {
    // Here we would typically update the player's collection with the new card
    // For now, just return to the deck selection
    setGameState('complete');
    setGameProgress(null);
    setSelectedDeck(null);
    setCurrentNodeId(null);
    setCurrentEnemy(null);
    setBattleOutcome(null);
    
    // Navigate to home
    navigate('/');
  };
  
  // Rendering based on game state
  const renderGameContent = () => {
    if (!isConnected) {
      return (
        <ConnectPrompt>
          <ConnectMessage>Please connect your wallet to play</ConnectMessage>
          <appkit-connect-button />
        </ConnectPrompt>
      );
    }
    
    // Show deck selection when in deck_selection state, always
    if (gameState === 'deck_selection') {
      console.log("Rendering deck selection screen");
      // Always render DeckSelection when state is deck_selection
      return <DeckSelection />;
    }
    
    // For all other states, ensure we have required game data
    if (!selectedDeck || !gameProgress) {
      console.log("Missing required game data, forcing deck selection", { selectedDeck, gameProgress });
      setGameState('deck_selection');
      return <DeckSelection />;
    }
    
    // Handle other game states
    switch (gameState) {
      case 'map':
        return <MapView map={gameProgress.map} onNodeSelect={handleNodeSelect} />;
      
      case 'battle':
        return (
          <Battle 
            deck={gameProgress.deck} 
            onComplete={handleBattleComplete} 
          />
        );
      
      case 'rest':
        // Simple rest view - in a real game, this would be a more elaborate component
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Rest Site</h2>
            <p>You've recovered {Math.floor(gameProgress.player.maxHealth * 0.3)} health.</p>
            <p>Current Health: {gameProgress.player.health}/{gameProgress.player.maxHealth}</p>
            <button onClick={handleRestComplete}>Continue Journey</button>
          </div>
        );
      
      case 'fusion':
        return (
          <FusionCardSelection 
            deck={gameProgress.deck}
            onComplete={handleFusionComplete}
            gold={gameProgress.gold}
          />
        );
      
      case 'complete':
        // Game over view
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>{battleOutcome === 'win' ? 'Victory!' : 'Defeat'}</h2>
            <p>{battleOutcome === 'win' 
              ? 'You have conquered the Crypto Spire!' 
              : 'Your journey has ended. Better luck next time.'}
            </p>
            <p>Gold collected: {gameProgress.gold}</p>
            <p>Battles won: {gameProgress.completedBattles}</p>
            <button onClick={() => navigate('/')}>Return to Main Menu</button>
          </div>
        );
      
      default:
        // Fallback to deck selection for any unknown state
        return <DeckSelection />;
    }
  };

  return (
    <GameContainer>
      {gameProgress && gameState !== 'deck_selection' && (
        <InfoBar>
          <PlayerStats>
            <StatBlock>
              <StatIcon>❤️</StatIcon>
              <StatValue>{gameProgress.player.health}/{gameProgress.player.maxHealth}</StatValue>
            </StatBlock>
            <StatBlock>
              <StatIcon>💰</StatIcon>
              <StatValue>{gameProgress.gold}</StatValue>
            </StatBlock>
          </PlayerStats>
        </InfoBar>
      )}
      {renderGameContent()}
    </GameContainer>
  );
};

export default Game;