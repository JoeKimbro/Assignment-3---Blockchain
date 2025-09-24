# Assignment-3---Blockchain
# Campus Credit Token Project

## Team Information
- **Team**: 07
- **RPC URL**: `https://hh-07.didlab.org`
- **Chain ID**: `31343`
- **Token Address**: `[TO_BE_FILLED_AFTER_DEPLOYMENT]`

## Prerequisites

- Node.js v22.x LTS
- npm
- Hardhat v3
- MetaMask browser extension

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment template:
   ```bash
   cp .env.example .env
   ```

4. Fill in your `.env` file with actual values (see `.env.example` for required keys)

## Project Structure

```
├── contracts/
│   └── CampusCreditV2.sol    # Main ERC-20 token contract
├── scripts/
│   ├── deploy.ts             # Contract deployment
│   ├── transfer-approve.ts   # Transfer and approval testing
│   ├── airdrop.ts           # Batch airdrop gas comparison
│   └── logs-query.ts        # Event log querying
├── hardhat.config.ts        # Hardhat configuration
├── .env.example             # Environment template
└── README.md               # This file
```

## Contract Features

- **ERC-20 Token** with standard transfer/approval functionality
- **Burnable**: Token holders can burn their tokens
- **Pausable**: Admin can pause/unpause all transfers
- **Capped**: Maximum supply enforced at mint time
- **Role-based Access Control**:
  - `DEFAULT_ADMIN_ROLE`: Can manage other roles
  - `MINTER_ROLE`: Can mint tokens and execute airdrops
  - `PAUSER_ROLE`: Can pause/unpause transfers
- **Batch Airdrop**: Gas-optimized multi-recipient token distribution
- **Custom Errors**: `ArrayLengthMismatch`, `CapExceeded`

## How to Run Scripts

### 1. Deploy Contract
```bash
npx hardhat run scripts/deploy.ts --network didlab
```
**Expected Output**:
- Deploy transaction hash
- Deployed contract address
- Block number

**Action Required**: Copy the deployed contract address and add it to your `.env` file as `TOKEN_ADDRESS`

### 2. Test Transfers and Approvals
```bash
npx hardhat run scripts/transfer-approve.ts --network didlab
```
**What it does**:
- Shows token balances before/after operations
- Executes a token transfer
- Sets an approval allowance
- Displays transaction hashes, block numbers, and gas usage

### 3. Compare Batch vs Individual Operations
```bash
npx hardhat run scripts/airdrop.ts --network didlab
```
**What it does**:
- Performs batch airdrop to multiple recipients
- Performs equivalent individual transfers
- Compares gas usage and calculates percentage saved

### 4. Query Transaction Events
```bash
npx hardhat run scripts/logs-query.ts --network didlab
```
**What it does**:
- Queries recent Transfer and Approval events (last ~2000 blocks)
- Displays block numbers and event arguments (from, to, value)

## Network Configuration

The project is configured for DIDLab Team 07:
- **Network Name**: `didlab`
- **RPC URL**: `https://hh-07.didlab.org`
- **Chain ID**: `31343`
- **Gas Configuration**: EIP-1559 (Priority Fee + Max Fee)

## MetaMask Setup

1. **Add Custom Network**:
   - Network Name: `DIDLab Team 07`
   - RPC URL: `https://hh-07.didlab.org`
   - Chain ID: `31343`
   - Currency Symbol: `ETH`

2. **Import Account**: Use the private key from your `.env` file

3. **Import Token**: Use the `TOKEN_ADDRESS` from deployment

## Troubleshooting

**Network Issues**: If DIDLab network is unavailable, you can test locally:
```bash
# Terminal 1: Start local network
npx hardhat node

# Terminal 2: Deploy to localhost
npx hardhat run scripts/deploy.ts --network localhost
```

**Gas Estimation Errors**: The scripts use conservative gas settings. Adjust `maxFeePerGas` and `maxPriorityFeePerGas` if needed.

**Environment Variables**: Ensure all required variables in `.env` are set. Never commit your actual `.env` file with private keys.

## Security Notes

- The `PRIVATE_KEY` in `.env` should only be a test/faucet key, never a real wallet
- All admin functions are properly role-gated
- Contract enforces supply cap and pause functionality
- Custom errors provide gas-efficient revert reasons

## Development

To compile contracts:
```bash
npx hardhat compile
```

To run tests (if created):
```bash
npx hardhat test
```

## Screenshots

<img width="1321" height="824" alt="5" src="https://github.com/user-attachments/assets/635386ec-a151-4913-acb1-3c3ac69ff94d" />
<img width="1306" height="822" alt="4" src="https://github.com/user-attachments/assets/028538da-7cbb-47f1-85c7-4a129150f187" />
<img width="1347" height="844" alt="3" src="https://github.com/user-attachments/assets/92979f8c-d22a-4144-a62c-1617fd34441d" />
<img width="1281" height="807" alt="2" src="https://github.com/user-attachments/assets/99a74e31-74d3-4973-9859-b91da1b5b66c" />
<img width="1006" height="291" alt="1" src="https://github.com/user-attachments/assets/9e64cec4-b30d-4d25-ae41-9099b86e3ccb" />
