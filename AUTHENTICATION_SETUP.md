# 🔐 Brojgar Authentication System Setup Guide

This guide will help you set up the complete authentication system for the Brojgar Business Management App.

## 📋 Overview

The authentication system includes:
- **Backend API** (Node.js + Express + MongoDB)
- **Frontend Mobile App** (React Native + Expo)
- **JWT Authentication** with device-based persistent login
- **Google OAuth** integration (ready to implement)
- **User Management** with business profile features

---

## 🚀 Quick Setup

### 1. Backend Setup

#### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Cloud Console account (for OAuth)

#### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Environment Configuration
Edit the `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:19006

# MongoDB Configuration (Choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/brojgar-app
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brojgar-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### 2. Frontend Setup

#### Install New Dependencies
```bash
# In the root directory of your React Native project
npm install
```

#### Update API Configuration
Edit `context/AuthContext.js` and update the API URL:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // For development
  : 'https://your-production-api.com/api';  // For production
```

---

## 🔧 Advanced Configuration

### MongoDB Setup Options

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/brojgar-app`

#### Option 2: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `.env`
4. Whitelist your IP address

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:19006` (development)
   - Your production domain
6. Copy Client ID and Secret to `.env`

---

## 📱 Mobile App Features

### Authentication Flow
1. **First Launch**: User sees SignUp screen
2. **Registration**: User creates account with business details
3. **Persistent Login**: User stays logged in until logout
4. **Device Management**: Each device gets unique token

### User Data Structure
```javascript
{
  id: "user_id",
  name: "John Doe",
  email: "john@example.com",
  businessName: "John's Store",
  businessType: "retail",
  businessAddress: "123 Main St",
  businessPhone: "+1234567890",
  avatar: "profile_picture_url",
  preferences: {
    currency: "INR",
    language: "en",
    darkMode: false,
    notifications: true
  },
  subscription: {
    plan: "free",
    features: []
  },
  isVerified: true,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

---

## 🔄 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/google` | Google OAuth | No |
| POST | `/api/auth/verify-device` | Device verification | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Example Request/Response

#### Registration
**Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "businessName": "John's Store",
  "businessType": "retail",
  "businessPhone": "+1234567890",
  "businessAddress": "123 Main St",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "deviceName": "iPhone 12",
    "platform": "ios"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "deviceToken": "device-token-here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "John's Store",
    // ... other user data
  }
}
```

---

## 🔒 Security Features

### Password Security
- Minimum 6 characters required
- Hashed using bcrypt (cost factor 12)
- No plain text storage

### Account Protection
- Rate limiting (10 auth requests per 15 minutes)
- Account lockout after 5 failed attempts
- 2-hour lockout duration

### JWT Security
- 30-day expiration
- Secure secret key required
- Token verification on each request

### Device Management
- Unique device tokens
- Maximum 5 devices per user
- Device-based persistent login

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
# Test with Expo
npx expo start

# Test authentication flow:
1. Sign up with new account
2. Log out and log back in
3. Close app and reopen (should stay logged in)
4. Test with invalid credentials
```

---

## 🚀 Deployment

### Backend Deployment
1. **Heroku Example:**
```bash
# Install Heroku CLI
heroku create brojgar-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-atlas-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

2. **Environment Variables:**
   - Set all production environment variables
   - Use strong JWT secret (32+ characters)
   - Use MongoDB Atlas for production

### Frontend Deployment
1. **Update API URL** in `AuthContext.js`
2. **Build for stores:**
```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

---

## 🛠️ Troubleshooting

### Common Issues

#### "Network Error" on Login
- Check if backend server is running
- Verify API URL in `AuthContext.js`
- Check CORS settings in backend

#### "MongooseError: Operation timed out"
- Check MongoDB connection string
- Verify network access (firewall/VPN)
- For Atlas: whitelist IP address

#### "JWT malformed" error
- Check JWT_SECRET in environment
- Verify token format
- Clear app data and re-login

#### App doesn't stay logged in
- Check AsyncStorage permissions
- Verify device token implementation
- Check app state management

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Authentication](https://docs.expo.dev/guides/authentication/)

---

## 🔄 Next Steps

1. **Implement Google OAuth** (instructions provided)
2. **Add password reset functionality**
3. **Implement email verification**
4. **Add biometric authentication**
5. **Set up push notifications**

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Test API endpoints with Postman
4. Check React Native debugger

**System Requirements:**
- Node.js 18+
- MongoDB 4.4+
- React Native 0.70+
- Expo SDK 49+