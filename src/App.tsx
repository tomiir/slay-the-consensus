import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import styled from 'styled-components'

// Components
import Header from '@components/layout/Header'
import GlobalStyles from '@styles/GlobalStyles'

// Pages
import Home from '@pages/Home'
import Game from '@pages/Game'
import Collection from '@pages/Collection'

// Privy app ID - Replace with your app ID
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'YOUR_PRIVY_APP_ID'

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`

function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#ffd700',
        },
      }}
    >
      <GlobalStyles />
      <AppContainer>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/collection" element={<Collection />} />
          </Routes>
        </Router>
      </AppContainer>
    </PrivyProvider>
  )
}

export default App 