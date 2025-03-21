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

// Map and Node types
export type NodeType = 'enemy' | 'elite' | 'rest' | 'boss';

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attacks: {
    name: string;
    damage: number;
    effects?: {
      type: string;
      value: number;
    }[];
  }[];
  image?: string;
  goldReward: number; // Gold earned when defeating this enemy
}

export interface MapNode {
  id: string;
  type: NodeType;
  x: number; // Position for rendering
  y: number;
  enemyId?: string; // Reference to enemy data if type is 'enemy' or 'elite' or 'boss'
  children: string[]; // IDs of connected nodes (possible paths forward)
  completed: boolean;
  visited: boolean;
}

export interface GameMap {
  nodes: Record<string, MapNode>;
  startNodeId: string;
  bossNodeId: string;
  currentNodeId: string | null;
}

export interface GameProgress {
  map: GameMap;
  player: Character;
  deck: Card[];
  gold: number;
  completedBattles: number;
} 