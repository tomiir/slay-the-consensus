import { Card, Deck, NetworkType } from '../game/core/types';

// Placeholder card images for each network and type
const getCardImage = (networkOrigin: NetworkType, cardType: string): string => {
  if (networkOrigin === 'fusion') {
    return '/assets/images/cards/fusion.png';
  }
  
  return `/assets/images/cards/${networkOrigin}_${cardType}.png`;
};

// Sample cards for each network
const ethereumCards: Card[] = [
  {
    id: 'eth-strike',
    name: 'Gas Strike',
    description: 'Deal damage based on energy spent.',
    networkOrigin: 'ethereum',
    cardType: 'attack',
    rarity: 'common',
    energy: 1,
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
    isFusion: false,
    image: getCardImage('ethereum', 'attack')
  },
  {
    id: 'eth-defend',
    name: 'Smart Contract',
    description: 'Gain block that scales with card plays.',
    networkOrigin: 'ethereum',
    cardType: 'skill',
    rarity: 'common',
    energy: 1,
    effects: [{ type: 'block', value: 5, target: 'self' }],
    isFusion: false,
    image: getCardImage('ethereum', 'skill')
  },
  {
    id: 'eth-power',
    name: 'EVM Optimizer',
    description: 'Each turn, your first skill costs 0 energy.',
    networkOrigin: 'ethereum',
    cardType: 'power',
    rarity: 'uncommon',
    energy: 2,
    effects: [{ type: 'draw', value: 1, target: 'self' }],
    isFusion: false,
    image: getCardImage('ethereum', 'power')
  },
  {
    id: 'eth-combo',
    name: 'Chain Combo',
    description: 'Deal damage, then draw a card if target has a debuff.',
    networkOrigin: 'ethereum',
    cardType: 'attack',
    rarity: 'uncommon',
    energy: 2,
    effects: [
      { type: 'damage', value: 8, target: 'enemy' },
      { type: 'draw', value: 1, target: 'self' }
    ],
    isFusion: false,
    image: getCardImage('ethereum', 'attack')
  },
  {
    id: 'eth-synergy',
    name: 'Synergy Protocol',
    description: 'Gain block and energy if you played an attack this turn.',
    networkOrigin: 'ethereum',
    cardType: 'skill',
    rarity: 'uncommon',
    energy: 1,
    effects: [
      { type: 'block', value: 6, target: 'self' },
      { type: 'energy', value: 1, target: 'self' }
    ],
    isFusion: false,
    image: getCardImage('ethereum', 'skill')
  }
];

const solanaCards: Card[] = [
  {
    id: 'sol-strike',
    name: 'Proof of History',
    description: 'Deal damage and cycle a card.',
    networkOrigin: 'solana',
    cardType: 'skill',
    rarity: 'common',
    energy: 1,
    effects: [{ type: 'draw', value: 1, target: 'self' }],
    isFusion: false,
    image: getCardImage('solana', 'skill')
  },
  {
    id: 'sol-quick',
    name: 'Fast Consensus',
    description: 'Deal rapid strikes to all enemies.',
    networkOrigin: 'solana',
    cardType: 'attack',
    rarity: 'common',
    energy: 1,
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
    isFusion: false,
    image: getCardImage('solana', 'attack')
  },
  {
    id: 'sol-power',
    name: 'Parallel Processing',
    description: 'Draw 1 additional card each turn.',
    networkOrigin: 'solana',
    cardType: 'power',
    rarity: 'uncommon',
    energy: 2,
    effects: [{ type: 'draw', value: 1, target: 'self' }],
    isFusion: false,
    image: getCardImage('solana', 'power')
  },
  {
    id: 'sol-poison',
    name: 'Slow Drain',
    description: 'Apply poison that deals damage over time.',
    networkOrigin: 'solana',
    cardType: 'skill',
    rarity: 'uncommon',
    energy: 1,
    effects: [{ type: 'poison', value: 3, target: 'enemy' }],
    isFusion: false,
    image: getCardImage('solana', 'skill')
  },
  {
    id: 'sol-rush',
    name: 'Transaction Rush',
    description: 'Deal damage and gain energy on kill.',
    networkOrigin: 'solana',
    cardType: 'attack',
    rarity: 'rare',
    energy: 2,
    effects: [
      { type: 'damage', value: 10, target: 'enemy' },
      { type: 'energy', value: 1, target: 'self' }
    ],
    isFusion: false,
    image: getCardImage('solana', 'attack')
  }
];

const bitcoinCards: Card[] = [
  {
    id: 'btc-strike',
    name: 'Proof of Work',
    description: 'Deal significant damage but costs more energy.',
    networkOrigin: 'bitcoin',
    cardType: 'attack',
    rarity: 'common',
    energy: 2,
    effects: [{ type: 'damage', value: 12, target: 'enemy' }],
    isFusion: false,
    image: getCardImage('bitcoin', 'attack')
  },
  {
    id: 'btc-defend',
    name: 'HODL',
    description: 'Gain substantial block that remains next turn.',
    networkOrigin: 'bitcoin',
    cardType: 'skill',
    rarity: 'common',
    energy: 2,
    effects: [{ type: 'block', value: 10, target: 'self' }],
    isFusion: false,
    image: getCardImage('bitcoin', 'skill')
  },
  {
    id: 'btc-power',
    name: 'Mining Rig',
    description: 'Each turn, gain additional block automatically.',
    networkOrigin: 'bitcoin',
    cardType: 'power',
    rarity: 'uncommon',
    energy: 2,
    effects: [{ type: 'block', value: 3, target: 'self' }],
    isFusion: false,
    image: getCardImage('bitcoin', 'power')
  },
  {
    id: 'btc-heavy',
    name: 'Halving',
    description: 'Deal heavy damage but exhaust.',
    networkOrigin: 'bitcoin',
    cardType: 'attack',
    rarity: 'rare',
    energy: 3,
    effects: [{ type: 'damage', value: 20, target: 'enemy' }],
    isFusion: false,
    image: getCardImage('bitcoin', 'attack')
  },
  {
    id: 'btc-wall',
    name: 'Security Wall',
    description: 'Gain massive block but can\'t attack next turn.',
    networkOrigin: 'bitcoin',
    cardType: 'skill',
    rarity: 'uncommon',
    energy: 2,
    effects: [{ type: 'block', value: 15, target: 'self' }],
    isFusion: false,
    image: getCardImage('bitcoin', 'skill')
  }
];

const networkDecks: Record<string, Deck> = {
  ethereum: {
    id: 'ethereum-deck',
    name: 'Ethereum Deck',
    networkTheme: 'ethereum',
    cards: ethereumCards,
    description: 'A balanced deck focused on synergies between cards and combo mechanics. Better scaling in the late game with powerful interactions.'
  },
  solana: {
    id: 'solana-deck',
    name: 'Solana Deck',
    networkTheme: 'solana',
    cards: solanaCards,
    description: 'A speed-oriented deck with fast attacks and card cycling abilities. Quick to setup but requires careful planning to maximize effectiveness.'
  },
  bitcoin: {
    id: 'bitcoin-deck',
    name: 'Bitcoin Deck',
    networkTheme: 'bitcoin',
    cards: bitcoinCards,
    description: 'A high-value, defensive deck that excels in building up block and launching powerful finishers. Slow but steady with excellent staying power.'
  }
};

const fetchDeckByNetwork = async (networkId: string): Promise<Deck> => {
  // Simulate API call with a small delay
  return new Promise((resolve) => {
    setTimeout(() => {
      if (networkDecks[networkId]) {
        resolve(networkDecks[networkId]);
      } else {
        // Default to ethereum if network not found
        resolve(networkDecks.ethereum);
      }
    }, 500);
  });
};

const fetchAllDecks = async (): Promise<Deck[]> => {
  // Simulate API call with a small delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Object.values(networkDecks));
    }, 500);
  });
};

// Export as default object
const deckService = {
  fetchDeckByNetwork,
  fetchAllDecks
};

export default deckService; 