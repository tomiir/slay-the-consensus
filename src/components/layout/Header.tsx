import { Link } from 'react-router-dom'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2a2a2a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
  text-decoration: none;
  
  &:hover {
    color: #ffed4a;
  }
`

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`

const NavLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #ffd700;
  }
`

function Header() {
  return (
    <HeaderContainer>
      <Logo to="/">Crypto Spire</Logo>
      <Nav>
        <NavLink to="/game">Play</NavLink>
        <NavLink to="/collection">Collection</NavLink>
        <appkit-button />
      </Nav>
    </HeaderContainer>
  )
}

export default Header 