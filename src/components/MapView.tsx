import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GameMap, MapNode } from '../game/core/types';
import { getAvailableNodes } from '../game/core/mapGenerator';

// Map Container
const MapContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #0d1b2a, #1b263b);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const MapTitle = styled.h1`
  font-size: 2.5rem;
  color: #e0e1dd;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

// Map canvas to display the nodes and paths
const MapCanvas = styled.div`
  width: 90%;
  height: 70vh;
  position: relative;
  margin-bottom: 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

// Paths between nodes
const Path = styled.div<{ x1: number; y1: number; x2: number; y2: number; active: boolean }>`
  position: absolute;
  width: ${props => Math.sqrt(
    Math.pow((props.x2 - props.x1) * 100, 2) + 
    Math.pow((props.y2 - props.y1) * 100, 2)
  )}%;
  height: 4px;
  background: ${props => props.active ? 'linear-gradient(to right, #4caf50, #80e27e)' : '#415a77'};
  transform-origin: 0 0;
  transform: rotate(${props => 
    Math.atan2((props.y2 - props.y1) * 100, (props.x2 - props.x1) * 100) * 180 / Math.PI
  }deg);
  top: ${props => props.y1 * 100}%;
  left: ${props => props.x1 * 100}%;
  opacity: ${props => props.active ? 1 : 0.5};
  transition: all 0.3s ease;
  z-index: 1;
`;

// Node types
const nodeColors = {
  enemy: '#ff6347',
  elite: '#9c27b0',
  rest: '#4caf50',
  boss: '#ffd700'
};

const nodeIcons = {
  enemy: '⚔️',
  elite: '👑',
  rest: '🏕️',
  boss: '💀'
};

const NodeCircle = styled.div<{ 
  type: string; 
  x: number; 
  y: number; 
  available: boolean; 
  visited: boolean;
  completed: boolean;
}>`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.completed ? '#333' : nodeColors[props.type as keyof typeof nodeColors]};
  border: 3px solid ${props => props.visited ? '#fff' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transform: translate(-50%, -50%);
  top: ${props => props.y * 100}%;
  left: ${props => props.x * 100}%;
  cursor: ${props => props.available ? 'pointer' : 'default'};
  opacity: ${props => (props.visited || props.available) ? 1 : 0.6};
  transition: all 0.3s ease;
  box-shadow: ${props => props.visited ? '0 0 15px rgba(255, 255, 255, 0.5)' : 'none'};
  z-index: 2;
  
  &:hover {
    transform: ${props => props.available ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)'};
    box-shadow: ${props => props.available ? '0 0 20px rgba(255, 255, 255, 0.7)' : 'none'};
  }
  
  &:after {
    content: '${props => props.completed ? '✓' : nodeIcons[props.type as keyof typeof nodeIcons]}';
    position: absolute;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e0e1dd;
  font-size: 0.9rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const NodeInfoPanel = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(13, 27, 42, 0.8);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #e0e1dd;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const NodeTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #fff;
`;

const NodeDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.9;
`;

const ActionButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

// Component props
interface MapViewProps {
  map: GameMap;
  onNodeSelect: (nodeId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ map, onNodeSelect }) => {
  const [availableNodes, setAvailableNodes] = useState<MapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  
  useEffect(() => {
    // Find available nodes that can be selected
    setAvailableNodes(getAvailableNodes(map));
  }, [map]);
  
  const handleNodeClick = (node: MapNode) => {
    // Check if the node is available for selection
    if (availableNodes.find(n => n.id === node.id)) {
      setSelectedNode(node);
    }
  };
  
  const handleConfirmSelection = () => {
    if (selectedNode) {
      onNodeSelect(selectedNode.id);
      setSelectedNode(null);
    }
  };
  
  const getNodeDescription = (node: MapNode): string => {
    switch(node.type) {
      case 'enemy':
        return 'Battle a common enemy. Defeat it to earn gold and progress.';
      case 'elite':
        return 'A challenging elite enemy awaits. Higher risk but greater reward.';
      case 'rest':
        return 'A safe place to rest and recover. Heal 30% of your max health.';
      case 'boss':
        return 'The final challenge. Defeat the boss to complete your journey.';
      default:
        return '';
    }
  };
  
  return (
    <MapContainer>
      <MapTitle>Crypto Spire</MapTitle>
      
      <Legend>
        <LegendItem>
          <LegendColor color={nodeColors.enemy} />
          <span>Enemy</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color={nodeColors.elite} />
          <span>Elite</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color={nodeColors.rest} />
          <span>Rest Site</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color={nodeColors.boss} />
          <span>Boss</span>
        </LegendItem>
      </Legend>
      
      <MapCanvas>
        {/* Draw paths between nodes */}
        {Object.values(map.nodes).map(node => 
          node.children.map(childId => {
            const childNode = map.nodes[childId];
            const isActivePath = 
              (node.visited || node.id === map.currentNodeId) && 
              (childNode.visited || availableNodes.some(n => n.id === childId));
            
            return (
              <Path 
                key={`${node.id}-${childId}`}
                x1={node.x}
                y1={node.y}
                x2={childNode.x}
                y2={childNode.y}
                active={isActivePath}
              />
            );
          })
        )}
        
        {/* Draw the nodes */}
        {Object.values(map.nodes).map(node => (
          <NodeCircle
            key={node.id}
            type={node.type}
            x={node.x}
            y={node.y}
            available={availableNodes.some(n => n.id === node.id)}
            visited={node.visited || node.id === map.currentNodeId}
            completed={node.completed}
            onClick={() => handleNodeClick(node)}
          />
        ))}
      </MapCanvas>
      
      {/* Node info panel */}
      {selectedNode && (
        <NodeInfoPanel>
          <NodeTitle>
            {selectedNode.type === 'enemy' || selectedNode.type === 'elite' || selectedNode.type === 'boss' 
              ? map.nodes[selectedNode.id].enemyId?.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') 
              : selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
          </NodeTitle>
          <NodeDescription>{getNodeDescription(selectedNode)}</NodeDescription>
          <ActionButton onClick={handleConfirmSelection}>
            Continue to {selectedNode.type}
          </ActionButton>
        </NodeInfoPanel>
      )}
    </MapContainer>
  );
}; 