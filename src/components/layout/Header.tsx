import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2a2a2a;
`

const Logo = styled.h1`
  margin: 0;
  color: #ffffff;
  font-size: 1.5rem;
`

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`

const NavLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  &:hover {
    color: #ffd700;
  }
`

const LoginButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #ffd700;
  color: #1a1a1a;
  border-radius: 4px;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`

const Header = () => {
  const { login, authenticated, logout } = usePrivy()

  return (
    <HeaderContainer>
      <Logo>Crypto Spire</Logo>
      <Nav>
        <NavLink to="/">Home</NavLink>
        {authenticated && (
          <>
            <NavLink to="/game">Play</NavLink>
            <NavLink to="/collection">Collection</NavLink>
            <LoginButton onClick={logout}>Disconnect</LoginButton>
          </>
        )}
        {!authenticated && (
          <LoginButton onClick={login}>Connect</LoginButton>
        )}
      </Nav>
    </HeaderContainer>
  )
}

export default Header 