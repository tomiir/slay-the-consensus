import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`

const NetworkSelection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`

const NetworkButton = styled.button<{ selected?: boolean }>`
  padding: 1rem 2rem;
  background-color: ${props => props.selected ? '#ffd700' : '#2a2a2a'};
  color: ${props => props.selected ? '#1a1a1a' : '#ffffff'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.selected ? '#ffd700' : '#3a3a3a'};
  }
`

const Game = () => {
  const { authenticated } = usePrivy()
  const navigate = useNavigate()
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')

  useEffect(() => {
    if (!authenticated) {
      navigate('/')
    }
  }, [authenticated, navigate])

  return (
    <GameContainer>
      <h1>Choose Your Network Deck</h1>
      <NetworkSelection>
        <NetworkButton 
          selected={selectedNetwork === 'ethereum'}
          onClick={() => setSelectedNetwork('ethereum')}
        >
          Ethereum
        </NetworkButton>
        <NetworkButton 
          selected={selectedNetwork === 'solana'}
          onClick={() => setSelectedNetwork('solana')}
        >
          Solana
        </NetworkButton>
        <NetworkButton 
          selected={selectedNetwork === 'bitcoin'}
          onClick={() => setSelectedNetwork('bitcoin')}
        >
          Bitcoin
        </NetworkButton>
      </NetworkSelection>
    </GameContainer>
  )
}

export default Game 