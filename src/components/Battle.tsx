import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BattleSystem } from '../game/core/battle';
import { Card, GameState } from '../game/core/types';

const BattleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const BattleField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const CharacterStats = styled.div<{ isEnemy?: boolean }>`
  background: ${props => props.isEnemy ? '#ff634733' : '#4caf5033'};
  border-radius: 8px;
  padding: 1rem;
  text-align: ${props => props.isEnemy ? 'right' : 'left'};
`;

const HealthBar = styled.div<{ percentage: number, isEnemy?: boolean }>`
  width: 100%;
  height: 20px;
  background: #2c2c2c;
  border-radius: 10px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.percentage}%;
    height: 100%;
    background: ${props => props.isEnemy ? '#ff6347' : '#4caf50'};
    transition: width 0.3s ease;
  }
`;

const Hand = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
  background: #2c2c2c33;
  border-radius: 8px;
`;

const CardComponent = styled.div<{ disabled?: boolean }>`
  width: 150px;
  height: 200px;
  background: #2c2c2c;
  border-radius: 8px;
  padding: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: transform 0.2s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-5px)'};
  }
`;

const EnergyDisplay = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #2c2c2c;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EndTurnButton = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #45a049;
  }
`;

interface BattleProps {
  deck: Card[];
  onComplete: (result: 'win' | 'lose') => void;
}

export const Battle: React.FC<BattleProps> = ({ deck, onComplete }) => {
  const [battle, setBattle] = useState<BattleSystem>(new BattleSystem(deck));
  const [gameState, setGameState] = useState<GameState>(battle.getState());

  const handlePlayCard = (cardIndex: number) => {
    if (battle.playCard(cardIndex)) {
      setGameState(battle.getState());
      
      const result = battle.getBattleResult();
      if (result) {
        handleBattleEnd(result.victory);
      }
    }
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
          <h3>Player</h3>
          <p>Health: {gameState.player.health}/{gameState.player.maxHealth}</p>
          <HealthBar 
            percentage={calculateHealthPercentage(
              gameState.player.health, 
              gameState.player.maxHealth
            )} 
          />
          {gameState.player.block > 0 && <p>Block: {gameState.player.block}</p>}
        </CharacterStats>

        <CharacterStats isEnemy>
          <h3>Enemy</h3>
          <p>Health: {gameState.enemy.health}/{gameState.enemy.maxHealth}</p>
          <HealthBar 
            percentage={calculateHealthPercentage(
              gameState.enemy.health, 
              gameState.enemy.maxHealth
            )}
            isEnemy 
          />
          {gameState.enemy.block > 0 && <p>Block: {gameState.enemy.block}</p>}
        </CharacterStats>
      </BattleField>

      <Hand>
        {gameState.hand.map((card, index) => (
          <CardComponent
            key={`${card.id}-${index}`}
            onClick={() => handlePlayCard(index)}
            disabled={gameState.player.energy < card.energy}
          >
            <h4>{card.name}</h4>
            <p>Energy: {card.energy}</p>
            <p>{card.description}</p>
          </CardComponent>
        ))}
      </Hand>

      <EnergyDisplay>
        Energy: {gameState.player.energy}/{gameState.player.maxEnergy}
      </EnergyDisplay>

      <EndTurnButton onClick={handleEndTurn}>
        End Turn
      </EndTurnButton>
    </BattleContainer>
  );
}; 