// ─────────────────────────────────────────────────────────────────────────────
// reading-time
//
// filter:content.render 拦截，根据正文字数计算阅读时间，
// 在内容顶部（或底部）注入一段 HTML 提示块。
// ─────────────────────────────────────────────────────────────────────────────

// ── 读取设置 ──────────────────────────────────────────────────────────────

function getCnCpm(): number {
  const v = nuxtblog.settings.get("cn_cpm");
  const n = Number(v ?? 400);
  return isNaN(n) || n <= 0 ? 400 : n;
}

function getEnWpm(): number {
  const v = nuxtblog.settings.get("en_wpm");
  const n = Number(v ?? 200);
  return isNaN(n) || n <= 0 ? 200 : n;
}

function getLabel(): string {
  const v = nuxtblog.settings.get("label");
  return typeof v === "string" && v.length > 0 ? v : "预计阅读";
}

function getUnit(): string {
  const v = nuxtblog.settings.get("unit");
  return typeof v === "string" && v.length > 0 ? v : "分钟";
}

function getLessThanOne(): string {
  const v = nuxtblog.settings.get("less_than_one");
  return typeof v === "string" && v.length > 0 ? v : "不足 1 分钟";
}

function getPosition(): string {
  const v = nuxtblog.settings.get("position");
  return v === "bottom" ? "bottom" : "top";
}

function isOnlyPosts(): boolean {
  const v = nuxtblog.settings.get("only_posts");
  // default true
  return v !== false && v !== "false" && v !== 0;
}

// ── 核心计算 ──────────────────────────────────────────────────────────────

/**
 * 统计中文字符数和英文单词数，返回估算阅读分钟数（最小 0，不四舍五入）。
 */
function calcReadingMinutes(content: string, cnCpm: number, enWpm: number): number {
  if (!content) return 0;

  // 中文字符（CJK 统一表意文字 + 扩展区）
  const cnChars = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // 去掉中文后，统计英文单词
  const latinText = content.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, " ");
  const enWords = (latinText.match(/[a-zA-Z0-9]+(?:['\-][a-zA-Z0-9]+)*/g) || []).length;

  return cnChars / cnCpm + enWords / enWpm;
}

/**
 * 将分钟数格式化为可读字符串。
 *   < 1min  → less_than_one 文案
 *   >= 1min → 向上取整，追加单位
 */
function formatMinutes(minutes: number, unit: string, lessThanOne: string): string {
  if (minutes < 1) return lessThanOne;
  return `${Math.ceil(minutes)} ${unit}`;
}

/**
 * 构建注入的 HTML 片段（使用内联样式，不依赖外部 CSS）。
 */
function buildHtml(label: string, timeText: string): string {
  return (
    `<div class="reading-time-tip" style="display:flex;align-items:center;gap:0.4em;` +
    `font-size:0.875em;color:#6b7280;margin-bottom:1.25em;padding:0.5em 0;` +
    `border-bottom:1px solid #e5e7eb;">` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" ` +
    `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>` +
    `</svg>` +
    `<span>${label}：${timeText}</span>` +
    `</div>`
  );
}

// ── filter:content.render ─────────────────────────────────────────────────

nuxtblog.filter("content.render", (ctx) => {
  const onlyPosts = isOnlyPosts();
  if (onlyPosts && ctx.data.type !== "post") return;

  if (!ctx.data.content?.trim()) return;

  const cnCpm = getCnCpm();
  const enWpm = getEnWpm();
  const label = getLabel();
  const unit = getUnit();
  const lessThanOne = getLessThanOne();
  const position = getPosition();

  const minutes = calcReadingMinutes(ctx.data.content, cnCpm, enWpm);
  const timeText = formatMinutes(minutes, unit, lessThanOne);
  const html = buildHtml(label, timeText);

  if (position === "bottom") {
    ctx.data.content = ctx.data.content + "\n\n" + html;
  } else {
    ctx.data.content = html + "\n\n" + ctx.data.content;
  }

  nuxtblog.log.debug(
    `[reading-time] "${ctx.data.title}" → ${timeText} (${Math.ceil(minutes * cnCpm + minutes * enWpm)} 字符/词)`
  );
});
