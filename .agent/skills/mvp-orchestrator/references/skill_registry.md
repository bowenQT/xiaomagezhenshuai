# 技能注册表 (Skill Registry)

本文件记录当前工作区内可被 `mvp-orchestrator` 调度的技能。

## 已注册技能

| 技能 | 触发关键词 | 能力范畴 |
|------|------------|----------|
| `planning-with-files` | 规划, 研究, 复杂任务, task_plan, 多步骤 | 基于文件的持久化规划与进度跟踪（Manus 风格） |
| `frontend-design` | UI, 前端, 页面, 设计, React, 落地页 | 高品质、创意驱动的前端界面生成，避免 AI 通用审美 |
| `code-review` | 审查, review, 代码质量, bug, PR | 结构化代码审查，遵循 Google 工程实践标准 |
| `git-workflow` | 提交, 分支, PR, commit, 版本控制 | Git 规范操作（Conventional Commits、分支命名） |
| `skill-creator` | 新技能, 扩展, skill, 创建技能 | 技能创建、校验与打包 |

## 技能路径

所有技能位于工作区的 `.agent/skills/` 目录下：

```text
.agent/skills/
├── frontend-design/
├── git-workflow/
├── mvp-orchestrator/   (本技能)
├── planning-with-files/
└── skill-creator/
```

## 扩展说明

如需新增技能，请使用 `skill-creator` 创建并注册到本表。
