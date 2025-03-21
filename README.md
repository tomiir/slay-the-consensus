# Slay the Consensus

A blockchain-based card game where players battle monsters using NFT cards from different blockchain networks.

## Features

- Select a deck from different blockchain networks (Ethereum, Solana, Bitcoin)
- View and use NFT cards from previous runs
- Battle monsters and earn rewards
- Mint new NFT cards by fusing existing ones

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask or another Web3 wallet

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/slay-the-consensus.git
cd slay-the-consensus
```

2. Install dependencies:
```bash
npm install
```

3. Set up the local blockchain and deploy the contract:
```bash
npm run setup:local
```

This will:
- Start a local Hardhat network
- Deploy the FusionCardNFT contract
- Update the .env file with the contract address

4. Start the development server:
```bash
npm run dev
```

## Game Flow

1. Connect your wallet
2. Select a starter deck from your preferred network
3. View your NFT cards from previous runs
4. Replace up to 3 cards from your starter deck with NFT cards
5. Start the battle
6. Win battles to earn new NFT cards
7. Fuse cards to create more powerful combinations

## Development

- `npm run compile` - Compile the smart contracts
- `npm run test` - Run the test suite
- `npm run deploy:local` - Deploy contracts to local network
- `npm run node` - Start a local Hardhat network

## Contract Addresses

- Local Network: Check the .env file after running `npm run setup:local`
- Testnet: TBD
- Mainnet: TBD

## License

MIT
