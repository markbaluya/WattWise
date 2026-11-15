# ⚡ WattWise — Electricity Consumption and Bill Estimation App

WattWise is a mobile application designed to help users monitor their electricity consumption and estimate their monthly electricity bills. It allows users to manage their appliances, calculate estimated electricity costs, view bill history, and get assistance through an AI-powered chatbot.

## 📱 Project Overview

WattWise helps users understand how much electricity their appliances consume and how much they may need to pay for their electricity bills.

The application provides a simple interface for managing electricity usage and monitoring estimated expenses.

## ✨ Features

- **Admin Authentication** — Secure administrator login using backend authentication.
- **Dashboard** — View estimated electricity bills and consumption summaries.
- **Appliance Management** — Select and manage household appliances.
- **Bill Calculation** — Calculate estimated electricity consumption and monthly costs.
- **Bill History** — View previously calculated electricity bills.
- **AI Chatbot** — Get assistance through an AI-powered chatbot using Gemini.
- **Conversation History** — Save and revisit previous chatbot conversations.
- **Profile Management** — Update administrator profile information.
- **Dark and Light Mode** — Switch between different application themes.

## 🛠️ Technologies Used

**Frontend**
- React Native
- Expo
- TypeScript
- Expo Router
- Expo SecureStore
- AsyncStorage

**Backend**
- Node.js
- Express.js
- bcryptjs
- Gemini API

**Development Tools**
- Visual Studio Code
- Git
- GitHub
- Expo Go

## 📂 Project Structure

```text
WattWise/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── src/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   └── config/
│
├── assets/
├── app.json
├── package.json
├── package-lock.json
├── .env.example
└── README.md
```

*Note: The structure above is a simplified overview. Your actual project may contain additional files and folders.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the application:

- Node.js
- npm
- Visual Studio Code
- Expo Go on your mobile device

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project folder:

```bash
cd WattWise
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure the Backend

Navigate to the backend folder:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create your local `.env` file using `.env.example` as a guide.

Add your Gemini API key to the backend environment configuration:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Do not upload your actual `.env` file to GitHub.

### 4. Start the Backend

Inside the backend folder, run:

```bash
npm start
```

Keep the backend running while using the mobile application.

### 5. Configure the API Connection

Make sure the frontend API configuration in `src/config/api.ts` points to the correct backend address.

For local development, use the computer's reachable LAN IP address when connecting from a physical mobile device.

For production, use a properly secured HTTPS backend URL.

### 6. Start the Mobile Application

Open another terminal in the main WattWise project folder:

```bash
npx expo start
```

Scan the QR code using Expo Go to open the application.

## 🔐 Administrator Setup

WattWise uses backend-based administrator authentication.

On the first launch, when no administrator account exists:

1. Start the backend server.
2. Open the WattWise mobile application.
3. Select **Set Up Administrator**.
4. Create a secure administrator password.
5. Sign in using the administrator account.

Passwords are hashed using bcrypt on the backend. Session tokens are stored using Expo SecureStore.

**Important:** Never share your administrator password or upload your backend environment files or private account data to GitHub.

## 🔒 Security Notes

- Administrator authentication is handled by the backend.
- Passwords are stored as bcrypt hashes.
- Protected API endpoints require authentication.
- Gemini API credentials are kept on the backend.
- Local environment files and administrator data are excluded from Git.
- HTTPS should be used when deploying the backend publicly.

## 🚀 Future Improvements

- Deploy the backend to a secure hosting service.
- Improve session management and persistence.
- Add more electricity monitoring features.
- Improve appliance consumption analytics.
- Conduct additional security and usability testing.

---

*WattWise — Making Electricity Consumption Easier to Understand.*
