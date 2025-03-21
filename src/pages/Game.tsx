import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import '@reown/appkit-ui/jsx'

const GameContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`

const Title = styled.h1`
  color: #ffd700;
  margin-bottom: 2rem;
  text-align: center;
`

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: #2a2a2a;
  border-radius: 8px;
  margin-top: 2rem;
`

const ConnectMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`

function Game() {
  return (
    <GameContainer>
      <Title>Crypto Spire</Title>
      <ConnectPrompt>
        <ConnectMessage>Connect your wallet to start playing</ConnectMessage>
        <appkit-button />
      </ConnectPrompt>
    </GameContainer>
  )
}

export default Game 