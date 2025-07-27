# VS Code Development Setup Guide

## Prerequisites

1. **Install Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

2. **Install Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

3. **Install VS Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

## Step 1: Clone the Project

```bash
# Create a new folder for your project
mkdir roadmap-app
cd roadmap-app

# Initialize git repository
git init

# Add all files from Replit (you'll need to copy them manually or use git)
```

## Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Install global TypeScript for better VS Code support
npm install -g typescript tsx
```

## Step 3: Database Setup Options

### Option A: Keep Using Neon Cloud Database (Recommended)

1. Create a `.env` file in your project root:
```env
DATABASE_URL="your_neon_database_url_here"
PGHOST="your_host"
PGDATABASE="your_database"
PGUSER="your_username"
PGPASSWORD="your_password"
PGPORT="5432"
```

2. Get your database URL from Replit's environment variables
3. Test connection: `npm run db:push`

### Option B: Local PostgreSQL Setup

1. **Install PostgreSQL**:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create local database**:
```bash
# Start PostgreSQL service
# Windows: Use pgAdmin or Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
createdb roadmap_app

# Create user (optional)
createuser --interactive roadmap_user
```

3. **Update .env file**:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/roadmap_app"
PGHOST="localhost"
PGDATABASE="roadmap_app"
PGUSER="your_username"
PGPASSWORD="your_password"
PGPORT="5432"
```

## Step 4: VS Code Extensions (Recommended)

Install these VS Code extensions:

1. **TypeScript and JavaScript**:
   - TypeScript Importer
   - Auto Rename Tag
   - Bracket Pair Colorizer

2. **React Development**:
   - ES7+ React/Redux/React-Native snippets
   - Simple React Snippets

3. **Database**:
   - PostgreSQL (by Chris Kolkman)
   - SQLTools
   - SQLTools PostgreSQL/Cockroach Driver

4. **General Development**:
   - Prettier - Code formatter
   - ESLint
   - GitLens
   - Auto Import - ES6, TS, JSX, TSX

## Step 5: VS Code Configuration

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

Create `.vscode/launch.json` for debugging:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "tsx/cjs"]
    }
  ]
}
```

## Step 6: Running the Application

### Development Mode:
```bash
# Start the development server
npm run dev

# This runs both:
# - Express server (backend) on port 5000
# - Vite dev server (frontend) on port 5173
```

### Database Commands:
```bash
# Push schema changes to database
npm run db:push

# Open database studio (web interface)
npm run db:studio

# Generate migration files
npm run db:generate
```

### Build & Production:
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Step 7: Environment Variables Setup

Create a `.env.example` file for reference:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"
PGHOST="localhost"
PGDATABASE="roadmap_app"
PGUSER="your_username"
PGPASSWORD="your_password"
PGPORT="5432"

# Development
NODE_ENV="development"
```

## Step 8: Git Setup

Create `.gitignore`:
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# Database
*.db
*.sqlite

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db
```

## Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **Database connection failed**:
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

3. **TypeScript errors**:
   ```bash
   # Restart TypeScript server in VS Code
   Ctrl+Shift+P > "TypeScript: Restart TS Server"
   ```

4. **Node modules issues**:
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

## VS Code Workflow

1. **Open project**: `code .` in terminal
2. **Split terminal**: Use VS Code integrated terminal
3. **Run dev server**: `npm run dev`
4. **View database**: `npm run db:studio`
5. **Debug**: Use F5 with launch configuration

Your app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database Studio: http://localhost:4983 (when running db:studio)