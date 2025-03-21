import { useEffect } from 'react'
import styled from 'styled-components'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'

const CollectionContainer = styled.div`
  padding: 2rem;
`

const Title = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  padding: 1rem;
`

const Card = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`

const CardImage = styled.div`
  width: 150px;
  height: 200px;
  background-color: #3a3a3a;
  border-radius: 4px;
  margin-bottom: 1rem;
`

const CardName = styled.h3`
  margin: 0;
  color: #ffd700;
`

const Collection = () => {
  const { authenticated } = usePrivy()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authenticated) {
      navigate('/')
    }
  }, [authenticated, navigate])

  // Placeholder data - will be replaced with actual NFT data
  const placeholderCards = Array(6).fill({
    name: 'Fusion Card',
    image: '',
  })

  return (
    <CollectionContainer>
      <Title>Your Card Collection</Title>
      <CardGrid>
        {placeholderCards.map((card, index) => (
          <Card key={index}>
            <CardImage />
            <CardName>{card.name} #{index + 1}</CardName>
          </Card>
        ))}
      </CardGrid>
    </CollectionContainer>
  )
}

export default Collection 