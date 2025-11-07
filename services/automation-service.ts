import puppeteer, { Browser, Page } from "puppeteer";
import { TestScenario } from "./ai-service";

export interface TestResult {
  scenario: TestScenario;
  passed: boolean;
  error?: string;
  actualValue?: string;
  screenshot?: string;
}

/**
 * Launch Puppeteer browser
 */
async function launchBrowser(): Promise<Browser> {
  const debug = process.env.DEBUG_PUPPETEER === "true";
  
  return await puppeteer.launch({
    headless: !debug, // Show browser if debug mode is on
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });
}

/**
 * Execute a single test scenario
 */
async function executeScenario(
  page: Page,
  scenario: TestScenario
): Promise<TestResult> {
  try {
    const { action, target, expectedResult } = scenario;

    switch (action.toLowerCase()) {
      case "check_style": {
        // Check CSS style property
        const element = await page.$(target);
        if (!element) {
          return {
            scenario,
            passed: false,
            error: `Element "${target}" not found`,
          };
        }

        // Extract property name and expected value from expectedResult
        // Format: "background-color should be yellow" or "color should be rgb(255, 255, 0)"
        const match = expectedResult.match(/([a-z-]+)\s+should\s+be\s+(.+)/i);
        if (!match) {
          return {
            scenario,
            passed: false,
            error: `Could not parse expected result format. Use: "property-name should be value"`,
          };
        }

        const [, property, expectedValue] = match;
        const actualValue = await page.evaluate(
          (el, prop) => {
            return window.getComputedStyle(el).getPropertyValue(prop);
          },
          element,
          property.trim()
        );

        // Normalize color values for comparison
        const normalizedActual = normalizeColorValue(actualValue.trim());
        const normalizedExpected = normalizeColorValue(expectedValue.trim());

        const passed = normalizedActual === normalizedExpected;

        return {
          scenario,
          passed,
          actualValue: actualValue.trim(),
          error: passed
            ? undefined
            : `Expected ${property} to be "${expectedValue}", but got "${actualValue}"`,
        };
      }

      case "click": {
        const element = await page.$(target);
        if (!element) {
          return {
            scenario,
            passed: false,
            error: `Element "${target}" not found`,
          };
        }

        await element.click();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for any animations

        return {
          scenario,
          passed: true,
        };
      }

      case "check_text": {
        const element = await page.$(target);
        if (!element) {
          return {
            scenario,
            passed: false,
            error: `Element "${target}" not found`,
          };
        }

        const actualText = await page.evaluate((el) => el.textContent, element);
        const expectedText = expectedResult.replace(/text should (?:contain|be) "?(.+?)"?/i, "$1");

        const passed = actualText?.includes(expectedText) || actualText === expectedText;

        return {
          scenario,
          passed,
          actualValue: actualText || "",
          error: passed
            ? undefined
            : `Expected text to contain "${expectedText}", but got "${actualText}"`,
        };
      }

      case "check_visibility": {
        const element = await page.$(target);
        const isVisible = element !== null;

        const shouldBeVisible = expectedResult.toLowerCase().includes("visible");

        const passed = isVisible === shouldBeVisible;

        return {
          scenario,
          passed,
          actualValue: isVisible ? "visible" : "not visible",
          error: passed
            ? undefined
            : `Expected element to be ${shouldBeVisible ? "visible" : "hidden"}`,
        };
      }

      case "navigate": {
        const url = expectedResult.replace(/navigate to "?(.+?)"?/i, "$1");
        await page.goto(url, { 
          waitUntil: "domcontentloaded", 
          timeout: 60000 
        });
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          scenario,
          passed: true,
        };
      }

      case "hover": {
        const element = await page.$(target);
        if (!element) {
          return {
            scenario,
            passed: false,
            error: `Element "${target}" not found`,
          };
        }

        await element.hover();
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
          scenario,
          passed: true,
        };
      }

      case "fill_input": {
        const element = await page.$(target);
        if (!element) {
          return {
            scenario,
            passed: false,
            error: `Element "${target}" not found`,
          };
        }

        const value = expectedResult.replace(/fill with "?(.+?)"?/i, "$1");
        await element.type(value);

        return {
          scenario,
          passed: true,
        };
      }

      default:
        return {
          scenario,
          passed: false,
          error: `Unknown action: ${action}`,
        };
    }
  } catch (error: any) {
    return {
      scenario,
      passed: false,
      error: error.message,
    };
  }
}

/**
 * Normalize color values for comparison (convert named colors to RGB, handle different formats)
 */
function normalizeColorValue(color: string): string {
  const lowerColor = color.toLowerCase().trim();

  // Color name to RGB mapping (common colors)
  const colorMap: { [key: string]: string } = {
    yellow: "rgb(255, 255, 0)",
    blue: "rgb(0, 0, 255)",
    red: "rgb(255, 0, 0)",
    green: "rgb(0, 128, 0)",
    white: "rgb(255, 255, 255)",
    black: "rgb(0, 0, 0)",
    gray: "rgb(128, 128, 128)",
    grey: "rgb(128, 128, 128)",
    orange: "rgb(255, 165, 0)",
    purple: "rgb(128, 0, 128)",
    pink: "rgb(255, 192, 203)",
    brown: "rgb(165, 42, 42)",
    cyan: "rgb(0, 255, 255)",
    magenta: "rgb(255, 0, 255)",
  };

  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }

  // Convert rgba to rgb (remove alpha channel)
  if (lowerColor.startsWith("rgba")) {
    const match = lowerColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    }
  }

  // Normalize rgb spacing
  if (lowerColor.startsWith("rgb")) {
    const match = lowerColor.match(/rgb\((\d+),?\s*(\d+),?\s*(\d+)\)/);
    if (match) {
      return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    }
  }

  // Convert hex to RGB
  if (lowerColor.startsWith("#")) {
    const hex = lowerColor.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return lowerColor;
}

/**
 * Run all test scenarios on the given portal URL
 */
export async function runTests(
  portalUrl: string,
  scenarios: TestScenario[]
): Promise<TestResult[]> {
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to portal
    console.log(`Navigating to ${portalUrl}...`);
    await page.goto(portalUrl, { 
      waitUntil: "domcontentloaded", 
      timeout: 60000 
    });
    
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Execute each scenario
    const results: TestResult[] = [];
    for (const scenario of scenarios) {
      console.log(`Executing: ${scenario.description}`);
      const result = await executeScenario(page, scenario);
      results.push(result);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  } catch (error: any) {
    console.error("Browser automation error details:", error);
    throw new Error(`Browser automation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

