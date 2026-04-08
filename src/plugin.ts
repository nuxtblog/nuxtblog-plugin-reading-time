/// <reference types="@nuxtblog/plugin-sdk" />

// ── CJK detection ───────────────────────────────────────────────────────

function isCJK(code: number): boolean {
  return (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf)
}

function countCJK(text: string): number {
  let count = 0
  for (let i = 0; i < text.length; i++) {
    if (isCJK(text.charCodeAt(i))) count++
  }
  return count
}

function countEnWords(text: string): number {
  const matches = text.match(/[a-zA-Z0-9]+/g)
  return matches ? matches.length : 0
}

// ── Filter handler ──────────────────────────────────────────────────────

function filterContentRender(fc: FilterContext<FilterContentRenderData>): void {
  // only apply to posts by default
  let onlyPosts = ctx.settings.get("only_posts")
  if (onlyPosts === undefined || onlyPosts === null) onlyPosts = true
  if (onlyPosts) {
    const contentType = fc.data.type || ""
    if (contentType !== "post") return
  }

  const html = fc.data.content || ""
  if (!html) return

  // read settings
  const cnCpm = (ctx.settings.get("cn_cpm") as number) || 400
  const enWpm = (ctx.settings.get("en_wpm") as number) || 200
  const label = (ctx.settings.get("label") as string) || "预计阅读"
  const unit = (ctx.settings.get("unit") as string) || "分钟"
  const lessThanOne = (ctx.settings.get("less_than_one") as string) || "不足 1 分钟"
  const position = (ctx.settings.get("position") as string) || "top"

  // count characters
  const cnChars = countCJK(html)
  const enWords = countEnWords(html)

  // calculate reading time (minutes)
  const minutes = cnChars / cnCpm + enWords / enWpm

  // format display text
  let timeText: string
  if (minutes < 1) {
    timeText = lessThanOne
  } else {
    timeText = label + " " + Math.ceil(minutes) + " " + unit
  }

  // build HTML tip block
  const tip = '<div class="reading-time" style="color:#666;font-size:14px;margin:12px 0;display:flex;align-items:center;gap:6px;">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"></circle>' +
    '<polyline points="12 6 12 12 16 14"></polyline>' +
    '</svg>' +
    '<span>' + timeText + '</span>' +
    '</div>'

  // inject into content
  if (position === "bottom") {
    fc.data.content = html + tip
  } else {
    fc.data.content = tip + html
  }
}

// ── Plugin export ───────────────────────────────────────────────────────

module.exports = {
  activate() {
    ctx.log.info("Reading Time plugin activated (JS)")
  },

  deactivate() {},

  filters: [
    {
      event: "filter:content.render" as const,
      handler(fc: FilterContext<FilterContentRenderData>) { filterContentRender(fc) },
    },
  ],
} satisfies PluginExports
