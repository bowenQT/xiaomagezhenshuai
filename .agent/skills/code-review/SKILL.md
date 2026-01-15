---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
---

# Code Review Skill

When reviewing code, follow these steps. For Google-grade engineering standards, see [references/google_eng_practices.md](references/google_eng_practices.md).


## Review Checklist

1. **Correctness**: Does the code do what it's supposed to?
2. **Edge cases**: Are error conditions handled?
3. **Style**: Does it follow project conventions?
4. **Performance**: Are there obvious inefficiencies?
5. **Security**: Are there potential vulnerabilities?
6. **Maintainability**: Is the code easy to understand and modify?

## How to Provide Feedback

- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible
- Prioritize issues by severity (critical, major, minor)
- Acknowledge good patterns and improvements

## Review Process

### 1. Understand the Context
- Read the PR description or commit message
- Identify the purpose of the changes
- Check related issues or tickets

### 2. Analyze the Code
- Review logic and algorithm correctness
- Check for potential bugs and edge cases
- Verify error handling and input validation
- Assess code organization and structure

### 3. Check Style and Conventions
- Ensure consistent naming conventions
- Verify proper code formatting
- Check for appropriate comments and documentation
- Validate adherence to project style guides

### 4. Evaluate Quality
- Look for code duplication
- Identify overly complex logic
- Check for proper abstraction levels
- Assess test coverage

### 5. Provide Structured Feedback

Format feedback as:

```markdown
## Critical Issues
- [Issue description with line reference]
  - Why: [Explanation]
  - Suggestion: [Proposed fix]

## Major Issues
- [Issue description]

## Minor Issues / Suggestions
- [Issue description]

## Positive Notes
- [Good patterns observed]
```

## Common Anti-Patterns to Watch For

- Magic numbers without constants
- Deeply nested conditionals
- Large functions doing multiple things
- Missing error handling
- Hardcoded values that should be configurable
- Inconsistent naming conventions
- Missing or inadequate tests
- Security vulnerabilities (SQL injection, XSS, etc.)
