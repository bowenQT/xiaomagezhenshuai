---
name: mvp-orchestrator
description: |
  从想法到 MVP 产品的全流程技能编排器。自动调度 planning-with-files、frontend-design、git-workflow 等技能。
  在以下场景触发：
  - "帮我从想法做一个 MVP"
  - "开始一个新项目"
  - "端到端构建产品"
  - 任何需要多阶段、多技能协作的产品开发任务
---

# MVP Orchestrator

统一调度工作区内所有技能，完成从**想法**到**可运行 MVP 产品**的全流程开发。

## Workflow Pipeline

```
想法输入 → 规划 → 设计与实现 → 代码审查 → 版本控制 → (可选) 技能迭代
```

| 阶段 | 调度技能 | 核心产出 |
|------|----------|----------|
| 1. 规划 | `planning-with-files` | `task_plan.md`, `findings.md` |
| 2. 设计与实现 | `frontend-design` | HTML/CSS/JS 或 React 组件 |
| 3. 代码审查 | `code-review` | 结构化审查反馈 (Critical/Major/Minor) |
| 4. 版本控制 | `git-workflow` | 规范化 Git Commit & Branch |
| 5. 迭代扩展 | `skill-creator` | 新技能或现有技能更新 |

## 调度逻辑

### 1. 意图解析

根据用户输入判断当前所需阶段：

| 关键词 | 阶段 | 动作 |
|--------|------|------|
| 规划, 研究, 分析, 复杂任务 | 规划 | 加载 `planning-with-files` |
| UI, 页面, 前端, 设计, 落地页 | 设计 | 加载 `frontend-design` |
| 审查, review, 代码质量, bug | 审查 | 加载 `code-review` |
| 提交, 分支, PR, commit | 版本控制 | 加载 `git-workflow` |
| 新技能, 扩展 skill | 迭代 | 加载 `skill-creator` |

### 2. Pipeline 模式

对于端到端请求（如 "从头做一个落地页 MVP"），按顺序执行：

1. **规划**：调用 `planning-with-files`，生成 `task_plan.md`。
2. **设计**：读取规划产出，调用 `frontend-design` 生成代码。
3. **审查**：调用 `code-review`，检查代码质量并输出结构化反馈。
4. **提交**：调用 `git-workflow`，遵循 Conventional Commits 规范提交。

### 3. 上下文传递

确保各阶段产出在 Pipeline 中流转：
- 规划阶段的 `task_plan.md` 作为设计阶段的输入。
- 设计阶段产出的文件路径作为 Git 提交的 scope。

## 技能注册表

详见 [references/skill_registry.md](references/skill_registry.md)。

## 使用示例

```
用户: 帮我做一个产品落地页 MVP
Agent:
  1. [规划] 创建 task_plan.md，拆解阶段
  2. [设计] 调用 frontend-design，生成落地页 HTML/CSS
  3. [提交] 调用 git-workflow，提交 feat(landing): add landing page
```
