# 📂 Project Structure

```
qa-agent/                        # Root directory
├── .gitignore                   # Git ignore rules
│
├── 📄 Core Application Files
├── server.ts                    # Express API server
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── env-example.txt             # Environment variables template
│
├── 🔧 Services (Core Logic)
├── services/
│   ├── jira-service.ts         # JIRA integration
│   ├── ai-service.ts           # Claude AI (parsing & reports)
│   └── automation-service.ts   # Puppeteer browser automation
│
├── 🎨 Frontend
├── public/
│   └── index.html              # Web interface
│
└── 📚 Documentation
    ├── README.md               # Main documentation
    ├── QUICKSTART.md           # 5-minute setup guide
    ├── ARCHITECTURE.md         # Technical architecture
    └── PROJECT_STRUCTURE.md    # This file
```

## 📝 File Descriptions

### Core Files

- **`server.ts`** - Main Express server with API endpoints (`/api/test`, `/api/ticket/:id`)
- **`package.json`** - Node.js dependencies and npm scripts
- **`tsconfig.json`** - TypeScript compiler configuration
- **`env-example.txt`** - Template for environment variables (copy to `.env`)

### Services Directory

- **`services/jira-service.ts`** - Connects to JIRA API, fetches tickets and acceptance criteria
- **`services/ai-service.ts`** - Integrates with Claude AI to parse criteria and generate reports
- **`services/automation-service.ts`** - Uses Puppeteer for browser automation and testing

### Public Directory

- **`public/index.html`** - Beautiful web interface with forms, results display, and styling

### Documentation

- **`README.md`** - Complete documentation with setup, usage, and examples
- **`QUICKSTART.md`** - Quick start guide for getting up and running in 5 minutes
- **`ARCHITECTURE.md`** - Technical architecture, data flow, and component details
- **`PROJECT_STRUCTURE.md`** - This file, describing the project layout

## 🚀 Getting Started

1. **Install**: `npm install`
2. **Configure**: `cp env-example.txt .env` and add your credentials
3. **Run**: `npm start`
4. **Open**: `http://localhost:3000`

## 📦 Dependencies

See `package.json` for the full list, key dependencies include:
- `express` - Web server
- `puppeteer` - Browser automation
- `@anthropic-ai/sdk` - Claude AI
- `jira-client` - JIRA API integration
- `typescript` - Type safety

## 🔒 Important Files (Not in Repo)

These files are in `.gitignore` and should be created locally:
- `.env` - Your environment variables (NEVER commit this!)
- `node_modules/` - Installed dependencies
- `dist/` - Compiled TypeScript output (if using `npm run build`)

