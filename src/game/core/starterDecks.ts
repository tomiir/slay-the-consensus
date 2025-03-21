import { Card, Deck, NetworkType } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create cards
const createCard = (
  name: string,
  networkOrigin: NetworkType,
  cardType: Card['cardType'],
  rarity: Card['rarity'],
  energy: number,
  effects: Card['effects'],
  description: string
): Card => ({
  id: uuidv4(),
  name,
  description,
  networkOrigin,
  cardType,
  rarity,
  energy,
  effects,
  isFusion: false
});

// Basic cards that every deck gets
const createBasicCards = (network: NetworkType): Card[] => [
  // 3 copies of Attack
  ...Array(3).fill(null).map(() => createCard(
    'Attack',
    network,
    'attack',
    'common',
    1,
    [{ type: 'damage', value: 5, target: 'enemy' }],
    'Deal 5 damage.'
  )),
  // 3 copies of Defend
  ...Array(3).fill(null).map(() => createCard(
    'Defend',
    network,
    'skill',
    'common',
    1,
    [{ type: 'block', value: 4, target: 'self' }],
    'Gain 4 Block.'
  ))
];

// Ethereum Deck - Focus on combo/synergy mechanics
const ethereumStarterCards: Card[] = [
  ...createBasicCards('ethereum'),
  createCard(
    'Smart Contract',
    'ethereum',
    'attack',
    'common',
    2,
    [{ type: 'damage', value: 8, target: 'enemy' }],
    'Deal 8 damage.'
  ),
  createCard(
    'Gas Optimization',
    'ethereum',
    'skill',
    'common',
    1,
    [{ type: 'energy', value: 1, target: 'self' }],
    'Gain 1 energy.'
  ),
  createCard(
    'Chain Link',
    'ethereum',
    'skill',
    'common',
    1,
    [{ type: 'draw', value: 2, target: 'self' }],
    'Draw 2 cards.'
  )
];

// Solana Deck - Focus on speed and poison mechanics
const solanaStarterCards: Card[] = [
  ...createBasicCards('solana'),
  createCard(
    'Swift Strike',
    'solana',
    'attack',
    'common',
    0,
    [{ type: 'damage', value: 3, target: 'enemy' }],
    'Deal 3 damage.'
  ),
  createCard(
    'Proof of History',
    'solana',
    'skill',
    'common',
    1,
    [{ type: 'poison', value: 3, target: 'enemy' }],
    'Apply 3 poison.'
  ),
  createCard(
    'Parallel Processing',
    'solana',
    'power',
    'uncommon',
    2,
    [
      { type: 'draw', value: 1, target: 'self' },
      { type: 'energy', value: 1, target: 'self' }
    ],
    'Draw 1 card and gain 1 energy.'
  )
];

// Bitcoin Deck - Focus on high defense and steady damage
const bitcoinStarterCards: Card[] = [
  ...createBasicCards('bitcoin'),
  createCard(
    'Proof of Work',
    'bitcoin',
    'skill',
    'common',
    2,
    [{ type: 'block', value: 8, target: 'self' }],
    'Gain 8 Block.'
  ),
  createCard(
    'Hash Power',
    'bitcoin',
    'attack',
    'common',
    1,
    [{ type: 'damage', value: 6, target: 'enemy' }],
    'Deal 6 damage.'
  ),
  createCard(
    'HODL',
    'bitcoin',
    'power',
    'uncommon',
    1,
    [{ type: 'block', value: 3, target: 'self' }],
    'Gain 3 Block at the start of your turn.'
  )
];

export const starterDecks: Record<NetworkType, Deck> = {
  ethereum: {
    id: 'ethereum-starter',
    name: 'Ethereum Builder',
    networkTheme: 'ethereum',
    cards: ethereumStarterCards,
    description: 'A versatile deck focused on card synergies and combo potential.'
  },
  solana: {
    id: 'solana-starter',
    name: 'Solana Speedrunner',
    networkTheme: 'solana',
    cards: solanaStarterCards,
    description: 'A fast-paced deck with poison mechanics and quick attacks.'
  },
  bitcoin: {
    id: 'bitcoin-starter',
    name: 'Bitcoin Miner',
    networkTheme: 'bitcoin',
    cards: bitcoinStarterCards,
    description: 'A defensive deck with steady, reliable damage output.'
  },
  fusion: {
    id: 'fusion-deck',
    name: 'Fusion Collection',
    networkTheme: 'fusion',
    cards: [], // Fusion cards are earned through gameplay
    description: 'Your collection of fusion cards from successful runs.'
  }
}; 