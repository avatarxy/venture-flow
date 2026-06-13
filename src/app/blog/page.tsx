import { Search, Clock, BookOpen, Tag, ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { articles } from "./data"

const categories = Array.from(new Set(articles.map((a) => a.category)))

/* 最新文章（按日期排） */
const latest = [...articles].sort((a, b) => b.date.localeCompare(a.date))

/* ------------------------------------------------------------------ */
/* 页面                                                               */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* ───── Hero ───── */}
      <section className="mb-12 space-y-4 text-center">
        <div className="inline-flex rounded-full border border-[var(--color-border-interactive)] px-3 py-1 text-xs text-muted-foreground">
          洞察 · 实践 · 技术
        </div>
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
          VentureFlow <span className="text-[var(--color-gold)]">博客</span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
          关于 AI 生成式应用开发、产品方法论与行业趋势的深度内容。
        </p>
        {/* 搜索 */}
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            placeholder="搜索文章……"
            className="h-10 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
        {/* ───── 文章列表 ───── */}
        <section className="space-y-8">
          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 py-1 text-xs text-[var(--color-ink-light)]"
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="rounded-full border border-border bg-[rgba(252,251,248,0.45)] px-3 py-1 text-xs text-muted-foreground transition hover:border-[var(--color-border-interactive)] hover:text-foreground"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 文章卡片 */}
          <div className="space-y-6">
            {latest.map((article) => (
              <article
                key={article.slug}
                className="group grid overflow-hidden rounded-xl border border-border bg-[rgba(252,251,248,0.45)] transition hover:border-[var(--color-border-interactive)] hover:shadow-[rgba(28,28,28,0.04)_0_8px_24px] md:grid-cols-[280px_1fr]"
              >
                {/* 配图 */}
                <Link href={`/blog/${article.slug}`} className="block overflow-hidden">
                  <div
                    className="aspect-[16/10] bg-cover bg-center transition duration-500 group-hover:scale-105 md:aspect-auto md:h-full"
                    style={{ backgroundImage: `url(${article.imageUrl})` }}
                  >
                    <span className="sr-only">{article.imageCredit}</span>
                  </div>
                </Link>

                {/* 内容 */}
                <div className="flex flex-col p-5 md:p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded border border-border px-2 py-0.5">{article.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {article.readTime}
                    </span>
                    <span>{article.date}</span>
                  </div>

                  <h2 className="mt-3 text-lg font-semibold leading-snug transition group-hover:text-[var(--color-gold)]">
                    <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <span key={tag} className="rounded bg-[var(--color-gold-subtle)] px-2 py-0.5 text-[10px] text-[var(--color-gold)]">
                          <Tag className="mr-0.5 inline size-2.5" aria-hidden="true" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      阅读全文
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ───── 侧边栏 ───── */}
        <aside className="space-y-6">
          {/* 分类统计 */}
          <div className="rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-5">
            <h3 className="mb-3 text-sm font-semibold">文章分类</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat}>
                  <a href="#" className="flex items-center justify-between text-muted-foreground transition hover:text-foreground">
                    <span>{cat}</span>
                    <span className="rounded bg-[var(--color-gold-light)] px-2 py-0.5 text-[10px] text-[var(--color-gold)]">
                      {articles.filter((a) => a.category === cat).length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 热门标签 */}
          <div className="rounded-xl border border-border bg-[rgba(252,251,248,0.45)] p-5">
            <h3 className="mb-3 text-sm font-semibold">热门标签</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(articles.flatMap((a) => a.tags))).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-[var(--color-border-interactive)] hover:text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 订阅 */}
          <div className="rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold-subtle)] p-5 text-center">
            <BookOpen className="mx-auto mb-3 size-6 text-[var(--color-gold)]" aria-hidden="true" />
            <h3 className="text-sm font-semibold">订阅博客</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              每周获取 AI 生成式开发的最新洞察。
            </p>
            <input
              type="email"
              placeholder="输入邮箱"
              className="mt-4 h-9 w-full rounded-lg border border-border bg-[rgba(252,251,248,0.55)] px-3 text-xs text-foreground outline-none placeholder:text-[#8c8c88] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
            <button
              type="button"
              className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-gold)] text-xs font-semibold text-[var(--color-ink-light)] shadow-[var(--shadow-button-gold-inset)] transition hover:bg-[var(--color-gold-hover)]"
            >
              订阅
              <ArrowRight className="size-3" />
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
