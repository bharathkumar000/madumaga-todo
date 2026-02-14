# MADU MAGA - Real-time Collaborative Task Management

A professional, real-time collaborative task management system built for high-performance teams. This application features smooth drag-and-drop interactions, persistent team profiles, and live synchronization across all connected clients.

## 🚀 Features

- **Real-time Collaboration**: Powered by Firebase Firestore, every change is instantly synced across all users.
- **Optimistic UI Updates**: Lag-free drag-and-drop experience using `@dnd-kit` with background synchronization.
- **Organisation & Team Management**: Dedicated sidebar for team visibility, member-specific task filtering, and online status indicators.
- **Dynamic Task Board**: Manage tasks across "In Progress", "Code Review", and "Upcoming" columns.
- **Integrated Calendar**: Visual task scheduling with a custom-built glassmorphism calendar.
- **Interactive Waiting List**: Drop zone for pending tasks with quick-action controls.
- **Achievement & Events System**: Track team milestones and upcoming hackathons or meetings.
- **Premium Aesthetics**: Clean, modern dark-mode UI with smooth micro-animations and GPU-accelerated transitions.

## 📦 Dependencies

The project relies on the following core technologies:

### Core Framework
- **React 18**: Frontend library for building the user interface.
- **Vite**: Ultra-fast build tool and development server.

### Backend & Sync
- **Firebase SDK**: Handles Authentication and real-time Firestore database synchronization.

### Interface & Experience
- **@dnd-kit**: Performance-oriented drag-and-drop primitives for smooth task movement.
- **Lucide React**: Comprehensive icon library for UI elements.
- **date-fns**: Robust date manipulation and formatting.
- **Tailwind CSS**: Utility-first CSS framework for modern styling.

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/avnu112233-collab/madu-maga-todo.git
   cd madu-maga-todo
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Firebase configuration (see `.env.example` for the template):
   ```bash
   cp .env.example .env
   # Fill in your Firebase keys in the .env file
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Building for Production

To create an optimized production build:
```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to Firebase Hosting, Vercel, or Netlify.

## 🔒 Security

Ensure Firestore Security Rules are set to allow authenticated access:
```javascript
allow read, write: if request.auth != null;
```
