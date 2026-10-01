export type Client = {
  id: string
  name: string
  initials: string
  role: string
  age: number
  email: string
  phone: string
  location: string
  color: string
}

export type Todo = {
  id: number
  text: string
  client: string
  due: string
  done: boolean
  priority?: boolean
}

export type Appointment = {
  id: number
  date: string        // ISO format: 'YYYY-MM-DD'
  title: string
  detail: string
  client: string      // client name
  time: string        // e.g. '10:30'
  duration: number    // minutes
}

export type DocumentItem = {
  id: number
  name: string
  meta: string
  client: string     // client name
}
