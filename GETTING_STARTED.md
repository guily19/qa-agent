# 🚀 Getting Started with QA Automation

Welcome! This guide will get you testing in **5 minutes**.

## 📂 Your Project Structure

```
qa-agent/                        ← You are here!
├── server.ts                    # Main server
├── services/                    # Core logic
│   ├── jira-service.ts         # JIRA integration
│   ├── ai-service.ts           # Claude AI
│   └── automation-service.ts   # Puppeteer testing
├── public/
│   └── index.html              # Web interface
├── package.json                # Dependencies
└── env-example.txt            # Config template
```

## ⚡ Quick Start

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure Environment
```bash
# Copy the template
cp env-example.txt .env

# Edit .env and add:
# - JIRA_HOST (e.g., company.atlassian.net)
# - JIRA_EMAIL (your email)
# - JIRA_API_TOKEN (get from: https://id.atlassian.com/manage-profile/security/api-tokens)
# - ANTHROPIC_API_KEY (get from: https://console.anthropic.com/)
```

### 3️⃣ Start the Server
```bash
npm start
```

You should see:
```
🚀 QA Automation Server running on http://localhost:3000
```

### 4️⃣ Open Browser
Navigate to: **http://localhost:3000**

### 5️⃣ Run Your First Test
1. Enter a JIRA ticket ID (e.g., `PROJ-1234`)
2. Enter a portal URL (e.g., `https://qa.yachtworld.com`)
3. Click **"Run QA Tests"**
4. Wait ~30 seconds for results!

## 📖 Example

**JIRA Ticket: PRIME-1234**
- Summary: "Change button color"
- Acceptance Criteria: "Change the background color of button #blue-button from blue to yellow"

**Portal URL:** `https://qa.yachtworld.com`

**What Happens:**
1. ✅ Fetches ticket from JIRA
2. ✅ AI parses: "Check if #blue-button is yellow"
3. ✅ Opens portal in browser
4. ✅ Tests the button color
5. ✅ Reports: PASS ✅ or FAIL ❌

## 🎯 What's Next?

- **Full Docs**: See [README.md](./README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Project Structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🐛 Troubleshooting

### "Missing JIRA credentials"
→ Check your `.env` file has all required variables

### "No acceptance criteria found"
→ Make sure your JIRA ticket has AC in the description or custom fields

### "Element not found"
→ Verify the CSS selector using browser dev tools

### Need help?
→ Enable debug mode: Add `DEBUG_PUPPETEER=true` to `.env`

## 📞 Available Scripts

```bash
npm start       # Start the server
npm run dev     # Start with auto-reload
npm run build   # Compile TypeScript
```

---

**Ready to automate your QA testing!** 🎉

For detailed documentation, see [README.md](./README.md)

