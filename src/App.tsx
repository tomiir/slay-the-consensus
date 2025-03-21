import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { solana, polygon, bitcoin } from '@reown/appkit/networks'
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import styled from 'styled-components'
import '@reown/appkit-ui/jsx'

// Components
import Header from '@components/layout/Header'
import GlobalStyles from '@styles/GlobalStyles'

// Pages
import Home from '@pages/Home'
import Game from '@pages/Game'
import Collection from '@pages/Collection'

// Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// Create the Wagmi adapter
const ethersAdapter = new EthersAdapter()

const bitcoinAdapter = new BitcoinAdapter({
  projectId,
  networks: [bitcoin]
})

// Create Solana adapter
const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter() as any, new SolflareWalletAdapter() as any]
})

// Set up the metadata
const metadata = {
  name: 'Crypto Spire',
  description: 'A roguelike deck-building game with blockchain integration',
  url: window.location.origin,
  icons: ['https://your-icon-url.com'] // Replace with your game's icon
}

// Create the AppKit instance
createAppKit({
  adapters: [ethersAdapter, solanaAdapter, bitcoinAdapter],
  networks: [polygon, solana, bitcoin],
  metadata,
  projectId,
  features: {
    analytics: true,
  }
})

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`

function App() {
  return (
    <>
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
    </>
  )
}

export default App 