import { DEFAULT_GAME_CONTENT } from "./default-content.js";
import { formatValidationIssues, validateGameContent } from "./validate.js";

const issues = validateGameContent(DEFAULT_GAME_CONTENT);

if (issues.length > 0) {
  console.error(`Content validation failed with ${issues.length} issues.`);
  console.error(formatValidationIssues(issues));
  process.exit(1);
}

console.log("Content validation passed.");
