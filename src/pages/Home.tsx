import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
  text-align: center;
`

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffd700;
`

const Description = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin-bottom: 2rem;
`

const PlayButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #ffd700;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`

const Home = () => {
  const navigate = useNavigate()

  return (
    <HomeContainer>
      <Title>Welcome to Crypto Spire</Title>
      <Description>
        A roguelike deck-building game where your achievements become permanent NFTs.
        Connect your wallet, choose your network deck, and begin your ascent through the Spire.
      </Description>
      <PlayButton onClick={() => navigate('/game')}>
        Start Your Journey
      </PlayButton>
    </HomeContainer>
  )
}

export default Home 