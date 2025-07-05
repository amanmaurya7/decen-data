# DecenData - Full-Stack Decentralized File Storage

A complete decentralized file storage platform with React frontend, Node.js/Express backend, MongoDB database, Pinata IPFS integration, and AI-powered features using Perplexity AI.

## 🚀 Featur## 🚀 Live Demo

**Backend API**: https://decen-data.onrender.com

The backend is deployed on Render with all production configurations including:

- MongoDB Atlas database
- Pinata IPFS integration
- JWT authentication
- CORS configured for production

## 📦 Deployment

### Backend Deployment (Render)

The backend is already deployed and live at `https://decen-data.onrender.com`. To deploy your own instance:

1. Fork/clone this repository
2. Create a Render account and connect your GitHub repository
3. Create a new Web Service with these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set up environment variables in Render dashboard:
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (secure random string)
   - `PINATA_API_KEY` and `PINATA_API_SECRET`
   - `PERPLEXITY_API_KEY` (optional)
   - `FRONTEND_URL` (your frontend deployment URL)

### Frontend Deployment

For the frontend, update the API configuration:

1. Update `.env` file:

   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request Backend Features

- **Authentication**: Email/password registration and login with JWT
- **File Management**: Upload, download, share, and organize files
- **IPFS Storage**: Files stored on Pinata IPFS with metadata in MongoDB
- **File Sharing**: Share files with other users with permissions and expiration
- **AI Integration**: File analysis, search, and insights using Perplexity AI
- **User Dashboard**: Complete analytics and file management dashboard
- **API Documentation**: RESTful API with comprehensive endpoints

### Frontend Features

- **Modern UI**: Clean, accessible interface with Tailwind CSS and shadcn/ui
- **Authentication**: Secure login/registration with form validation
- **File Upload**: Drag-and-drop file upload with progress tracking
- **File Management**: View, search, and organize your files
- **Sharing**: Share files with other users and manage permissions
- **AI Features**: Smart file analysis and natural language search
- **Responsive**: Works perfectly on desktop and mobile

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Pinata IPFS account
- Perplexity AI API key (optional, for AI features)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Backend Configuration

Create `/backend/.env` file:

```bash
# Backend Environment Variables
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://admin:admin@cluster0.x9qyr.mongodb.net/decendata

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure_12345678901234567890
JWT_EXPIRE=7d

# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_api_secret_here
PINATA_JWT=your_pinata_jwt_token_here

# Perplexity AI Configuration
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Get Required API Keys

#### Pinata IPFS

1. Go to [Pinata](https://pinata.cloud)
2. Create an account
3. Generate API keys and JWT token
4. Update Pinata config in backend `.env` file

#### Perplexity AI (Optional)

1. Go to [Perplexity AI](https://www.perplexity.ai/settings/api)
2. Create an account and generate API key
3. Update `PERPLEXITY_API_KEY` in backend `.env` file

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
# In the root directory
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

## 📖 Usage Guide

### 1. User Registration/Login

- Visit the frontend URL
- Register a new account or login with existing credentials
- All authentication is handled by the backend with JWT tokens

### 2. File Upload

- Click "Upload Files" or drag files to the upload area
- Files are automatically uploaded to Pinata IPFS
- File metadata is stored in MongoDB
- Upload progress is shown in real-time

### 3. File Management

- View all your files in the "My Files" tab
- Search files by name, description, or tags
- Download, share, or delete files
- View file analytics and statistics

### 4. File Sharing

- Click the share button on any file
- Enter recipient's email address
- Set permissions (view, download) and expiration
- Recipients get notifications and can accept/decline shares

### 5. AI Features (Optional)

- Analyze files for content insights and security
- Use natural language search to find files
- Get AI-powered storage optimization recommendations
- View comprehensive analytics dashboard

## 🔧 Technical Architecture

### Backend Stack

- **Node.js & Express**: Server and API framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication and authorization
- **Multer**: File upload handling
- **Pinata IPFS**: Decentralized file storage
- **Perplexity AI**: File analysis and search

### Frontend Stack

- **React 18**: UI framework with hooks
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **React Router**: Navigation

## 🔐 Security Features

- JWT-based authentication with secure tokens
- Password hashing with bcryptjs
- Rate limiting on authentication endpoints
- CORS configuration for secure cross-origin requests
- File permission and access control
- Secure file sharing with expiration

## 🧠 AI Features

- **File Analysis**: Content summarization and categorization
- **Security Assessment**: Risk evaluation and recommendations
- **Smart Search**: Natural language file search
- **Storage Optimization**: AI-powered storage recommendations
- **Usage Insights**: Analytics and usage pattern analysis

## 🎯 Current Status

✅ **Completed:**

- Full backend with Express, MongoDB, and JWT authentication
- File upload/download with Pinata IPFS integration
- User management and file sharing system
- AI integration with Perplexity for analysis and search
- Modern React frontend with authentication and file dashboard
- Complete API documentation and error handling
- Security middleware and rate limiting
- User analytics and dashboard features

🚀 **Ready for Production:**
This is a complete, production-ready decentralized file storage platform with modern authentication, file management, and AI-powered features!

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
