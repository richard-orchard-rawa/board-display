import { useEffect, useState } from "react"
import { useApi } from "../useApi"

type Health = "complete" | "pending" | "nearly" | "overdue"
interface Okrs {
  mock?: boolean
  groups: {
    name: string
    results: { text: string; target: string | null; status: string; health: Health }[]
  }[]
}

const COLOURS: Record<Health, string> = {
  complete: "var(--rawa-success)",
  pending: "var(--rawa-grey-300)",
  nearly: "var(--rawa-warning)",
  overdue: "var(--rawa-error)",
}
// Same wording as the Health column in the workbook.
const LABELS: Record<Health, string> = { complete: "Complete", pending: "Pending", nearly: "Nearly Due", overdue: "Overdue" }

const PAGE_SIZE = 4

// Kept at module level so each visit to the slide shows the next page of key results.
let cursor = 0

export function OkrSlide() {
  const { data, error } = useApi<Okrs>("/api/okrs")
  const [shown] = useState(cursor)
  useEffect(() => {
    cursor++
  }, [])

  if (!data) return <h1>{error ? "Success metrics are unavailable." : "Loading."}</h1>

  // Pages never span two problems, so every page can be headed with its Problem Name.
  const pages = data.groups.flatMap((g) => {
    const n = Math.ceil(g.results.length / PAGE_SIZE)
    return Array.from({ length: n }, (_, i) => ({
      name: g.name,
      part: n > 1 ? `${i + 1} of ${n}` : "",
      rows: g.results.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
    }))
  })
  const page = pages[shown % (pages.length || 1)]
  if (!page) return <h1>No success metrics to show.</h1>

  return (
    <>
      <div>
        <div className="tag">Digital Team objectives{data.mock && " · sample data"}</div>
        <h1>
          {page.name}
          {page.part && <span className="dim okr-part"> · {page.part}</span>}
        </h1>
      </div>
      <section className="card okr-table">
        <div className="okr-row okr-head">
          <span>Key result / performance indicator</span>
          <span>Current status</span>
          <span>Health</span>
        </div>
        {page.rows.map((r, i) => (
          <div key={i} className="okr-row">
            <span className="okr-text">{r.text}</span>
            <span>{r.status}</span>
            <span className="okr-health">
              <i className="dot" style={{ background: COLOURS[r.health] }} />
              {LABELS[r.health]}
            </span>
          </div>
        ))}
      </section>
    </>
  )
}
