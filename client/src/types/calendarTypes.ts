// src/types/calendarTypes.ts
export interface CalendarEvent {
  id: number
  start_dt: string
  end_dt: string
  all_day: boolean
  title: string
  who: string
  location: string
  notes: string
  is_remote: boolean
  attendance: string
  type: string // Added this line
  priority: string // Added this line
  calendar_id: number
  department_id: number
}

export interface Calendar {
  id: number
  location: string
  name: string
  active: boolean
  color: number
  overlap: boolean
  attributes: string
  image_url: string
  department_id: number
  created_by_id: number
  events: CalendarEvent[]
}
