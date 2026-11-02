export type Health = "complete" | "pending" | "nearly" | "overdue"
export interface Okrs {
  mock?: boolean
  groups: {
    name: string
    results: { text: string; target: string | null; status: string; health: Health }[]
  }[]
}

export const PAGE_SIZE = 4
// How long each page of key results stays up. The OKR slide stays up for pages x this.
export const PAGE_SECONDS = 20

// Pages never span two problems, so every page can be headed with its Problem Name.
export function okrPages(data: Okrs | null | undefined) {
  return (data?.groups ?? []).flatMap((g) => {
    const n = Math.ceil(g.results.length / PAGE_SIZE)
    return Array.from({ length: n }, (_, i) => ({
      name: g.name,
      part: n > 1 ? `${i + 1} of ${n}` : "",
      rows: g.results.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
    }))
  })
}
