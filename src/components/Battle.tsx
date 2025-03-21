import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BattleSystem } from '../game/core/battle';
import { Card, GameState } from '../game/core/types';
import { GameCard } from './layout/GameCard';

const BattleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #121212;
  color: white;
`;

const BattleField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  position: relative;
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

const CardWrapper = styled.div<{ disabled?: boolean, isPlayed?: boolean }>`
  position: relative;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transform-origin: center bottom;
  
  ${props => props.isPlayed ? `
    animation: playCardAnimation 1s forwards;
    z-index: 10;
    
    @keyframes playCardAnimation {
      0% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-100px) scale(1.1) rotate(5deg); }
      100% { transform: translateY(500px) scale(0.5) rotate(10deg); opacity: 0; }
    }
  ` : `
    &:hover {
      transform: ${props.disabled ? 'none' : 'translateY(-15px) scale(1.05)'};
      z-index: 5;
    }
  `}
`;

const EnergyOverlay = styled.div<{ disabled: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.disabled ? 'rgba(255, 0, 0, 0.3)' : 'transparent'};
  border-radius: 10px;
  pointer-events: none;
  z-index: 2;
`;

const EnergyDisplay = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #2c2c2c, #444444);
  padding: 0.8rem 1.2rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
`;

const EnergyIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #333;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const EnergyText = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  display: flex;
  gap: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
`;

const DeckPile = styled.div<{ type: 'draw' | 'discard' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
`;

const PileIcon = styled.div<{ type: 'draw' | 'discard' }>`
  width: 40px;
  height: 55px;
  border-radius: 5px;
  background: ${props => props.type === 'draw' ? '#4169e1' : '#8b0000'};
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
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
`;

const PileCount = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: #cccccc;
`;

const PileLabel = styled.div`
  font-size: 0.8rem;
  color: #999999;
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
  transform: translate(-50%, -50%);
  z-index: 10;
  perspective: 1000px;
  pointer-events: none;
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

  const handlePlayCard = (cardIndex: number) => {
    const card = gameState.hand[cardIndex];
    
    // Check if card can be played
    if (gameState.player.energy < card.energy) return;
    
    // Set the played card for animation
    setPlayedCardIndex(cardIndex);
    setPlayedCard(card);
    
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
    battle.endTurn();
    setGameState(battle.getState());
    
    const result = battle.getBattleResult();
    if (result) {
      handleBattleEnd(result.victory);
    }
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