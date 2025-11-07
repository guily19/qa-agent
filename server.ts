import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { getJiraTicket, extractJiraTicketId } from "./services/jira-service";
import { parseAcceptanceCriteria, generateTestReport } from "./services/ai-service";
import { runTests } from "./services/automation-service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "QA Automation Service is running" });
});

// Main QA test endpoint
app.post("/api/test", async (req: Request, res: Response) => {
  const { ticketId, portalUrl } = req.body;

  if (!ticketId || !portalUrl) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: ticketId and portalUrl",
    });
  }

  try {
    console.log(`\n🎫 Processing ticket: ${ticketId}`);
    console.log(`🌐 Portal URL: ${portalUrl}\n`);

    // Step 1: Extract ticket ID if URL is provided
    const extractedId = extractJiraTicketId(ticketId);
    if (!extractedId) {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format. Expected format: ABC-123",
      });
    }

    // Step 2: Fetch ticket from JIRA
    console.log("📥 Fetching ticket from JIRA...");
    const ticket = await getJiraTicket(extractedId);
    console.log(`✓ Ticket fetched: ${ticket.summary}`);

    if (ticket.acceptanceCriteria === "No acceptance criteria found") {
      return res.status(400).json({
        success: false,
        error: "No acceptance criteria found in ticket",
        ticket: {
          key: ticket.key,
          summary: ticket.summary,
          description: ticket.description,
        },
      });
    }

    // Step 3: Parse acceptance criteria using AI
    console.log("\n🤖 Parsing acceptance criteria with AI...");
    const parsedCriteria = await parseAcceptanceCriteria(
      ticket.acceptanceCriteria,
      ticket.summary,
      ticket.description
    );
    console.log(`✓ Generated ${parsedCriteria.scenarios.length} test scenarios`);

    // Step 4: Run automated tests
    console.log("\n🧪 Running automated tests...");
    const testResults = await runTests(portalUrl, parsedCriteria.scenarios);
    
    const passedCount = testResults.filter((r) => r.passed).length;
    const totalCount = testResults.length;
    console.log(`✓ Tests completed: ${passedCount}/${totalCount} passed`);

    // Step 5: Generate test report
    console.log("\n📊 Generating test report...");
    const report = await generateTestReport(
      ticket.key,
      ticket.summary,
      testResults
    );

    // Return results
    const allPassed = passedCount === totalCount;
    res.json({
      success: true,
      allTestsPassed: allPassed,
      ticket: {
        key: ticket.key,
        summary: ticket.summary,
        status: ticket.status,
      },
      results: {
        total: totalCount,
        passed: passedCount,
        failed: totalCount - passedCount,
        tests: testResults.map((r) => ({
          description: r.scenario.description,
          action: r.scenario.action,
          target: r.scenario.target,
          expected: r.scenario.expectedResult,
          passed: r.passed,
          actual: r.actualValue,
          error: r.error,
        })),
      },
      report,
    });

    console.log("\n✅ QA test completed!\n");
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get ticket details endpoint (without running tests)
app.get("/api/ticket/:ticketId", async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const extractedId = extractJiraTicketId(ticketId);
    if (!extractedId) {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format",
      });
    }

    const ticket = await getJiraTicket(extractedId);
    res.json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Debug endpoint to see raw JIRA ticket data
app.get("/api/debug/ticket/:ticketId", async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const extractedId = extractJiraTicketId(ticketId);
    if (!extractedId) {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format",
      });
    }

    // Import JiraApi temporarily for debug
    const JiraApi = require("jira-client");
    const jira = new JiraApi({
      protocol: "https",
      host: process.env.JIRA_HOST,
      username: process.env.JIRA_EMAIL,
      password: process.env.JIRA_API_TOKEN,
      apiVersion: "2",
      strictSSL: true,
    });

    const issue = await jira.findIssue(extractedId);
    
    // Return all fields so we can see what's available
    res.json({
      success: true,
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      allFields: Object.keys(issue.fields).filter(k => k.startsWith('customfield_')),
      customFieldValues: Object.keys(issue.fields)
        .filter(k => k.startsWith('customfield_'))
        .reduce((acc: any, key: string) => {
          const value = issue.fields[key];
          if (value && typeof value === 'string' && value.trim()) {
            acc[key] = value.substring(0, 200); // First 200 chars
          } else if (value !== null && value !== undefined) {
            acc[key] = typeof value;
          }
          return acc;
        }, {}),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Serve frontend (catch-all route for SPA)
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 QA Automation Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Make sure you have configured your .env file with:`);
  console.log(`   - JIRA_HOST`);
  console.log(`   - JIRA_EMAIL`);
  console.log(`   - JIRA_API_TOKEN`);
  console.log(`   - ANTHROPIC_API_KEY\n`);
});

export default app;

