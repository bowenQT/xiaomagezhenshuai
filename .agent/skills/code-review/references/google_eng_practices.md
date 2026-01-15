# Google Engineering Best Practices

本文档记录 Google 工程实践中的核心代码审查标准，供 code-review 技能参考。

## The Standard of Code Review

> "The primary purpose of code review is to make sure that the overall code health of Google's code base is improving over time."
> 
> — Google Engineering Practices

### Key Principles

1. **Reviewers should favor approving a CL once it is in a state where it definitely improves the overall code health of the system being worked on, even if the CL isn't perfect.**

2. **There is no such thing as "perfect" code—there is only better code.**

3. **A reviewer should not seek perfection but should seek continuous improvement.**

## What to Look for in a Code Review

### Design
- Is the code well-designed and appropriate for your system?
- Does this change belong in your codebase, or in a library?
- Does it integrate well with the rest of your system?

### Functionality
- Does this code do what the developer intended?
- Is what the developer intended good for the users of this code?
- What is the expected behavior for users?

### Complexity
- Is the code more complex than it should be?
- Can another developer easily understand and use this code when they come across it in the future?
- **"Best code is no code"** — Could this functionality be achieved with less code?

### Tests
- Does the code have correct, well-designed automated tests?
- Will the tests actually fail when the code is broken?
- Are there any "Flaky Tests"? (Google 痛恨不稳定的测试)

### Naming
- Did the developer choose clear names for variables, classes, methods, etc.?

### Comments
- Are the comments clear and useful?
- Do they explain **why** rather than **what**?

### Style
- Does the code follow the appropriate style guides?
- For Google: Go Style Guide, TypeScript Style Guide, Python Style Guide

### Documentation
- Did the developer also update relevant documentation?

## Speed of Code Reviews

> "At Google, we optimize for the speed at which a team of developers can produce a product together, as opposed to optimizing for the speed at which an individual developer can write code."

### Response Time
- **One business day is the maximum time it should take to respond** to a code review request.
- If you are too busy, let the author know when you will get to it.

## How to Write Code Review Comments

### Summary
- **Be kind.**
- **Explain your reasoning.**
- **Balance giving explicit directions with just pointing out problems and letting the developer decide.**
- **Encourage developers to simplify code or add code comments instead of just explaining the complexity to you.**

### Courtesy
- "Consider..." instead of "You should..."
- "What do you think about...?" instead of "Change this to..."
- Acknowledge good code: "Nice refactoring!" or "Good catch on this edge case."

## Resolving Conflicts

If there is a conflict between the developer and reviewer:
1. **First, try to come to consensus based on the contents of this document and other guidance.**
2. **If that doesn't resolve the issue, have a face-to-face meeting or video call.**
3. **If that still doesn't work, escalate to a broader team discussion.**

---

**Reference**: [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
