import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BattleSystem } from '../game/core/battle';
import { Card, GameState, CardEffect, EffectType, EffectTarget } from '../game/core/types';
import { GameCard } from './layout/GameCard';

const BattleContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #121212;
  overflow: hidden;
  position: relative;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(28, 54, 83, 0.2) 0%, transparent 25%),
    radial-gradient(circle at 80% 70%, rgba(75, 19, 79, 0.2) 0%, transparent 25%);
`;

const BattleField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 2rem;
  gap: 4rem;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const CharacterStats = styled.div<{ isEnemy?: boolean }>`
  background: ${props => props.isEnemy ? 'rgba(255, 99, 71, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: ${props => props.isEnemy ? 'right' : 'left'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CharacterName = styled.h3<{ isEnemy?: boolean }>`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: ${props => props.isEnemy ? '#ff6347' : '#4caf50'};
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const HealthBar = styled.div<{ percentage: number, isEnemy?: boolean }>`
  width: 100%;
  height: 25px;
  background: #2c2c2c;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0.5rem 0;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.percentage}%;
    height: 100%;
    background: ${props => props.isEnemy 
      ? 'linear-gradient(to right, #ff6347, #ff8c66)' 
      : 'linear-gradient(to right, #4caf50, #80e27e)'};
    transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
`;

const HealthText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  z-index: 1;
`;

const BlockBadge = styled.div<{ isEnemy?: boolean }>`
  display: inline-block;
  background: ${props => props.isEnemy ? '#ff63471a' : '#4caf501a'};
  border: 2px solid ${props => props.isEnemy ? '#ff6347' : '#4caf50'};
  color: ${props => props.isEnemy ? '#ff6347' : '#4caf50'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  position: absolute;
  ${props => props.isEnemy ? 'right: -10px;' : 'left: -10px;'}
  top: -10px;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const Hand = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(44, 44, 44, 0.3);
  border-radius: 12px;
  min-height: 300px;
  position: relative;
`;

const CardWrapper = styled.div<{ disabled: boolean; isPlayed: boolean }>`
  transform: ${props => 
    props.isPlayed 
      ? 'scale(0.9) translateY(-20px)' 
      : props.disabled 
        ? 'translateY(15px)' 
        : 'translateY(0)'
  };
  transition: transform 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  margin: 0 -15px;
  position: relative;
  
  &:hover {
    transform: ${props => 
      props.disabled 
        ? 'translateY(15px)' 
        : 'translateY(-30px) scale(1.05)'
    };
    z-index: 10;
  }
`;

const EnergyOverlay = styled.div<{ disabled: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  opacity: ${props => props.disabled ? 0.8 : 0};
  pointer-events: none;
  z-index: 2;
`;

const EnergyDisplay = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #ffc107, #ff9800);
  padding: 0.8rem;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #121212;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3);
  z-index: 100;
  transition: all 0.3s ease;
`;

const EnergyIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
`;

const EnergyText = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const EndTurnButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  z-index: 100;
  
  &:hover {
    background: linear-gradient(135deg, #5cba60, #3e8d42);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
`;

const DeckInfo = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  background: linear-gradient(135deg, #2c2c2c, #444444);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
`;

const DeckPile = styled.div<{ type: 'draw' | 'discard' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const PileIcon = styled.div<{ type: 'draw' | 'discard' }>`
  width: 50px;
  height: 70px;
  border-radius: 8px;
  background: ${props => props.type === 'draw' ? '#4169e1' : '#8b0000'};
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::after {
    content: '${props => props.type === 'draw' ? '↓' : '↑'}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const PileCount = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
`;

const PileLabel = styled.div`
  font-size: 0.9rem;
  color: #cccccc;
`;

const EnemyIntentContainer = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(44, 44, 44, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  z-index: 5;
`;

const IntentIcon = styled.div<{ type: string }>`
  width: 24px;
  height: 24px;
  background: ${props => {
    switch (props.type) {
      case 'attack': return '#ff6347';
      case 'defend': return '#4caf50';
      case 'buff': return '#ffd700';
      case 'debuff': return '#9c27b0';
      default: return '#cccccc';
    }
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
`;

const IntentValue = styled.span`
  font-weight: bold;
  color: #ffffff;
`;

const PlayedCardAnimation = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(5deg) scale(1.2);
  z-index: 10;
  perspective: 1000px;
  pointer-events: none;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  animation: cardPlay 0.8s forwards;
  
  @keyframes cardPlay {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(5deg) scale(1.2);
    }
    80% {
      opacity: 0.8;
      transform: translate(-50%, -20%) rotate(10deg) scale(1.3);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, 0%) rotate(15deg) scale(1.4);
    }
  }
`;

const PlayedCardContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
  z-index: 5;
  pointer-events: none;
`;

const PlayedCardsRow = styled.div<{ isEnemy?: boolean }>`
  display: flex;
  gap: 1rem;
  justify-content: center;
  transform: ${props => props.isEnemy ? 'translateY(-150px)' : 'translateY(150px)'};
`;

const PlayedCardSmall = styled.div<{ cardType: string }>`
  width: 100px;
  height: 140px;
  background: ${props => {
    switch (props.cardType) {
      case 'attack': return 'linear-gradient(135deg, #2d0000 0%, #570000 100%)';
      case 'skill': return 'linear-gradient(135deg, #001e3c 0%, #003366 100%)';
      case 'power': return 'linear-gradient(135deg, #1a0033 0%, #330066 100%)';
      default: return '#2c2c2c';
    }
  }};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-size: 0.8rem;
  padding: 0.5rem;
  text-align: center;
  opacity: 0.7;
`;

interface BattleProps {
  deck: Card[];
  onComplete: (result: 'win' | 'lose') => void;
}

export const Battle: React.FC<BattleProps> = ({ deck, onComplete }) => {
  const [battle, setBattle] = useState<BattleSystem>(new BattleSystem(deck));
  const [gameState, setGameState] = useState<GameState>(battle.getState());
  const [playedCardIndex, setPlayedCardIndex] = useState<number | null>(null);
  const [playedCard, setPlayedCard] = useState<Card | null>(null);
  const [playerPlayedCards, setPlayerPlayedCards] = useState<Card[]>([]);
  const [enemyPlayedCards, setEnemyPlayedCards] = useState<Card[]>([]);

  const handlePlayCard = (cardIndex: number) => {
    const card = gameState.hand[cardIndex];
    
    // Check if card can be played
    if (gameState.player.energy < card.energy) return;
    
    // Set the played card for animation
    setPlayedCardIndex(cardIndex);
    setPlayedCard(card);
    
    // Add to played cards history
    setPlayerPlayedCards([...playerPlayedCards, card]);
    
    // Delay actual card play to allow for animation
    setTimeout(() => {
      if (battle.playCard(cardIndex)) {
        setGameState(battle.getState());
        
        const result = battle.getBattleResult();
        if (result) {
          handleBattleEnd(result.victory);
        }
      }
      
      // Reset played card after a delay
      setTimeout(() => {
        setPlayedCardIndex(null);
        setPlayedCard(null);
      }, 500);
    }, 800);
  };

  const handleEndTurn = () => {
    // Add enemy intent as a played card
    if (gameState.enemyIntent) {
      // Map enemy intent type to card effect type
      const effectType: EffectType = 
        gameState.enemyIntent.type === 'attack' ? 'damage' :
        gameState.enemyIntent.type === 'defend' ? 'block' :
        gameState.enemyIntent.type === 'buff' ? 'energy' : 'poison';
        
      // Determine appropriate target
      const target: EffectTarget = 
        gameState.enemyIntent.type === 'attack' ? 'self' : 'enemy';
        
      const enemyCard: Card = {
        id: `enemy-${Date.now()}`,
        name: gameState.enemyIntent.type === 'attack' ? 'Enemy Attack' : 
              gameState.enemyIntent.type === 'defend' ? 'Enemy Defense' : 'Enemy Effect',
        description: `${gameState.enemyIntent.type} for ${gameState.enemyIntent.value}`,
        energy: 0,
        cardType: gameState.enemyIntent.type === 'attack' ? 'attack' : 'skill',
        rarity: 'common',
        effects: [
          {
            type: effectType,
            value: gameState.enemyIntent.value,
            target: target
          }
        ],
        networkOrigin: 'ethereum',
        isFusion: false
      };
      setEnemyPlayedCards([...enemyPlayedCards, enemyCard]);
    }
    
    // Clear player played cards for the new turn
    setPlayerPlayedCards([]);
    
    battle.endTurn();
    setGameState(battle.getState());
    
    const result = battle.getBattleResult();
    if (result) {
      handleBattleEnd(result.victory);
    }
    
    // Clear enemy played cards at the start of player turn
    setTimeout(() => {
      setEnemyPlayedCards([]);
    }, 1500);
  };

  const handleBattleEnd = (victory: boolean) => {
    onComplete(victory ? 'win' : 'lose');
  };

  const calculateHealthPercentage = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  return (
    <BattleContainer>
      <BattleField>
        <CharacterStats>
          <CharacterName>Player</CharacterName>
          <div style={{ position: 'relative' }}>
            <HealthBar 
              percentage={calculateHealthPercentage(
                gameState.player.health, 
                gameState.player.maxHealth
              )} 
            >
              <HealthText>{gameState.player.health}/{gameState.player.maxHealth}</HealthText>
            </HealthBar>
            {gameState.player.block > 0 && (
              <BlockBadge>
                {gameState.player.block}
              </BlockBadge>
            )}
          </div>
        </CharacterStats>

        <CharacterStats isEnemy>
          <CharacterName isEnemy>Enemy</CharacterName>
          {gameState.enemyIntent && (
            <EnemyIntentContainer>
              <IntentIcon type={gameState.enemyIntent.type}>
                {gameState.enemyIntent.type === 'attack' ? '⚔️' : 
                 gameState.enemyIntent.type === 'defend' ? '🛡️' : 
                 gameState.enemyIntent.type === 'buff' ? '⬆️' : '⬇️'}
              </IntentIcon>
              <IntentValue>{gameState.enemyIntent.value}</IntentValue>
            </EnemyIntentContainer>
          )}
          <div style={{ position: 'relative' }}>
            <HealthBar 
              percentage={calculateHealthPercentage(
                gameState.enemy.health, 
                gameState.enemy.maxHealth
              )}
              isEnemy 
            >
              <HealthText>{gameState.enemy.health}/{gameState.enemy.maxHealth}</HealthText>
            </HealthBar>
            {gameState.enemy.block > 0 && (
              <BlockBadge isEnemy>
                {gameState.enemy.block}
              </BlockBadge>
            )}
          </div>
        </CharacterStats>
      </BattleField>

      <PlayedCardContainer>
        <PlayedCardsRow isEnemy>
          {enemyPlayedCards.map((card, index) => (
            <PlayedCardSmall key={`enemy-${index}`} cardType={card.cardType}>
              {card.name}
            </PlayedCardSmall>
          ))}
        </PlayedCardsRow>
        
        <PlayedCardsRow>
          {playerPlayedCards.map((card, index) => (
            <PlayedCardSmall key={`player-${index}`} cardType={card.cardType}>
              {card.name}
            </PlayedCardSmall>
          ))}
        </PlayedCardsRow>
      </PlayedCardContainer>

      <Hand>
        {gameState.hand.map((card, index) => (
          <CardWrapper
            key={`${card.id}-${index}`}
            onClick={() => handlePlayCard(index)}
            disabled={gameState.player.energy < card.energy}
            isPlayed={playedCardIndex === index}
          >
            <EnergyOverlay disabled={gameState.player.energy < card.energy} />
            <GameCard card={card} />
          </CardWrapper>
        ))}
      </Hand>

      <EnergyDisplay>
        <EnergyIcon>⚡</EnergyIcon>
        <EnergyText>{gameState.player.energy}/{gameState.player.maxEnergy}</EnergyText>
      </EnergyDisplay>

      <DeckInfo>
        <DeckPile type="draw">
          <PileIcon type="draw" />
          <PileCount>{gameState.drawPile.length}</PileCount>
          <PileLabel>Draw</PileLabel>
        </DeckPile>
        
        <DeckPile type="discard">
          <PileIcon type="discard" />
          <PileCount>{gameState.discardPile.length}</PileCount>
          <PileLabel>Discard</PileLabel>
        </DeckPile>
      </DeckInfo>

      <EndTurnButton onClick={handleEndTurn}>
        End Turn
      </EndTurnButton>

      {playedCard && (
        <PlayedCardAnimation>
          <GameCard card={playedCard} />
        </PlayedCardAnimation>
      )}
    </BattleContainer>
  );
}; 