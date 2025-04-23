# DecenData - Decentralized Data Storage Platform

## About the Project

DecenData is a cutting-edge decentralized file storage platform that revolutionizes data management by leveraging blockchain technology and IPFS (InterPlanetary File System). Our mission is to provide users with a secure, transparent, and censorship-resistant method of storing, sharing, and managing digital files while maintaining absolute control over their data.

## How It Works

1. **Secure File Upload**: Users can upload files directly to IPFS through Pinata, ensuring distributed and resilient storage.
2. **Blockchain-Powered Access Control**: Smart contracts manage file sharing permissions, allowing granular control over who can access specific files.
3. **End-to-End Encryption**: Files are encrypted before upload, ensuring privacy and data protection.
4. **Wallet-Based Authentication**: Users connect using their Ethereum wallet, creating a decentralized identity system.

## Key Features

- 🔒 Decentralized File Storage
- 🔐 End-to-End Encryption
- 🌐 Blockchain-Based Access Control
- 📁 Seamless File Sharing
- 💻 Wallet-Connected Authentication
- 🚀 IPFS Integration

## Technical Architecture

- **Frontend**: React with TypeScript
- **Blockchain Integration**: Ethereum, Web3.js
- **File Storage**: IPFS via Pinata
- **State Management**: React Query
- **Styling**: Tailwind CSS, Shadcn UI

## Prerequisites

Before installation, ensure you have:
- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- Pinata Account

## Project Setup

1. Clone the repository:
```bash
git clone https://github.com/amanmaurya7/decendata.git
cd decendata
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set Up Pinata Credentials:
   - Create a free Pinata account at https://app.pinata.cloud
   - Generate API keys with `pinFileToIPFS` and `unpin` permissions
   - During first app launch, you'll be prompted to enter these credentials

4. Start the Development Server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Security & Privacy

- All files are encrypted before upload
- Access permissions managed via blockchain smart contracts
- No central authority can access or modify your files
- Wallet-based authentication ensures user sovereignty

## Contribution

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Contact

**Aman Maurya**
- Website: https://www.amanengineer.me/
- GitHub: https://github.com/amanmaurya7
- LinkedIn: https://www.linkedin.com/in/amanmaurya-me/
