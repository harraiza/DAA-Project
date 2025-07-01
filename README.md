# Algorithm Quest - Educational Game

A comprehensive educational game for learning Design and Analysis of Algorithms (DAA) through interactive gameplay, visualizations, and hands-on practice.

## 🎮 Game Overview

Algorithm Quest transforms the learning of algorithms into an engaging adventure where players restore order to computational kingdoms by solving algorithmic problems. The game covers the complete DAA curriculum through 11 progressive levels, each focusing on specific algorithm concepts.

## ✨ Features

### 🎯 Core Learning Features
- **11 Progressive Levels**: From recursion to NP-complete concepts
- **Interactive Visualizations**: Real-time algorithm execution visualization
- **Adaptive Difficulty**: Adjusts based on player performance
- **AI Tutor Hints**: Contextual help and guidance
- **Code Integration**: Write and test actual algorithms
- **Progress Analytics**: Detailed learning progress tracking

### 🎮 Gameplay Elements
- **Story-Driven Learning**: Computational kingdoms theme
- **Mini-Games**: Interactive challenges for each concept
- **Boss Challenges**: Advanced problem-solving scenarios
- **Achievement System**: Gamified learning milestones
- **Local Progress Storage**: All progress saved locally

### 📊 Educational Content
- **Time/Space Complexity**: Visual complexity analysis
- **Algorithm Construction**: Step-by-step algorithm building
- **Problem-Solving**: Real-world algorithmic challenges
- **Competitive Elements**: Leaderboards and challenges

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Phaser.js** for game engine
- **D3.js** for data visualizations
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Framer Motion** for animations

### Data Storage
- **localStorage** for client-side data persistence
- **No backend required** - fully client-side application

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DAA-Project
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Alternative: Use the start script
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 📚 Learning Path

### Level 1: Recursion Escape
- **Concept**: Recursion fundamentals
- **Gameplay**: Navigate through recursive function calls
- **Learning**: Call stack visualization, recursive thinking

### Level 2: Recursive Fibonacci
- **Concept**: Fibonacci sequence with recursion
- **Gameplay**: Build Fibonacci tree structure
- **Learning**: Recursive tree traversal, exponential complexity

### Level 3: Sorting Algorithms
- **Concept**: Various sorting techniques
- **Gameplay**: Organize chaotic elements
- **Learning**: Bubble sort, merge sort, quick sort

### Level 4: Search Algorithms
- **Concept**: Efficient search techniques
- **Gameplay**: Find hidden treasures
- **Learning**: Linear search, binary search

### Level 5: Divide and Conquer
- **Concept**: Problem decomposition
- **Gameplay**: Break complex problems into parts
- **Learning**: Recursive problem-solving

### Level 6: Greedy Algorithms
- **Concept**: Optimal local choices
- **Gameplay**: Make best decisions at each step
- **Learning**: Greedy strategy, optimization

### Level 7: Dynamic Programming
- **Concept**: Overlapping subproblems
- **Gameplay**: Build solutions from smaller problems
- **Learning**: Memoization, optimal substructure

### Level 8: Backtracking
- **Concept**: Systematic exploration
- **Gameplay**: Try different solution paths
- **Learning**: Constraint satisfaction, exhaustive search

### Level 9: Graph Algorithms
- **Concept**: Graph traversal
- **Gameplay**: Navigate complex networks
- **Learning**: DFS, BFS, graph representation

### Level 10: Shortest Path
- **Concept**: Pathfinding algorithms
- **Gameplay**: Find optimal routes
- **Learning**: Dijkstra's algorithm, path optimization

### Level 11: Minimum Spanning Tree
- **Concept**: Tree optimization
- **Gameplay**: Connect nodes with minimum cost
- **Learning**: Kruskal's, Prim's algorithms

## 🏗️ Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── GameCanvas.tsx  # Phaser.js game container
│   │   ├── GameUI.tsx      # Game interface elements
│   │   └── GameNavbar.tsx  # Navigation component
│   ├── context/            # React context for state management
│   │   └── GameContext.tsx # Main game state
│   ├── game/               # Game logic and scenes
│   │   └── scenes/         # Phaser.js game scenes
│   ├── pages/              # Main application pages
│   │   ├── GameHome.tsx    # Home page
│   │   ├── GameLevel.tsx   # Level gameplay
│   │   └── GameDashboard.tsx # Progress dashboard
│   ├── services/           # Data services
│   │   └── localStorage.ts # Local storage management
│   ├── App.tsx             # Main app component
│   └── index.tsx           # App entry point
├── package.json            # Dependencies and scripts
└── tailwind.config.js      # Tailwind configuration
```

## 🎯 Key Features Implementation

### Visual Algorithm Simulation
- Real-time execution visualization
- Step-by-step algorithm breakdown
- Interactive call stack representation
- Complexity analysis display

### Adaptive Learning System
- Performance-based difficulty adjustment
- Personalized learning paths
- Progress tracking and analytics
- Achievement system

### Code Integration
- Monaco Editor integration for code input
- Syntax highlighting and error detection
- Real-time code execution
- Algorithm testing environment

## 📊 Progress Tracking

The game tracks comprehensive learning metrics:
- **Level Completion**: Progress through all 11 levels
- **Performance Metrics**: Scores, time spent, attempts
- **Achievement System**: Unlockable milestones
- **Learning Analytics**: Detailed progress reports
- **Streak Tracking**: Daily learning consistency

## 🎨 Customization

### Themes and Preferences
- Dark/Light theme support
- Sound settings
- Tutorial preferences
- Difficulty settings

### Local Data Management
- Export/import progress data
- Reset progress functionality
- Achievement tracking
- Statistics storage

## 🚀 Deployment

### Build for Production
```bash
cd client
npm run build
```

### Deploy to Static Hosting
The built application can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎓 Academic Impact

This game-based learning approach aims to:
- **Increase Engagement**: Make algorithm learning fun and interactive
- **Improve Retention**: Visual and hands-on learning methods
- **Build Confidence**: Progressive difficulty and achievement system
- **Enhance Problem-Solving**: Real-world algorithmic challenges

## 🔮 Future Enhancements

- **Multiplayer Mode**: Collaborative learning experiences
- **Advanced Visualizations**: 3D algorithm representations
- **Mobile Support**: Responsive design for mobile devices
- **Offline Mode**: Complete offline functionality
- **Custom Levels**: User-generated content support

---

**Algorithm Quest** - Making algorithm education engaging, interactive, and effective through gamification and visualization.