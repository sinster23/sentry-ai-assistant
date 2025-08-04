# Sentry AI Assistant

Sentry is a cross-platform AI assistant app built with React Native and powered by Google Gemini. It supports text input, delivering smart, contextual responses and quick actions to assist users on the go.

---

## 📱 Screenshots

<table>
  <tr>
    <td><img src="https://github.com/sinster23/Screenshots/blob/main/sentry-ai-ss/ss1.jpg" alt="Screenshot 1" width="280"/></td>
    <td><img src="https://github.com/sinster23/Screenshots/blob/main/sentry-ai-ss/ss2.jpg" alt="Screenshot 2" width="280"/></td>
    <td><img src="https://github.com/sinster23/Screenshots/blob/main/sentry-ai-ss/ss3.jpg" alt="Screenshot 3" width="280"/></td>
    <td><img src="https://github.com/sinster23/Screenshots/blob/main/sentry-ai-ss/ss4.jpg" alt="Screenshot 4" width="280"/></td>
  </tr>
</table>

---

## ✨ Features

- 🔊 **Text Input**: Type naturally to interact with your assistant.
- 🗣️ AI Voice Responses: Uses expo-speech to read out Gemini’s replies in a natural voice.
- 💬 **Contextual Responses**: Powered by Gemini to understand and respond meaningfully.
- 🎯 **Quick Actions**: Trigger smart actions like opening apps or setting reminders.
- 🌓 **Animated UI**: Smooth, responsive interface with interactive elements.
- 🔐 **Firebase Auth**: Secure login and signup functionality.

---

## ⚙️ Tech Stack

- **React Native** (Expo)
- **Firebase** (Authentication & Backend)
- **Node.js** (API with Gemini integration)
- **Google Gemini API**

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/sinster23/sentry-ai-assistant.git
cd sentry-ai-assistant
```
### 2. Install dependencies
```bash
npm install
```
### 3. Set up environment
Create a .env file in the root directory:
```
  API_KEY= YOUR_FIREBASE_API_KEY
  AUTH_DOMAIN= FIREBASE_AUTH_DOMAIN
  PROJECT_ID= FIREBASE_ID
  STORAGE_BUCKET= FIREBASE_STORAGE_BUCKET
  SENDER_ID= FIREBASE_SENDER_ID
  APP_ID= FIREBASE_APP_ID
  WEATHER_API_KEY= WEATHER_API_KEY
```
### 4. Run the app

### 5. Set up gemini-backend
- Navigate to backend/
- Install dependencies: npm install
- populate .env
- Start server: node index.js

## 👨‍💻 Author
Made with ❤️ by Upayan

