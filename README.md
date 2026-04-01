# nuxtblog-plugin-reading-time

Calculates estimated reading time and injects a small indicator into rendered post content.

[中文文档](README.zh.md)

## What it does

- Intercepts `filter:content.render`
- Counts CJK characters and Latin words separately, using configurable reading speeds
- Injects an HTML snippet at the top (or bottom) of the content on every render — no database writes

## Settings

| Key | Type | Default | Description |
|---|---|---|---|
| `cn_cpm` | number | `400` | CJK characters read per minute |
| `en_wpm` | number | `200` | English words read per minute |
| `label` | string | `预计阅读` | Text shown before the time value |
| `unit` | string | `分钟` | Time unit label (e.g. `min`) |
| `less_than_one` | string | `不足 1 分钟` | Text shown when reading time is under 1 minute |
| `position` | select | `top` | Where to inject: `top` or `bottom` |
| `only_posts` | boolean | `true` | When enabled, pages are skipped |

## Output

A small inline-styled div is injected — no external CSS required:

```html
<div class="reading-time-tip" style="...">
  <svg><!-- clock icon --></svg>
  <span>预计阅读：3 分钟</span>
</div>
```

You can target `.reading-time-tip` in your theme CSS to override the style.

## Installation

```bash
pnpm install
pnpm build
zip plugin.zip package.json index.js
```

Upload the ZIP in the admin panel under **Plugins → Install**.
