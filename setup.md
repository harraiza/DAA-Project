# Algorithm Quest - Setup Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Git**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DAA-Project
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 📋 Detailed Setup

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/algorithm-quest

# Client Configuration
CLIENT_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `algorithm-quest`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Development Tools

#### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**

#### Browser Extensions
- **React Developer Tools**
- **Redux DevTools**

## 🎮 Game Features

### Available Levels

1. **Recursion Escape** - Learn recursive functions through door unlocking
2. **Sorting Tournament** - Compare different sorting algorithms
3. **Search Maze** - Navigate using binary and linear search
4. **Divide & Conquer Barrier** - Break barriers with subproblem division
5. **Greedy Resource Quest** - Optimize resource allocation

### Learning Components

- **Visual Algorithm Simulation** - Step-by-step execution
- **Interactive Gameplay** - Learn through play
- **Progress Tracking** - Monitor your learning journey
- **Code Practice** - Implement algorithms in real environment
- **Achievement System** - Unlock achievements as you learn

## 🛠️ Development Commands

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Project Structure

```
DAA-Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── game/          # Phaser.js game logic
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── controllers/       # Business logic
│   └── middleware/        # Custom middleware
├── shared/                 # Shared types and utilities
└── docs/                  # Documentation
```

## 🎯 Learning Path

### Beginner Track
1. **Recursion** - Understand function calls and base cases
2. **Sorting** - Learn comparison-based algorithms
3. **Searching** - Master linear and binary search

### Intermediate Track
4. **Divide & Conquer** - Break problems into subproblems
5. **Greedy Algorithms** - Make locally optimal choices
6. **Dynamic Programming** - Solve overlapping subproblems

### Advanced Track
7. **Graph Algorithms** - Traverse and search graphs
8. **Shortest Paths** - Find optimal routes
9. **Minimum Spanning Trees** - Build efficient networks
10. **NP-Complete Problems** - Understand computational complexity

## 📊 Progress Tracking

### User Statistics
- **Level Progress** - Track completion of each level
- **Experience Points** - Earn XP for completing challenges
- **Achievements** - Unlock badges for milestones
- **Learning Analytics** - Monitor time spent and performance

### Assessment Metrics
- **Concept Retention** - Pre/post-test comparisons
- **Problem-Solving Skills** - Applied algorithm design
- **Confidence Levels** - Self-reported algorithm understanding
- **Engagement Metrics** - Time-on-task and completion rates

## 🔧 Customization

### Adding New Levels

1. **Create Game Scene**
   ```typescript
   // client/src/game/scenes/NewAlgorithmScene.ts
   export class NewAlgorithmScene extends Phaser.Scene {
     // Implement game logic
   }
   ```

2. **Add to Game Context**
   ```typescript
   // client/src/context/GameContext.tsx
   const newLevel = {
     id: 12,
     title: "New Algorithm",
     description: "Learn new concepts",
     algorithm: "New Algorithm",
     difficulty: "intermediate"
   };
   ```

3. **Update Game Canvas**
   ```typescript
   // client/src/components/GameCanvas.tsx
   case 12:
     return NewAlgorithmScene;
   ```

### Customizing Visualizations

1. **Algorithm Visualizer**
   ```typescript
   // client/src/components/AlgorithmVisualizer.tsx
   const generateNewAlgorithmSteps = (data) => {
     // Implement visualization logic
   };
   ```

2. **D3.js Integration**
   ```typescript
   // Add new rendering function
   const renderNewAlgorithmVisualization = (g, data, width, height) => {
     // Implement D3.js visualization
   };
   ```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Deploy to Netlify**
   ```bash
   netlify deploy --prod
   ```

### Backend Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create algorithm-quest-api
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **MongoDB connection failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network connectivity

3. **Dependencies not found**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Phaser.js not loading**
   - Check browser console for errors
   - Ensure all game assets are loaded
   - Verify WebGL support

### Performance Optimization

1. **Bundle Size**
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   ```

2. **Database Queries**
   - Use indexes for frequently queried fields
   - Implement pagination for large datasets
   - Cache frequently accessed data

3. **Game Performance**
   - Optimize sprite rendering
   - Use object pooling for particles
   - Implement level-of-detail (LOD)

## 📚 Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs/)
- [Phaser.js Documentation](https://photonstorm.github.io/phaser3-docs/)
- [D3.js Documentation](https://d3js.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Learning Resources
- [Algorithm Visualization](https://visualgo.net/)
- [Big O Notation](https://www.bigocheatsheet.com/)
- [Interactive Algorithms](https://algorithm-visualizer.org/)

### Community
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Server](https://discord.gg/algorithm-quest)
- [Reddit Community](https://reddit.com/r/algorithmquest)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-algorithm
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   ```
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Learning! 🎓✨** 