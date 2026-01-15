# 未发送信件焚烧炉 - 设计与技术发现

## 美学方向

**主题**：Dark Ethereal（深空幽暗 / 灵域）

| 维度 | 决策 |
|------|------|
| **色彩** | 深海军蓝-黑底 `#0a0e17`，琥珀金火焰 `#f59e0b` / `#ea580c`，灰烬白 `#e5e7eb` |
| **字体** | 标题：Cormorant Garamond（古典庄重）；正文：Noto Sans SC（中文优雅） |
| **动效** | 火焰粒子系统（Canvas）+ 文字逐字碳化（CSS filter） |
| **交互** | 长按 1.5s 触发焚烧，环形进度反馈 |
| **氛围** | 漂浮暗粒子背景，营造深夜静谧感 |

## 情绪曲线

```
输入（宣泄） → 释放（焚烧仪式） → 治愈（回信）
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 核心 | HTML + Vanilla CSS + JavaScript |
| 火焰动画 | `<canvas>` 2D 粒子系统 |
| AI 能力 | `@bowenqt/qiniu-ai-sdk` |
| 字体 | Google Fonts: Cormorant Garamond, Noto Sans SC |

## 核心组件

1. **InputSection** - 文本输入 + 字符计数
2. **CremationSection** - Canvas 火焰 + 长按触发
3. **ReplySection** - 信封动画 + AI 回信展示

## API 集成

```javascript
import { createQiniuAI } from '@bowenqt/qiniu-ai-sdk';
const ai = createQiniuAI({ apiKey: 'xxx' });
const reply = await ai.chat.generate({ prompt: `...` });
```

## 关键设计决策

1. **仪式感 > 速度**：长按而非点击，增强情绪释放体验
2. **文字保留**：焚烧视觉删除，但内容传给 AI 生成回信
3. **单页应用**：无路由，三段式垂直滚动布局
