# .agent Directory Structure

This directory contains workspace-specific AI agent configurations, workflows, and skills to enhance local development automation and coordination.

## Structure

- `workflows/`: Markdown files defining specific automated multi-step procedures (e.g., `release.md`, `onboarding.md`).
- `skills/`: Local, workspace-specific skills that follow the standard skill anatomy:
    - `SKILL.md`: Metadata and procedural instructions.
    - `scripts/`: Executable scripts for deterministic tasks.
    - `references/`: Documentation or schemas.

## Guidelines

- **Concise is Key**: Avoid redundancy; only include domain-specific context.
- **Progressive Disclosure**: Structure skills to be loaded efficiently.
- **Safety First**: Ensure all scripts are idempotent and safe to run in the local environment.
