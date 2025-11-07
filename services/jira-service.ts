import JiraApi from "jira-client";
import dotenv from "dotenv";

dotenv.config();

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
  status: string;
  assignee: string | null;
  issueType: string;
  priority: string;
}

/**
 * Extract ticket ID from various formats
 */
export function extractJiraTicketId(input: string): string | null {
  const regex = /([A-Z]{2,}-\d+)/;
  const match = input.match(regex);
  return match ? match[1] : null;
}

/**
 * Initialize JIRA client
 */
function getJiraClient(): JiraApi {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!host || !email || !apiToken) {
    throw new Error(
      "Missing JIRA credentials. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN in your .env file"
    );
  }

  return new JiraApi({
    protocol: "https",
    host: host,
    username: email,
    password: apiToken,
    apiVersion: "2",
    strictSSL: true,
  });
}

/**
 * Extract acceptance criteria from JIRA issue
 */
function extractAcceptanceCriteria(issue: any): string {
  const description = issue.fields.description || "";
  
  // Check customfield_10115 first (known AC field)
  const acField = issue.fields["customfield_10115"];
  if (acField && typeof acField === "string" && acField.trim()) {
    return acField.trim();
  }
  
  // Try other common custom fields for Acceptance Criteria
  const possibleFields = [
    "customfield_10000",
    "customfield_10001",
    "customfield_10002",
    "customfield_10003",
    "customfield_10004",
    "customfield_10005",
    "customfield_10100",
    "customfield_10101",
    "customfield_10102",
  ];
  
  for (const fieldId of possibleFields) {
    const value = issue.fields[fieldId];
    if (value && typeof value === "string" && value.trim()) {
      // Check if it looks like acceptance criteria
      if (
        value.toLowerCase().includes("accept") ||
        value.toLowerCase().includes("criteria") ||
        value.toLowerCase().includes("given") ||
        value.toLowerCase().includes("when") ||
        value.toLowerCase().includes("then")
      ) {
        return value;
      }
    }
  }
  
  // Try to extract from description
  const acRegex = /(?:Acceptance Criteria|AC|A\/C)[\s:]*\n([\s\S]+?)(?:\n\n|\n#{2,}|$)/i;
  const match = description.match(acRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If still not found, look for structured patterns
  const structuredRegex = /(?:Given|When|Then)[\s\S]+/i;
  const structuredMatch = description.match(structuredRegex);
  if (structuredMatch) {
    return structuredMatch[0].trim();
  }
  
  return "No acceptance criteria found";
}

/**
 * Fetch ticket details from JIRA
 */
export async function getJiraTicket(ticketId: string): Promise<JiraTicket> {
  const jira = getJiraClient();
  
  try {
    const issue = await jira.findIssue(ticketId);
    
    return {
      key: issue.key,
      summary: issue.fields.summary || "",
      description: issue.fields.description || "",
      acceptanceCriteria: extractAcceptanceCriteria(issue),
      status: issue.fields.status?.name || "Unknown",
      assignee: issue.fields.assignee?.displayName || null,
      issueType: issue.fields.issuetype?.name || "Unknown",
      priority: issue.fields.priority?.name || "Unknown",
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch JIRA ticket ${ticketId}: ${error.message}`);
  }
}

