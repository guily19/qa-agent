import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

export interface TestScenario {
  action: string;
  target: string;
  expectedResult: string;
  description: string;
}

export interface ParsedAcceptanceCriteria {
  scenarios: TestScenario[];
  summary: string;
}

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY in .env file"
    );
  }

  return new Anthropic({ apiKey });
}

/**
 * Parse acceptance criteria and generate test scenarios using AI
 */
export async function parseAcceptanceCriteria(
  acceptanceCriteria: string,
  ticketSummary: string,
  ticketDescription: string
): Promise<ParsedAcceptanceCriteria> {
  const anthropic = getAnthropicClient();

  const prompt = `You are a QA automation expert. Analyze the following JIRA ticket and acceptance criteria, then generate detailed test scenarios that can be automated using Puppeteer.

TICKET SUMMARY:
${ticketSummary}

TICKET DESCRIPTION:
${ticketDescription}

ACCEPTANCE CRITERIA:
${acceptanceCriteria}

Please extract the test scenarios in the following JSON format. Each scenario should be specific enough to be automated:

{
  "summary": "Brief summary of what needs to be tested",
  "scenarios": [
    {
      "description": "Human-readable description of the test",
      "action": "The action to perform (e.g., 'click', 'check_style', 'check_text', 'check_visibility', 'navigate', 'hover', 'fill_input')",
      "target": "CSS selector or element identifier to interact with (e.g., '#blue-button', '.submit-btn', '[data-testid=\"header\"]')",
      "expectedResult": "What should happen or what should be verified (e.g., 'background-color should be yellow', 'element should be visible', 'text should contain \"Success\"')"
    }
  ]
}

IMPORTANT:
1. For color changes, use "check_style" action and specify the CSS property and expected value
2. Use specific CSS selectors (IDs, classes, data-testid attributes)
3. Break down complex criteria into multiple atomic test scenarios
4. Be specific about expected results (exact colors, text, visibility states)
5. If the criteria mentions specific element IDs or classes, use them in the target

Return ONLY valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    // Extract JSON from response (in case AI adds extra text)
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to parse acceptance criteria: ${error.message}`);
  }
}

/**
 * Generate a human-readable test report
 */
export async function generateTestReport(
  ticketId: string,
  ticketSummary: string,
  testResults: Array<{
    scenario: TestScenario;
    passed: boolean;
    error?: string;
    actualValue?: string;
  }>
): Promise<string> {
  const anthropic = getAnthropicClient();

  const resultsText = testResults
    .map((result, index) => {
      return `Test ${index + 1}: ${result.scenario.description}
Status: ${result.passed ? "✅ PASSED" : "❌ FAILED"}
Action: ${result.scenario.action} on "${result.scenario.target}"
Expected: ${result.scenario.expectedResult}
${result.actualValue ? `Actual: ${result.actualValue}` : ""}
${result.error ? `Error: ${result.error}` : ""}
`;
    })
    .join("\n");

  const prompt = `Generate a professional QA test report for this JIRA ticket:

TICKET: ${ticketId}
SUMMARY: ${ticketSummary}

TEST RESULTS:
${resultsText}

Please create a concise, professional test report that includes:
1. Overall test status (PASSED/FAILED)
2. Summary of results
3. Details for failed tests (if any)
4. Recommendations (if any tests failed)

Keep it brief and actionable.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    return content.text;
  } catch (error: any) {
    throw new Error(`Failed to generate test report: ${error.message}`);
  }
}

