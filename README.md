# 🤖 QA Automation Tool

An intelligent QA automation tool that reads JIRA tickets, parses acceptance criteria using AI, and automatically tests them on your portal using Puppeteer browser automation.

## 🌟 Features

- **JIRA Integration**: Automatically fetches ticket details and acceptance criteria
- **AI-Powered Test Generation**: Uses Claude AI to understand acceptance criteria and generate test scenarios
- **Browser Automation**: Uses Puppeteer to interact with web portals
- **Smart Testing**: Supports multiple test actions (style checks, clicks, text validation, visibility checks, etc.)
- **Beautiful Web Interface**: Modern, responsive UI for easy testing
- **Detailed Reports**: AI-generated test reports with actionable insights

## 📋 Prerequisites

- Node.js 18+ installed
- A JIRA account with API access
- An Anthropic API key (for Claude AI)
- Access to the portal you want to test

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Create a `.env` file in the root directory (use `env-example.txt` as a template):

```bash
# JIRA Configuration
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token

# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Server Configuration (optional)
PORT=3000
NODE_ENV=development
```

#### Getting Your JIRA API Token

1. Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "QA Automation")
4. Copy the token and add it to your `.env` file

#### Getting Your Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 3. Run the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 💻 Usage

### Web Interface

1. Open your browser and go to `http://localhost:3000`
2. Enter your JIRA ticket ID (e.g., `PROJ-1234`)
3. Enter the portal URL to test (e.g., `https://qa.yachtworld.com`)
4. Click "Run QA Tests"
5. Wait for the results (this may take 30-60 seconds)

### API Usage

You can also use the API directly:

#### Run Tests

```bash
POST /api/test
Content-Type: application/json

{
  "ticketId": "PROJ-1234",
  "portalUrl": "https://qa.yachtworld.com"
}
```

#### Get Ticket Details

```bash
GET /api/ticket/PROJ-1234
```

### Example Response

```json
{
  "success": true,
  "allTestsPassed": true,
  "ticket": {
    "key": "PROJ-1234",
    "summary": "Change button color from blue to yellow",
    "status": "In Progress"
  },
  "results": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "tests": [
      {
        "description": "Verify button has yellow background",
        "action": "check_style",
        "target": "#blue-button",
        "expected": "background-color should be yellow",
        "passed": true,
        "actual": "rgb(255, 255, 0)"
      }
    ]
  },
  "report": "AI-generated test report..."
}
```

## 🎯 How It Works

1. **Fetch Ticket**: Connects to JIRA and retrieves the ticket details and acceptance criteria
2. **Parse Criteria**: Uses Claude AI to understand the acceptance criteria and generate specific test scenarios
3. **Execute Tests**: Launches a headless browser (Puppeteer) and navigates to your portal
4. **Run Scenarios**: Executes each test scenario (checking styles, clicking buttons, verifying text, etc.)
5. **Generate Report**: Uses AI to create a comprehensive test report with results and recommendations

## 🔧 Supported Test Actions

The tool supports various test actions:

- **`check_style`**: Verify CSS properties (colors, fonts, sizes, etc.)
  - Example: "background-color should be yellow"
  
- **`click`**: Click on an element
  - Example: Click button with ID `#submit-btn`
  
- **`check_text`**: Verify text content
  - Example: "text should contain 'Success'"
  
- **`check_visibility`**: Check if element is visible/hidden
  - Example: "element should be visible"
  
- **`navigate`**: Navigate to a URL
  - Example: "navigate to /dashboard"
  
- **`hover`**: Hover over an element
  - Example: Hover over menu item
  
- **`fill_input`**: Fill an input field
  - Example: "fill with 'test@example.com'"

## 📝 Example Use Cases

### Use Case 1: Button Color Change

**Ticket**: PROJ-1234  
**Acceptance Criteria**: "Change the background color of the button with ID 'blue-button' from blue to yellow"  
**Portal URL**: https://qa.yachtworld.com

**Expected Test**:
- Action: `check_style`
- Target: `#blue-button`
- Expected: "background-color should be yellow"

### Use Case 2: Form Validation

**Ticket**: PROJ-5678  
**Acceptance Criteria**: "When user submits empty form, show error message 'Please fill required fields'"  
**Portal URL**: https://qa.example.com/contact

**Expected Tests**:
1. Action: `click`, Target: `#submit-button`
2. Action: `check_text`, Target: `.error-message`, Expected: "text should contain 'Please fill required fields'"

### Use Case 3: Navigation Menu

**Ticket**: PROJ-9012  
**Acceptance Criteria**: "Add 'About Us' link to navigation menu"  
**Portal URL**: https://qa.example.com

**Expected Tests**:
1. Action: `check_visibility`, Target: `nav a[href="/about"]`, Expected: "element should be visible"
2. Action: `check_text`, Target: `nav a[href="/about"]`, Expected: "text should be 'About Us'"

## 🐛 Debugging

### Enable Debug Mode

Set these in your `.env` file:

```bash
DEBUG_JIRA=true
DEBUG_PUPPETEER=true
```

- `DEBUG_JIRA=true`: Shows all custom fields from JIRA to help identify acceptance criteria field
- `DEBUG_PUPPETEER=true`: Shows browser window during testing (not headless)

### Common Issues

#### "Missing JIRA credentials"
- Make sure all three JIRA environment variables are set in `.env`
- Check that your JIRA_HOST doesn't include `https://`

#### "No acceptance criteria found"
- The tool looks for acceptance criteria in the description or custom fields
- Try enabling `DEBUG_JIRA=true` to see available fields
- You may need to modify the `extractAcceptanceCriteria` function in `services/jira-service.ts`

#### "Element not found"
- The CSS selector might be incorrect
- Try inspecting the portal's HTML to verify the selector
- Use browser dev tools to test the selector

#### "Timeout" errors
- The portal might be slow to load
- Increase timeout in `services/automation-service.ts`
- Check your internet connection

## 🏗️ Project Structure

```
qa-automation/
├── server.ts                 # Express server and API endpoints
├── services/
│   ├── jira-service.ts      # JIRA integration
│   ├── ai-service.ts        # Claude AI integration
│   └── automation-service.ts # Puppeteer browser automation
├── public/
│   └── index.html           # Web interface
├── package.json
├── tsconfig.json
├── .env                     # Your configuration (create this)
├── env-example.txt         # Template for .env
└── README.md
```

## 🔒 Security

- Never commit your `.env` file to version control
- Keep your API keys secure
- The `.gitignore` file is configured to exclude sensitive files
- Use environment variables for all credentials

## 🤝 Contributing

This is a personal QA automation tool. Feel free to fork and customize for your needs.

## 📄 License

ISC

## 🆘 Support

For issues or questions:
1. Check the debugging section above
2. Review the console logs for detailed error messages
3. Ensure all prerequisites are properly configured

## 🎉 What's Next?

Possible enhancements:
- Screenshot capture on test failures
- Support for more complex interactions (drag & drop, file uploads)
- Integration with Slack/Teams for notifications
- Test result history and trends
- Support for multiple pages/workflows
- Parallel test execution
- Custom assertion library

---

Built with ❤️ using Node.js, TypeScript, Puppeteer, and Claude AI

# qa-agent
