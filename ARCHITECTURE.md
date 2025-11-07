# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Web Interface (index.html)                               │ │
│  │  - Input: Ticket ID (PROJ-123)                           │ │
│  │  - Input: Portal URL (https://qa.example.com)            │ │
│  │  - Button: "Run QA Tests"                                │ │
│  │  - Display: Test Results & AI Report                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP POST /api/test
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (server.ts)                 │
│                                                                 │
│  API Endpoints:                                                │
│  - POST /api/test     → Run full QA test                      │
│  - GET /api/ticket/:id → Get ticket details                   │
│  - GET /api/health    → Health check                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌────────────────┐  ┌─────────────────┐
│ JIRA Service │  │   AI Service   │  │ Automation Svc  │
│ (JIRA API)   │  │  (Claude AI)   │  │  (Puppeteer)    │
└──────────────┘  └────────────────┘  └─────────────────┘
```

## Data Flow

### 1️⃣ Ticket Fetching
```
User Input: PROJ-1234
    ↓
JIRA Service → JIRA API
    ↓
Return: {
  key: "PROJ-1234",
  summary: "Change button color",
  acceptanceCriteria: "Change #blue-button from blue to yellow"
}
```

### 2️⃣ AI Parsing
```
Acceptance Criteria
    ↓
AI Service → Claude API
    ↓
Return: {
  scenarios: [
    {
      action: "check_style",
      target: "#blue-button",
      expectedResult: "background-color should be yellow"
    }
  ]
}
```

### 3️⃣ Browser Automation
```
Test Scenarios + Portal URL
    ↓
Automation Service → Puppeteer
    ↓
1. Launch Browser
2. Navigate to Portal
3. For each scenario:
   - Find element (CSS selector)
   - Execute action (check_style, click, etc.)
   - Capture actual result
   - Compare with expected
    ↓
Return: [
  {
    scenario: {...},
    passed: true,
    actualValue: "rgb(255, 255, 0)"
  }
]
```

### 4️⃣ Report Generation
```
Test Results
    ↓
AI Service → Claude API
    ↓
Return: "AI-generated test report with insights"
```

## Component Details

### 🔧 Services

#### JIRA Service (`services/jira-service.ts`)
- **Purpose**: Fetch ticket data from JIRA
- **Key Functions**:
  - `getJiraTicket(ticketId)` - Fetch ticket details
  - `extractJiraTicketId(input)` - Parse ticket ID from various formats
  - `extractAcceptanceCriteria(issue)` - Find AC in custom fields
- **Dependencies**: `jira-client`, `dotenv`

#### AI Service (`services/ai-service.ts`)
- **Purpose**: Parse acceptance criteria and generate reports using AI
- **Key Functions**:
  - `parseAcceptanceCriteria()` - Convert natural language to test scenarios
  - `generateTestReport()` - Create human-readable test reports
- **AI Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Dependencies**: `@anthropic-ai/sdk`

#### Automation Service (`services/automation-service.ts`)
- **Purpose**: Execute browser tests using Puppeteer
- **Key Functions**:
  - `runTests()` - Execute all test scenarios
  - `executeScenario()` - Run single test action
  - `normalizeColorValue()` - Handle color format conversions
- **Supported Actions**:
  - `check_style` - CSS property verification
  - `click` - Element interaction
  - `check_text` - Text content validation
  - `check_visibility` - Visibility testing
  - `navigate` - URL navigation
  - `hover` - Mouse hover
  - `fill_input` - Form filling
- **Dependencies**: `puppeteer`

### 🌐 Server (`server.ts`)

**Main API Endpoints**:

```typescript
POST /api/test
Body: { ticketId: string, portalUrl: string }
Response: {
  success: boolean,
  allTestsPassed: boolean,
  ticket: {...},
  results: {...},
  report: string
}

GET /api/ticket/:ticketId
Response: {
  success: boolean,
  ticket: {...}
}
```

**Middleware**:
- CORS enabled for cross-origin requests
- JSON body parsing
- Static file serving for frontend

### 🎨 Frontend (`public/index.html`)

**Features**:
- Modern, responsive design
- Real-time loading states
- Color-coded test results
- Expandable test details
- AI-generated report display
- Example use cases

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js + TypeScript | Type-safe server logic |
| **Web Framework** | Express | HTTP server & API |
| **Browser Automation** | Puppeteer | Headless Chrome control |
| **AI Integration** | Anthropic Claude | Natural language processing |
| **JIRA Integration** | jira-client | Ticket management |
| **Frontend** | HTML/CSS/JavaScript | User interface |

## Configuration

### Environment Variables (`.env`)

```bash
# JIRA
JIRA_HOST=company.atlassian.net
JIRA_EMAIL=user@company.com
JIRA_API_TOKEN=xxx

# AI
ANTHROPIC_API_KEY=xxx

# Server
PORT=3000
NODE_ENV=development

# Debug (optional)
DEBUG_JIRA=false
DEBUG_PUPPETEER=false
```

## Error Handling

### JIRA Errors
- Missing credentials → 500 error with clear message
- Ticket not found → 404 error
- Invalid ticket format → 400 error

### AI Errors
- API key missing → 500 error
- Invalid response → Retry with error handling
- Rate limiting → Exponential backoff

### Automation Errors
- Element not found → Test marked as FAILED
- Timeout → Configurable timeout (30s default)
- Browser crash → Proper cleanup and error reporting

## Performance Considerations

- **Browser Launch**: ~2-3 seconds
- **Page Load**: Depends on portal (5-10 seconds typical)
- **AI Parsing**: ~2-5 seconds per request
- **Test Execution**: ~1-2 seconds per scenario

**Total Time**: Typically 10-30 seconds for complete test run

## Security

- ✅ All credentials in environment variables
- ✅ No secrets in code
- ✅ `.gitignore` properly configured
- ✅ HTTPS for all API calls
- ✅ CORS configuration

## Future Enhancements

- [ ] Screenshot capture on failures
- [ ] Test result history/database
- [ ] Parallel test execution
- [ ] More test actions (drag-drop, file upload)
- [ ] Integration with CI/CD pipelines
- [ ] Slack/Teams notifications
- [ ] Multi-page workflows
- [ ] Custom assertions library

---

**Last Updated**: 2025-01-07

