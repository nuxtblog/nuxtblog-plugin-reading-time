# nuxtblog-plugin-reading-time

在文章渲染时自动计算并注入阅读时间提示。

[English](README.md)

## 功能

- 拦截 `filter:content.render`
- 分别统计中文字符数和英文单词数，按独立速度计算阅读时长
- 每次渲染时在内容顶部（或底部）注入 HTML 片段，不写入数据库

## 设置

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `cn_cpm` | number | `400` | 中文阅读速度（字/分钟） |
| `en_wpm` | number | `200` | 英文阅读速度（词/分钟） |
| `label` | string | `预计阅读` | 时间前显示的文本 |
| `unit` | string | `分钟` | 时间单位，如改为英文可填 `min` |
| `less_than_one` | string | `不足 1 分钟` | 不足 1 分钟时的显示文案 |
| `position` | select | `top` | 注入位置：`top`（顶部）或 `bottom`（底部） |
| `only_posts` | boolean | `true` | 开启后仅对文章生效，页面（page）不显示 |

## 输出示例

注入的 HTML 片段使用内联样式，不依赖外部 CSS：

```html
<div class="reading-time-tip" style="...">
  <svg><!-- 时钟图标 --></svg>
  <span>预计阅读：3 分钟</span>
</div>
```

如需自定义样式，可在主题 CSS 中覆盖 `.reading-time-tip`。

## 安装

```bash
pnpm install
pnpm build
zip plugin.zip package.json index.js
```

在管理后台 **插件 → 安装** 上传 ZIP 文件即可。
