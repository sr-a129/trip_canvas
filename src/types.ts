export type AppMode = 'login' | 'host' | 'guest'

export type AppScreen = 'tripList' | 'trip'

export type TabId =
  | 'home'
  | 'schedule'
  | 'expense'
  | 'packing'
  | 'members'
  | 'more'

export interface Member {
  id: string
  name: string
  nickname: string
  role: string
  color: string
  emoji: string
}

export interface ScheduleItem {
  id: string
  time: string
  title: string
  location?: string
  memo?: string
  assignee?: string
  done: boolean
  emoji: string
}

export interface ScheduleDay {
  date: string
  label: string
  items: ScheduleItem[]
}

export interface Expense {
  id: string
  title: string
  amount: number
  paidBy: string
  category: string
  emoji: string
  splitWith: string[]
}

export interface MemoItem {
  id: string
  title: string
  content: string
  pinned: boolean
  type: 'note' | 'checklist'
  items?: { text: string; done: boolean }[]
}

export interface PackingItem {
  id: string
  name: string
  personal: boolean
  assignee?: string
  done: boolean
}

export interface Flight {
  type: 'departure' | 'arrival'
  airline: string
  flightNumber: string
  from: string
  to: string
  departTime: string
  arriveTime: string
  terminal?: string
  gate?: string
  seats: string[]
  date: string
}

export interface Hotel {
  id: string
  name: string
  address: string
  checkIn: string
  checkOut: string
  wifi?: string
  keyCode?: string
  parking: boolean
  notes?: string
  image: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  coverImage: string
  members: Member[]
  schedule: ScheduleDay[]
  expenses: Expense[]
  memos: MemoItem[]
  packing: PackingItem[]
  flights: Flight[]
  hotels: Hotel[]
  emoji: string
}