# DecenData - Decentralized Data Storage Platform

DecenData is a decentralized data storage platform that allows users to securely store and share files using blockchain technology and IPFS (InterPlanetary File System).

## Features

- 🔒 Secure file storage using IPFS
- 🔗 Blockchain-based access control
- 🤝 File sharing capabilities
- 🎯 Intuitive user interface
- 🌐 Decentralized architecture
- 🔐 End-to-end encryption

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Ethereum Blockchain
- IPFS
- Web3.js
- Shadcn/UI Components

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- MetaMask wallet browser extension
- Pinata account with API keys (get them from https://app.pinata.cloud/developers/api-keys)

## Setting Up Your Pinata API Keys

1. Create a free account on [Pinata](https://app.pinata.cloud)
2. Go to https://app.pinata.cloud/developers/api-keys
3. Create a new API key with the following permissions:
   - pinFileToIPFS
   - unpin
4. Copy both your API key and API secret
5. When you first launch the application, you'll be prompted to enter these credentials
6. Your keys will be securely stored in your browser's local storage

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/decendata.git
cd decendata
```

2. Create a `.env` file in the root directory and add the following variables:
```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_secret_key
```

3. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open your browser and navigate to `http://localhost:5173`

3. Connect your MetaMask wallet when prompted

## How It Works

1. **File Upload**
   - Users select files to upload
   - Files are encrypted client-side
   - Encrypted files are stored on IPFS
   - IPFS hash is stored on the blockchain

2. **Access Control**
   - File owners can grant access to other users
   - Access permissions are managed via smart contracts
   - Only authorized users can decrypt and access files

3. **File Sharing**
   - Share files by entering recipient's Ethereum address
   - Recipients receive access through smart contract
   - Shared files appear in recipient's dashboard

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
