import { useEffect, useState } from "react"
import { useApi } from "../useApi"
import { PAGE_SECONDS, okrPages, type Health, type Okrs } from "./okrPages"

const COLOURS: Record<Health, string> = {
  complete: "var(--rawa-success)",
  pending: "var(--rawa-grey-300)",
  nearly: "var(--rawa-warning)",
  overdue: "var(--rawa-error)",
}
// Same wording as the Health column in the workbook.
const LABELS: Record<Health, string> = { complete: "Complete", pending: "Pending", nearly: "Nearly Due", overdue: "Overdue" }

// Steps through every page of key results; App keeps this slide up for pages x PAGE_SECONDS.
export function OkrSlide() {
  const { data, error } = useApi<Okrs>("/api/okrs")
  const [n, setN] = useState(0)
  const pages = okrPages(data)
  const count = pages.length

  useEffect(() => {
    if (count < 2) return
    const id = setInterval(() => setN((v) => v + 1), PAGE_SECONDS * 1000)
    return () => clearInterval(id)
  }, [count])

  if (!data) return <h1>{error ? "Success metrics are unavailable." : "Loading."}</h1>
  const page = pages[n % (count || 1)]
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
      <section className="card okr-table" key={n % count}>
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
