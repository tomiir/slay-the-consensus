import { Enemy, GameMap, MapNode, NodeType } from './types';
import { v4 as uuidv4 } from 'uuid';

// Enemies data for the game
export const enemyData: Record<string, Enemy> = {
  'minion': {
    id: 'minion',
    name: 'Crypto Minion',
    health: 15,
    maxHealth: 15,
    attacks: [
      { name: 'Byte Strike', damage: 5 },
      { name: 'Hash Attack', damage: 3 }
    ],
    goldReward: 10
  },
  'troll': {
    id: 'troll',
    name: 'Blockchain Troll',
    health: 25,
    maxHealth: 25,
    attacks: [
      { name: 'Token Slash', damage: 8 },
      { name: 'FUD Spread', damage: 4, effects: [{ type: 'poison', value: 2 }] }
    ],
    goldReward: 15
  },
  'ghost': {
    id: 'ghost',
    name: 'Data Ghost',
    health: 20,
    maxHealth: 20,
    attacks: [
      { name: 'Memory Leak', damage: 6 },
      { name: 'Corrupt Data', damage: 3, effects: [{ type: 'debuff', value: 1 }] }
    ],
    goldReward: 12
  },
  'elite_miner': {
    id: 'elite_miner',
    name: 'Elite Miner',
    health: 40,
    maxHealth: 40,
    attacks: [
      { name: 'Mining Rig Smash', damage: 12 },
      { name: 'Hash Power', damage: 8, effects: [{ type: 'buff', value: 2 }] }
    ],
    goldReward: 25
  },
  'elite_hacker': {
    id: 'elite_hacker',
    name: 'Elite Hacker',
    health: 35,
    maxHealth: 35,
    attacks: [
      { name: 'Double Spend Attack', damage: 10, effects: [{ type: 'poison', value: 3 }] },
      { name: 'Code Injection', damage: 7, effects: [{ type: 'debuff', value: 2 }] }
    ],
    goldReward: 30
  },
  'boss_cryptolord': {
    id: 'boss_cryptolord',
    name: 'The Crypto Lord',
    health: 75,
    maxHealth: 75,
    attacks: [
      { name: 'Market Crash', damage: 15 },
      { name: 'Rugpull', damage: 12, effects: [{ type: 'poison', value: 5 }] },
      { name: 'Diamond Hands', damage: 0, effects: [{ type: 'buff', value: 4 }] }
    ],
    goldReward: 100
  }
};

// Constants for map generation
const MAP_HEIGHT = 6; // Number of floors
const MIN_NODES_PER_FLOOR = 2;
const MAX_NODES_PER_FLOOR = 4;
const REST_FLOOR_INTERVALS = [2, 4]; // Floors that should have rest nodes
const CONNECTION_PROBABILITY = 0.7; // Probability of connecting to nodes on the next floor

/**
 * Generates a random game map with branching paths
 */
export function generateMap(): GameMap {
  const nodes: Record<string, MapNode> = {};
  let floorNodes: MapNode[][] = [];
  
  // Generate nodes for each floor
  for (let floor = 0; floor < MAP_HEIGHT; floor++) {
    const isRestFloor = REST_FLOOR_INTERVALS.includes(floor);
    const isBossFloor = floor === MAP_HEIGHT - 1;
    
    // Determine number of nodes on this floor
    let nodesCount = 1; // Boss floor or rest floor before boss has only one node
    
    if (!isBossFloor && !(isRestFloor && floor === MAP_HEIGHT - 2)) {
      nodesCount = Math.floor(
        Math.random() * (MAX_NODES_PER_FLOOR - MIN_NODES_PER_FLOOR + 1) + MIN_NODES_PER_FLOOR
      );
    }
    
    const floorNodesArray: MapNode[] = [];
    
    // Create nodes for this floor
    for (let i = 0; i < nodesCount; i++) {
      const nodeId = uuidv4();
      let nodeType: NodeType = 'enemy';
      let enemyId: string | undefined = undefined;
      
      // Assign node type based on floor
      if (isBossFloor) {
        nodeType = 'boss';
        enemyId = 'boss_cryptolord';
      } else if (isRestFloor) {
        nodeType = 'rest';
      } else {
        // 70% chance for regular enemy, 30% for elite on normal floors
        nodeType = Math.random() < 0.7 ? 'enemy' : 'elite';
        
        // Assign random enemy based on type
        if (nodeType === 'enemy') {
          const regularEnemies = ['minion', 'troll', 'ghost'];
          enemyId = regularEnemies[Math.floor(Math.random() * regularEnemies.length)];
        } else {
          const eliteEnemies = ['elite_miner', 'elite_hacker'];
          enemyId = eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
        }
      }
      
      // Create the node
      const node: MapNode = {
        id: nodeId,
        type: nodeType,
        x: (i + 1) * (1 / (nodesCount + 1)), // Distribute nodes evenly horizontally
        y: floor / (MAP_HEIGHT - 1), // Distribute nodes evenly vertically
        enemyId,
        children: [],
        completed: false,
        visited: false
      };
      
      nodes[nodeId] = node;
      floorNodesArray.push(node);
    }
    
    floorNodes.push(floorNodesArray);
  }
  
  // Connect nodes between floors
  for (let floor = 0; floor < MAP_HEIGHT - 1; floor++) {
    const currentFloorNodes = floorNodes[floor];
    const nextFloorNodes = floorNodes[floor + 1];
    
    // Rest floors (except the last one) should connect to all nodes on the next floor
    const isRestFloor = REST_FLOOR_INTERVALS.includes(floor);
    const isPreBossFloor = floor === MAP_HEIGHT - 2;
    
    // Special case for the pre-boss floor
    if (isPreBossFloor) {
      // All nodes on the pre-boss floor connect to the boss
      for (const node of currentFloorNodes) {
        node.children.push(nextFloorNodes[0].id);
      }
      continue;
    }
    
    // For regular floors, create connections with the next floor
    for (const currentNode of currentFloorNodes) {
      let hasConnection = false;
      
      for (const nextNode of nextFloorNodes) {
        // Connect with a certain probability, ensure every node has at least one connection
        if (isRestFloor || Math.random() < CONNECTION_PROBABILITY || !hasConnection) {
          currentNode.children.push(nextNode.id);
          hasConnection = true;
        }
      }
      
      // Ensure at least one connection if none were created
      if (!hasConnection && nextFloorNodes.length > 0) {
        const randomNextNode = nextFloorNodes[Math.floor(Math.random() * nextFloorNodes.length)];
        currentNode.children.push(randomNextNode.id);
      }
    }
  }
  
  // Set the start node (first node on the first floor)
  const startNodeId = floorNodes[0][0].id;
  nodes[startNodeId].visited = true;
  
  // Set the boss node (only node on the last floor)
  const bossNodeId = floorNodes[MAP_HEIGHT - 1][0].id;
  
  return {
    nodes,
    startNodeId,
    bossNodeId,
    currentNodeId: startNodeId
  };
}

/**
 * Function to handle node selection (moving to a new node)
 */
export function selectNode(map: GameMap, nodeId: string): GameMap {
  const updatedMap = { ...map };
  
  // Update the current node
  if (updatedMap.currentNodeId) {
    updatedMap.nodes[updatedMap.currentNodeId].completed = true;
  }
  
  // Set the new current node
  updatedMap.currentNodeId = nodeId;
  updatedMap.nodes[nodeId].visited = true;
  
  return updatedMap;
}

/**
 * Get available nodes that can be selected from the current position
 */
export function getAvailableNodes(map: GameMap): MapNode[] {
  if (!map.currentNodeId) return [];
  
  const currentNode = map.nodes[map.currentNodeId];
  return currentNode.children.map(childId => map.nodes[childId]);
}

/**
 * Function to heal the player at a rest site
 */
export function restSiteHeal(player: { health: number, maxHealth: number }): { health: number, maxHealth: number } {
  // Heal 30% of max health
  const healAmount = Math.floor(player.maxHealth * 0.3);
  const newHealth = Math.min(player.health + healAmount, player.maxHealth);
  
  return {
    ...player,
    health: newHealth
  };
} 