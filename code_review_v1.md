# V1.1-V1.3 代码审查报告

**审查范围**: V1.1 社交货币 + V1.2 余烬星空 + V1.3 感官沉浸
**审查时间**: 2026-01-15

---

## Critical Issues 🚨

### 1. Supabase Anon Key 硬编码在前端代码中

**文件**: [supabase.js](file:///Users/zhongbowen/Desktop/claude-project/xiaomagezhenshuai/src/supabase.js#L6-L7)

```javascript
const SUPABASE_URL = 'https://czlogfefraonwopbumyi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

**Why**: Anon Key 虽然可以公开（仅限 RLS 允许的操作），但直接硬编码在源码中不符合最佳实践。

**Suggestion**:
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## Major Issues ⚠️

### 2. WebSocket 实时订阅缺少错误处理和重连

**文件**: [supabase.js#L73-L97](file:///Users/zhongbowen/Desktop/claude-project/xiaomagezhenshuai/src/supabase.js#L73-L97)

**Suggestion**: 添加 `onerror`、`onclose` 和自动重连逻辑。

---

### 3. TTS API 缺少内容过滤

**文件**: [tts.js#L25](file:///Users/zhongbowen/Desktop/claude-project/xiaomagezhenshuai/api/tts.js#L25)

**Suggestion**: 添加敏感词过滤或内容审核。

---

### 4. EmberSky 动画循环未在销毁时停止

**文件**: [ember-sky.js#L227-L232](file:///Users/zhongbowen/Desktop/claude-project/xiaomagezhenshuai/src/ember-sky.js#L227-L232)

**Suggestion**: 添加 `isDestroyed` 标志，在 `animate()` 中检查。

---

## Minor Issues 📝

| 问题 | 文件 | 建议 |
|------|------|------|
| 硬编码 voice_type | tts.js | 提取为常量 |
| Magic Number (60分钟) | ember-sky.js | 提取为常量 |
| 未使用的 index 参数 | ember-sky.js | 移除 |
| JSON 解析 fallback | reply.js | 增强鲁棒性 |

---

## Positive Notes ✅

- 良好的错误处理和 fallback 逻辑
- EmberSky 类结构清晰
- 使用常量映射提高可读性
- Supabase RLS 已启用

---

## Summary

| 🚨 Critical | ⚠️ Major | 📝 Minor | ✅ Positive |
|-------------|----------|----------|-------------|
| 1 | 3 | 4 | 6 |

**建议**: 优先修复 Supabase 密钥硬编码和 WebSocket 重连机制。
