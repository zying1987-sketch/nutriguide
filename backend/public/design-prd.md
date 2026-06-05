# NutriGuide 设计规范 PRD v1.0

## 设计灵感来源

- 参考图1：美容诊所网站（Territory of Beautiful People）— 编辑式排版、圆角卡片网格、编号系统
- 参考图2：The Plenary Co. Labs — 衬线字体混排、温暖米色、弧线装饰、杂志式留白

## 色彩系统

| Token | Hex | 用途 |
|-------|-----|------|
| background | #F5F2EC | 全局暖米色背景 |
| surface | #FFFFFF | 卡片、浮层面板 |
| surface-warm | #F0EBE3 | 次级卡片背景 |
| text-primary | #1A1A1A | 主标题、正文 |
| text-secondary | #6B6560 | 副标题、说明文字 |
| text-muted | #A8A199 | 辅助文字、标签 |
| accent-green | #2D6B4F | 主品牌色（深森绿） |
| accent-green-light | #E8F0EB | 绿色浅背景 |
| accent-terracotta | #C17A5F | 点缀色（赤陶） |
| border | #E5E0D8 | 卡片边框、分割线 |

## 字体系统

- **Display 标题**: `"Noto Serif SC", "Source Han Serif SC", serif` — 大标题、Hero区
- **Heading 标题**: `"Inter", "PingFang SC", "Microsoft YaHei", sans-serif` — 小标题、卡片标题
- **Body 正文**: `"Inter", "PingFang SC", sans-serif` — 正文、说明
- **Label 标签**: `"Inter", sans-serif` — 标签、按钮、小字

## 字号层级

| 层级 | 桌面端 | 行高 | 字重 | 字体 |
|------|--------|------|------|------|
| Display | 64px | 1.1 | 600 | Serif |
| H1 | 48px | 1.15 | 600 | Serif |
| H2 | 36px | 1.2 | 500 | Serif |
| H3 | 24px | 1.3 | 500 | Sans |
| Body | 16px | 1.7 | 400 | Sans |
| Caption | 13px | 1.5 | 400 | Sans |
| Label | 12px | 1.4 | 500 | Sans, uppercase |

## 圆角系统

- 卡片: 24px
- 按钮: 32px (pill shape)
- 图片: 20px
- 小标签: 20px
- 输入框: 12px

## 间距系统

- Section padding: 120px 垂直
- Content max-width: 1200px
- Card gap: 24px
- Inner padding: 32px

## 阴影系统

- 卡片默认: `0 2px 8px rgba(0,0,0,0.04)`
- 卡片悬停: `0 8px 32px rgba(0,0,0,0.08)`
- 浮层: `0 12px 40px rgba(0,0,0,0.12)`

## 布局原则

1. **非对称 Hero**: 左侧文字(55%) + 右侧图片(45%)，文字区靠左对齐
2. **编号卡片网格**: 4 张卡片呈 2×2 排列，每张带右上角编号(01-04)
3. **图片网格展示**: 服务/人群用不同尺寸的圆角图片网格，类似 masonry
4. **弧线装饰**: 页面中可插入 1-2 处大弧线/圆形装饰元素，增添呼吸感
5. **大量留白**: Section 之间保留充足间距，文字行高宽松
