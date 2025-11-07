# 🚀 Quick Start Guide

Get up and running with QA Automation in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create `.env` File

Copy the example and fill in your credentials:

```bash
# Copy the template
cp env-example.txt .env

# Edit the .env file with your credentials
```

Your `.env` should look like:

```
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3000
```

### Where to Get Credentials:

- **JIRA API Token**: [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- **Anthropic API Key**: [https://console.anthropic.com/](https://console.anthropic.com/)

## Step 3: Start the Server

```bash
npm start
```

You should see:

```
🚀 QA Automation Server running on http://localhost:3000
```

## Step 4: Use the Tool

Open your browser to `http://localhost:3000` and:

1. Enter a JIRA ticket ID (e.g., `PROJ-1234`)
2. Enter the portal URL to test (e.g., `https://qa.yachtworld.com`)
3. Click "Run QA Tests"
4. Wait for results!

## Example Test

Let's say you have a JIRA ticket:

- **ID**: PRIME-1234
- **Summary**: Change button color
- **Acceptance Criteria**: "Change the background color of the button with ID 'submit-btn' from blue to yellow"

Enter:
- **Ticket ID**: `PRIME-1234`
- **Portal URL**: `https://qa.yachtworld.com`

The tool will:
1. ✅ Fetch the ticket from JIRA
2. ✅ Parse "change button color from blue to yellow"
3. ✅ Open the portal with Puppeteer
4. ✅ Check if `#submit-btn` has yellow background
5. ✅ Generate a detailed report

## Development Mode

For auto-reload during development:

```bash
npm run dev
```

## Troubleshooting

### Can't find ticket
- Make sure your JIRA credentials are correct
- Check that the ticket ID format is correct (ABC-123)

### Tests fail
- Verify the portal URL is accessible
- Check the element selectors in the browser dev tools
- Enable debug mode: `DEBUG_PUPPETEER=true` in `.env`

### No acceptance criteria found
- Make sure your JIRA ticket has acceptance criteria
- Try different custom fields in the JIRA service

## Next Steps

Check out the full [README.md](./README.md) for:
- Complete API documentation
- All supported test actions
- Advanced configuration options
- Debugging tips

Happy testing! 🎉

