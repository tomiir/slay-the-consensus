import styled from 'styled-components'
import '@reown/appkit-ui/jsx'

const CollectionContainer = styled.div`
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

function Collection() {
  return (
    <CollectionContainer>
      <Title>Your Card Collection</Title>
      <ConnectPrompt>
        <ConnectMessage>Connect your wallet to view your collection</ConnectMessage>
        <appkit-button />
      </ConnectPrompt>
    </CollectionContainer>
  )
}

export default Collection 