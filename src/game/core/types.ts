export type NetworkType = 'ethereum' | 'solana' | 'bitcoin' | 'fusion';
export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'common' | 'uncommon' | 'rare';
export type EffectType = 'damage' | 'block' | 'draw' | 'energy' | 'poison' | 'heal';
export type EffectTarget = 'enemy' | 'self' | 'all';

export interface CardEffect {
  type: EffectType;
  value: number;
  target: EffectTarget;
}

export interface Card {
  id: string;
  name: string;
  description: string;
  networkOrigin: NetworkType;
  cardType: CardType;
  rarity: CardRarity;
  energy: number;
  effects: CardEffect[];
  image?: string;
  isFusion: boolean;
  parentCards?: string[]; // IDs of cards used in fusion
  tokenId?: string; // NFT token ID if this is a fusion card
}

export interface Deck {
  id: string;
  name: string;
  networkTheme: NetworkType;
  cards: Card[];
  description: string;
}

export interface Character {
  health: number;
  maxHealth: number;
  block: number;
  energy: number;
  maxEnergy: number;
  effects: {
    poison?: number;
    // Add other status effects as needed
  };
}

export interface GameState {
  player: Character;
  enemy: Character;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  drawPile: Card[];
  turn: number;
  enemyIntent?: {
    type: 'attack' | 'defend' | 'buff' | 'debuff';
    value: number;
  };
}

export interface BattleResult {
  victory: boolean;
  turnsPlayed: number;
  damageDealt: number;
  damageTaken: number;
  cardsPlayed: number;
  potentialFusionCards?: [Card, Card]; // Cards eligible for fusion after victory
} 