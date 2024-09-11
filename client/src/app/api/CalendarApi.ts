// client/src/app/api/CalendarApi.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GO_APP_SERVER_URL,
  withCredentials: true
})

export const createCalendar = async (calendar: any) => {
  return api.post('/calendars', calendar)
}

export const getCalendarByDepartmentId = (departmentId: number) => {
  return api.get(`/calendars/department/${departmentId}`)
}

export const getCalendarByID = (calendarId: number) => {
  return api.get(`/calendars/${calendarId}`)
}

export const createEvent = (calendarId: number, eventData: any) => {
  return api.post(`/calendars/${calendarId}/events`, eventData)
}

export const updateEvent = (calendarId: number, eventId: number, eventData: any) => {
  return api.put(`/calendars/${calendarId}/events/${eventId}`, eventData)
}

export const deleteEvent = (calendarId: number, eventId: number) => {
  return api.delete(`/calendars/${calendarId}/events/${eventId}`)
}
