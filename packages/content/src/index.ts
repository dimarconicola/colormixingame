export { DEFAULT_GAME_CONTENT } from "./default-content.js";
export {
  createChallengeTemplate,
  createPackTemplate,
  parseAuthoringMode,
  parseChallengeDifficulty,
  type AuthoringMode
} from "./authoring.js";
export * from "./schema.js";
export { assertValidGameContent, formatValidationIssues, validateGameContent } from "./validate.js";
