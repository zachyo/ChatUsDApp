# 🌙 Lunar Chat - Decentralized Messaging DApp

A beautiful, production-ready decentralized chat application built with React, TypeScript, Wagmi v2, and smart contracts. Experience the future of blockchain-powered communication with secure messaging, IPFS profile storage, and unique .lunar identities.

![Lunar Chat](https://lovable.dev/opengraph-image-p98pqg.png)

## ✨ Features

- **🔐 Wallet Integration** - Connect with MetaMask, WalletConnect, and other Web3 wallets
- **🎭 Unique Identities** - Register personalized .lunar names with IPFS-hosted profile pictures
- **💬 Real-time Messaging** - Private messages and group chat with blockchain event updates
- **🌐 Decentralized Storage** - Profile images stored on IPFS via Pinata
- **🎨 Modern UI** - Beautiful purple gradient design with responsive layout
- **⚡ Smart Contracts** - Fully integrated with custom ChatDApp smart contract
- **🔔 Live Updates** - Real-time message updates using contract event watching

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Pinata account for IPFS storage
- Deployed ChatDApp smart contract

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lunar-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
   VITE_PINATA_JWT=your_pinata_jwt_token_here
   VITE_PINATA_GATEWAY=your_gateway_here
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Web3**: Wagmi v2, Viem
- **UI**: TailwindCSS, Radix UI, Shadcn/ui
- **Storage**: IPFS (Pinata)
- **Blockchain**: Ethereum, Smart Contracts (Solidity)

## 📖 Usage Guide

### Getting Started

1. **Landing Page**
   - Beautiful hero section with app overview
   - Click "Start Chatting" to begin

2. **Wallet Connection**
   - Connect your preferred Web3 wallet
   - Supported: MetaMask, WalletConnect, and more

3. **Profile Registration**
   - Choose a unique display name (becomes `yourname.lunar`)
   - Upload a profile picture (stored on IPFS)
   - Submit transaction to register on blockchain

4. **Chat Interface**
   - **Left Sidebar**: List of all registered users
   - **Main Area**: Private messages or group chat
   - **Message Input**: Send messages to users or group

### Key Features

#### Private Messaging
- Click any user in the sidebar to start a private chat
- Messages are stored on the blockchain
- Real-time updates via contract events

#### Group Chat
- Switch to "Group Chat" tab
- Public messages visible to all users
- Global community discussion

#### Profile Management
- Unique ENS-style naming: `displayname.lunar`
- IPFS-hosted profile pictures
- Blockchain-verified identities

## 🏗️ Smart Contract Integration

The app integrates with a custom ChatDApp smart contract providing:

- **User Registration**: `registerUser(displayName, profileImageHash)`
- **Private Messages**: `sendMessage(ensName, content)`
- **Group Messages**: `sendGroupMessage(content)`
- **User Queries**: `getAllUsers()`, `isDisplayNameAvailable()`
- **Message History**: `getMessagesByENS()`, `getGroupMessages()`

### Contract Events

The app watches for these blockchain events:
- `UserRegistered` - New user joins
- `MessageSent` - Private message sent
- `GroupMessageSent` - Group message sent

## 🎨 Design System

The app features a comprehensive design system with:

- **Purple/Violet Theme** - Professional gradient color scheme
- **Design Tokens** - Consistent colors, spacing, and typography
- **Custom Components** - Enhanced Shadcn/ui components
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Complete dark mode support

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CONTRACT_ADDRESS` | Smart contract address | ✅ |
| `VITE_PINATA_JWT` | Pinata JWT token for IPFS | ✅ |
| `VITE_PINATA_GATEWAY` | Pinata gateway URL | ✅ |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | ✅ |

### Pinata Setup

1. Create account at [Pinata](https://pinata.cloud)
2. Generate JWT token in API Keys section
3. Add token to environment variables

### WalletConnect Setup

1. Create project at [WalletConnect](https://cloud.walletconnect.com)
2. Get project ID from dashboard
3. Add ID to environment variables

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag and drop `dist` folder
- **IPFS**: Upload to decentralized storage
- **Traditional Hosting**: Upload `dist` folder contents

### Environment Setup

Ensure all environment variables are configured in your deployment platform.

## 🔒 Security Considerations

- Contract addresses are validated
- IPFS content is content-addressed (tamper-proof)
- Wallet connections use secure protocols
- No private keys stored in frontend
- All transactions require user confirmation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@lunarchat.dev

---

**Built with ❤️ for the decentralized future** 🌙