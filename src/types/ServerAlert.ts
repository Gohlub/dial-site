export interface ServerAlert {
  id: number
  class: 'warning' | 'danger' | 'info'
  content: string
  start_time: number
  end_time: number
  dismissed: boolean
}

