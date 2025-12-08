# FHEalth Score

**Privacy-preserving health risk assessment using Fully Homomorphic Encryption.**

Your health data is encrypted in-browser, computed on-chain using FHE, and only you can decrypt the results.

## Why FHE?

Health data is extremely sensitive. Traditional solutions require trusting a server with your plaintext data. With FHE:

- **Zero plaintext exposure** — Data is encrypted before leaving your browser
- **On-chain computation** — Risk scoring happens entirely on ciphertexts
- **User-only decryption** — Only you can see your health assessment results

## Features

- 🔐 **6-Factor Risk Analysis** — Age, BMI, Blood Pressure, Glucose, Activity, Smoking
- ⛓️ **100% On-Chain FHE** — All computations on encrypted data using Zama FHEVM
- 🎯 **5-Level Risk Classification** — Low, Guarded, Medium, High, Critical
- 🔑 **User Decrypt** — EIP-712 signed decryption, only authorized users can decrypt
- 🎨 **Modern UI** — Next.js + Chakra UI with real-time status feedback

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | Solidity 0.8.24 + Zama FHEVM |
| Frontend | Next.js 15 + TypeScript |
| UI | Chakra UI |
| Wallet | RainbowKit + Wagmi |
| FHE SDK | Zama RelayerSDK (CDN) |
| Network | Ethereum Sepolia |

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd fhealth-score

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 and connect your wallet.

## Contract

| Item | Value |
|------|-------|
| Network | Ethereum Sepolia |
| Address | `0xf93A43a306bcF410050DC584E4ccF3fB6f07e2f2` |
| Etherscan | [Verified Contract](https://sepolia.etherscan.io/address/0xf93A43a306bcF410050DC584E4ccF3fB6f07e2f2#code) |

## Tests

```bash
cd contracts
npm install
npm test
```

```
  FHEalthScore
    Deployment
      ✔ Should deploy successfully with valid address
      ✔ Should have no assessment for any user initially
      ✔ Should return 0 for assessment count initially
      ✔ Should return 0 timestamp initially
    Access Control
      ✔ Should revert getRiskLevel when no assessment exists
      ✔ Should revert getTotalScore when no assessment exists
      ✔ Should allow getAssessmentTimestamp even without assessment
      ✔ Should allow hasAssessment check without assessment
      ✔ Should allow assessmentCount check for any address
    View Functions - Zero State
      ✔ Should return zero handles for all factor getters
      ✔ Should return different zero handles for different users
    Contract Interface
      ✔ Should have submitAssessment with correct parameter count
      ✔ Should have correct parameter types for submitAssessment
      ✔ Should have all 6 factor getter functions
      ✔ Should have result getter functions
      ✔ Should have utility functions
      ✔ Should have AssessmentSubmitted event with correct parameters
    State Isolation
      ✔ Should isolate hasAssessment between users
      ✔ Should isolate assessmentCount between users
      ✔ Should isolate timestamps between users
      ✔ Should isolate factor getters between users
    Gas Estimation
      ✔ Should estimate reasonable gas for view functions
    Edge Cases
      ✔ Should handle zero address in assessmentCount
      ✔ Should allow multiple users to check their status independently
      ✔ Should maintain consistent state across multiple calls
    Contract Inheritance
      ✔ Should inherit from ZamaEthereumConfig

  26 passing (178ms)
```

## How It Works

```
User Input (plaintext)
       ↓
Browser Encryption (fhevmjs)
       ↓
On-Chain FHE Computation
  • FHE.add() — Sum 6 risk factors
  • FHE.lt() + FHE.select() — Classify risk level
       ↓
Encrypted Result (euint8)
       ↓
User Decrypt (EIP-712 signed)
       ↓
Display Result
```

## License

MIT

