export interface Counter {
  id: string
  value: string
  label: string
}

export interface InfoWithCountersContent {
  title: string
  description: string
  counters: Counter[]
}
