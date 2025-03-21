import React from 'react';
import styled from 'styled-components';
import { Card, CardEffect } from '../../game/core/types';

interface CardProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  showSelectButton?: boolean;
}

// Card container with glowing effects and styling based on rarity
const CardContainer = styled.div<{ selected?: boolean; rarity: string; cardType: string; isFusion: boolean }>`
  position: relative;
  background: ${props => {
    // Different background gradients based on card type
    if (props.cardType === 'attack') {
      return 'linear-gradient(135deg, #2d0000 0%, #570000 100%)';
    } else if (props.cardType === 'skill') {
      return 'linear-gradient(135deg, #001e3c 0%, #003366 100%)';
    } else if (props.cardType === 'power') {
      return 'linear-gradient(135deg, #1a0033 0%, #330066 100%)';
    }
    return '#2c2c2c';
  }};
  border-radius: 12px;
  padding: 1rem;
  width: 250px;
  height: 350px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${props => props.selected ? 'translateY(-8px)' : 'none'};
  
  // Border based on rarity
  border: ${props => {
    switch (props.rarity) {
      case 'rare': return '2px solid #ffd700';
      case 'uncommon': return '2px solid #c0c0c0';
      default: return '1px solid #663300';
    }
  }};
  
  // Shadow effect based on selection and fusion status
  box-shadow: ${props => {
    if (props.selected) {
      switch (props.rarity) {
        case 'rare': return '0 0 20px rgba(255, 215, 0, 0.5)';
        case 'uncommon': return '0 0 15px rgba(192, 192, 192, 0.4)';
        default: return '0 0 10px rgba(102, 51, 0, 0.3)';
      }
    }
    if (props.isFusion) {
      return '0 0 15px rgba(138, 43, 226, 0.4)';
    }
    return 'none';
  }};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => {
      switch (props.rarity) {
        case 'rare': return '0 0 15px rgba(255, 215, 0, 0.4)';
        case 'uncommon': return '0 0 10px rgba(192, 192, 192, 0.3)';
        default: return '0 0 8px rgba(102, 51, 0, 0.2)';
      }
    }};
  }
`;

// Energy cost circle
const EnergyCost = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 40px;
  height: 40px;
  background: #1a1a1a;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #ffd700;
  color: #ffffff;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  z-index: 2;
`;

// Network origin badge
const NetworkBadge = styled.div<{ network: string }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  background: ${props => {
    switch (props.network) {
      case 'ethereum': return '#627eea';
      case 'solana': return '#14f195';
      case 'bitcoin': return '#f7931a';
      case 'fusion': return 'linear-gradient(135deg, #8a2be2 0%, #4b0082 100%)';
      default: return '#333';
    }
  }};
  color: #ffffff;
  letter-spacing: 0.5px;
  z-index: 2;
`;

// Card image
const CardImage = styled.div<{ cardType: string; networkOrigin: string; isFusion: boolean }>`
  width: 100%;
  height: 120px;
  background: ${props => {
    if (props.isFusion) {
      return `url('/assets/images/cards/fusion.png')`;
    }
    return `url('/assets/images/cards/${props.networkOrigin}_${props.cardType}.png')`;
  }};
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 10px;
  margin-top: 1.5rem;
  
  /* Fallback gradient if image is missing */
  background-color: ${props => {
    if (props.isFusion) return '#8a2be2';
    switch (props.cardType) {
      case 'attack': return '#8B0000';
      case 'skill': return '#0057A8';
      case 'power': return '#4B0082';
      default: return '#333';
    }
  }};
`;

// Card title
const CardTitle = styled.h3<{ rarity: string }>`
  font-size: 1.1rem;
  margin: 0.5rem 0;
  text-align: center;
  color: ${props => {
    switch (props.rarity) {
      case 'rare': return '#ffd700';
      case 'uncommon': return '#e0e0e0';
      default: return '#cc9966';
    }
  }};
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
`;

// Card description
const CardDescription = styled.p`
  font-size: 0.85rem;
  color: #cccccc;
  margin-bottom: 0.5rem;
  text-align: center;
  flex-grow: 0;
`;

// Card effects container
const EffectsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 0.5rem;
`;

// Individual effect styles
const Effect = styled.div<{ type: string }>`
  font-size: 0.9rem;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  background: ${props => {
    switch (props.type) {
      case 'damage': return 'rgba(187, 0, 0, 0.7)';
      case 'block': return 'rgba(0, 87, 168, 0.7)';
      case 'draw': return 'rgba(75, 0, 130, 0.7)';
      case 'energy': return 'rgba(218, 165, 32, 0.7)';
      case 'poison': return 'rgba(0, 128, 0, 0.7)';
      case 'heal': return 'rgba(220, 20, 60, 0.7)';
      default: return 'rgba(50, 50, 50, 0.7)';
    }
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Select button that appears on hover
const SelectButton = styled.button<{ visible: boolean }>`
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffd700;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  padding: 5px 15px;
  font-weight: bold;
  cursor: pointer;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
  z-index: 5;
  
  &:hover {
    background: #ffec8b;
  }
`;

// Labels for effect descriptions
const getEffectDescription = (effect: CardEffect): string => {
  switch (effect.type) {
    case 'damage':
      return `Deal ${effect.value} damage to ${effect.target}`;
    case 'block':
      return `Gain ${effect.value} block`;
    case 'draw':
      return `Draw ${effect.value} card${effect.value !== 1 ? 's' : ''}`;
    case 'energy':
      return `Gain ${effect.value} energy`;
    case 'poison':
      return `Apply ${effect.value} poison to ${effect.target}`;
    case 'heal':
      return `Heal ${effect.value} HP`;
    default:
      return `${effect.value} ${effect.type} to ${effect.target}`;
  }
};

export const GameCard: React.FC<CardProps> = ({ 
  card, 
  selected = false, 
  onClick,
  showSelectButton = false
}) => {
  return (
    <CardContainer 
      selected={selected} 
      rarity={card.rarity}
      cardType={card.cardType}
      isFusion={card.isFusion}
      onClick={onClick}
    >
      <EnergyCost>{card.energy}</EnergyCost>
      <NetworkBadge network={card.networkOrigin}>{card.networkOrigin}</NetworkBadge>
      
      <CardImage 
        cardType={card.cardType} 
        networkOrigin={card.networkOrigin}
        isFusion={card.isFusion} 
      />
      
      <CardTitle rarity={card.rarity}>{card.name}</CardTitle>
      <CardDescription>{card.description}</CardDescription>
      
      <EffectsContainer>
        {card.effects.map((effect, index) => (
          <Effect key={index} type={effect.type}>
            <span>{getEffectDescription(effect)}</span>
          </Effect>
        ))}
      </EffectsContainer>
      
      {showSelectButton && (
        <SelectButton visible={selected}>
          Selected
        </SelectButton>
      )}
    </CardContainer>
  );
}; 