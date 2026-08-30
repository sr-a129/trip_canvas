import { useEffect, useState } from 'react'
import { Plus, Check, MapPin, ChevronDown, ChevronUp, X, CalendarDays } from 'lucide-react'
import type { Trip, AppMode, ScheduleDay, ScheduleItem } from '../types'

interface ScheduleTabProps {
  trip: Trip
  mode: AppMode
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`
}

function storageKey(tripId: string) {
  return `trip-canvas-schedule-${tripId}`
}

export default function ScheduleTab({ trip, mode }: ScheduleTabProps) {
  const [schedule, setSchedule] = useState<ScheduleDay[]>(trip.schedule)
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemTime, setNewItemTime] = useState('')
  const [newItemLocation, setNewItemLocation] = useState('')
  const [newItemMemo, setNewItemMemo] = useState('')

  // 旅行ごとの予定をブラウザに保存
  useEffect(() => {
    const saved = localStorage.getItem(storageKey(trip.id))

    if (saved) {
      try {
        setSchedule(JSON.parse(saved))
      } catch {
        setSchedule(trip.schedule)
      }
    } else {
      setSchedule(trip.schedule)
    }
  }, [trip.id, trip.schedule])

  const saveSchedule = (nextSchedule: ScheduleDay[]) => {
    setSchedule(nextSchedule)
    localStorage.setItem(storageKey(trip.id), JSON.stringify(nextSchedule))
  }

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  const openDay = (idx: number) => {
    setActiveDayIdx(idx)
    setExpandedItems(new Set())
  }

  const closeDay = () => {
    setActiveDayIdx(null)
  }

  const addScheduleItem = () => {
    if (!newItemTitle.trim()) {
      return
    }

    if (activeDayIdx === null) {
      return
    }

    const newItem: ScheduleItem = {
      id: `schedule-${Date.now()}`,
      time: newItemTime || '未定',
      title: newItemTitle.trim(),
      location: newItemLocation.trim() || undefined,
      memo: newItemMemo.trim() || undefined,
      assignee: '全員',
      done: false,
      emoji: '📍',
    }

    const nextSchedule = schedule.map((day, idx) => {
      if (idx !== activeDayIdx) {
        return day
      }

      const newItems = [...day.items, newItem].sort((a, b) => {
        if (a.time === '未定') return 1
        if (b.time === '未定') return -1
        return a.time.localeCompare(b.time)
      })

      return {
        ...day,
        items: newItems,
      }
    })

    saveSchedule(nextSchedule)

    setShowAddForm(false)
    setNewItemTitle('')
    setNewItemTime('')
    setNewItemLocation('')
    setNewItemMemo('')
  }

  // Dayを選択していない状態
  if (activeDayIdx === null) {
    return (
      <div className="bg-cream min-h-screen pb-8">
        {/* Header */}
        <div className="bg-navy px-6 pt-14 pb-7">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={20} className="text-white/70" />
            <span className="text-white/60 text-xs font-medium tracking-wide">
              TRIP SCHEDULE
            </span>
          </div>

          <h2
            className="text-white"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            旅のしおり
          </h2>

          <p className="text-white/60 text-xs mt-2">
            {formatDate(trip.startDate)} 〜 {formatDate(trip.endDate)}
          </p>
        </div>

        {/* Day cards */}
        <div className="px-5 py-6 space-y-4">
          {schedule.map((day, idx) => {
            const completedCount = day.items.filter(
              (item) => checkedItems.has(item.id) || item.done
            ).length

            return (
              <button
                key={day.date}
                onClick={() => openDay(idx)}
                className="w-full text-left bg-white rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-coral text-xs font-bold tracking-wider">
                      {day.label.toUpperCase()}
                    </p>

                    <p
                      className="text-navy mt-1"
                      style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '24px',
                        fontWeight: 700,
                      }}
                    >
                      {formatDate(day.date)}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-2xl">
                    {idx === 0 && '✈️'}
                    {idx === 1 && '🌺'}
                    {idx === 2 && '🌊'}
                    {idx === 3 && '🏠'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-bdr flex items-center justify-between">
                  <span className="text-muted text-xs">
                    {day.items.length}件の予定
                  </span>

                  <span className="text-muted text-xs">
                    {completedCount}/{day.items.length} 完了
                  </span>
                </div>

                {day.items.length > 0 && (
                  <div className="mt-3">
                    <p className="text-navy text-sm font-medium truncate">
                      {day.items[0].emoji} {day.items[0].title}
                    </p>

                    {day.items.length > 1 && (
                      <p className="text-muted text-xs mt-1">
                        ＋あと{day.items.length - 1}件
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 text-center text-coral text-xs font-bold">
                  DAYを見る →
                </div>
              </button>
            )
          })}

          {schedule.length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center">
              <p className="text-muted text-sm">
                まだスケジュールがありません
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const day = schedule[activeDayIdx]

  if (!day) {
    setActiveDayIdx(null)
    return null
  }

  const completedCount = day.items.filter(
    (item) => checkedItems.has(item.id) || item.done
  ).length

  return (
    <div className="bg-cream min-h-screen pb-8">
      {/* Header */}
      <div className="bg-navy px-6 pt-14 pb-5">
        <button
          onClick={closeDay}
          className="text-white/60 text-xs mb-4"
        >
          ← 4日間のしおりに戻る
        </button>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-coral text-xs font-bold tracking-wider">
              {day.label.toUpperCase()}
            </p>

            <h2
              className="text-white mt-1"
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '28px',
                fontWeight: 700,
              }}
            >
              {formatDate(day.date)}
            </h2>
          </div>

          <div className="text-3xl">
            {activeDayIdx === 0 && '✈️'}
            {activeDayIdx === 1 && '🌺'}
            {activeDayIdx === 2 && '🌊'}
            {activeDayIdx === 3 && '🏠'}
          </div>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-5">
          {schedule.map((d, idx) => (
            <button
              key={d.date}
              onClick={() => openDay(idx)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${idx === activeDayIdx
                  ? 'bg-coral text-white'
                  : 'bg-white/10 text-white/60'
                }`}
            >
              <div className="text-xs opacity-70 mb-0.5">{d.label}</div>
              <div>{formatDate(d.date)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white px-6 py-3 flex items-center gap-3 border-b border-bdr">
        <div className="flex-1 h-1.5 bg-bdr rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all"
            style={{
              width: `${day.items.length > 0
                  ? (completedCount / day.items.length) * 100
                  : 0
                }%`,
            }}
          />
        </div>

        <span className="text-muted text-xs">
          {completedCount}/{day.items.length} 完了
        </span>
      </div>

      {/* Timeline */}
      <div className="px-5 py-5 space-y-1">
        {day.items.map((item, idx) => {
          const isChecked = checkedItems.has(item.id) || item.done
          const isExpanded = expandedItems.has(item.id)
          const hasDetails = Boolean(item.location || item.memo)

          return (
            <div key={item.id} className="flex gap-3">
              {/* Time */}
              <div className="flex flex-col items-center w-14 flex-shrink-0 pt-3.5">
                <span
                  className="text-muted text-[10px] text-right w-full"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {item.time}
                </span>

                {idx < day.items.length - 1 && (
                  <div
                    className="flex-1 w-px bg-bdr mt-2"
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-2xl mb-2 transition-all ${isChecked
                    ? 'bg-white/50 opacity-60'
                    : 'bg-white shadow-sm'
                  }`}
              >
                <div className="flex items-start p-3 gap-3">
                  {/* Emoji */}
                  <span className="text-xl mt-0.5 flex-shrink-0">
                    {item.emoji}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug ${isChecked
                          ? 'line-through text-muted'
                          : 'text-navy'
                        }`}
                    >
                      {item.title}
                    </p>

                    {item.assignee && (
                      <p className="text-muted text-[10px] mt-0.5">
                        {item.assignee}
                      </p>
                    )}

                    {isExpanded && hasDetails && (
                      <div className="mt-2 pt-2 border-t border-bdr space-y-1">
                        {item.location && (
                          <div className="flex items-start gap-1.5">
                            <MapPin
                              size={11}
                              className="text-muted mt-0.5 flex-shrink-0"
                            />
                            <span className="text-muted text-xs">
                              {item.location}
                            </span>
                          </div>
                        )}

                        {item.memo && (
                          <p className="text-muted text-xs leading-relaxed">
                            {item.memo}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {hasDetails && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-muted p-1"
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    )}

                    {mode === 'host' && (
                      <button
                        onClick={() => toggleCheck(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChecked
                            ? 'bg-teal border-teal'
                            : 'border-bdr'
                          }`}
                      >
                        {isChecked && (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {day.items.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-muted text-sm">
              この日の予定はまだありません
            </p>
          </div>
        )}

        {/* Add button */}
        {mode === 'host' && (
          <div className="flex gap-3">
            <div className="w-14 flex-shrink-0" />

            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 rounded-2xl border-2 border-dashed border-bdr p-3 flex items-center justify-center gap-2 text-muted text-sm active:bg-white transition-colors"
            >
              <Plus size={16} />
              予定を追加
            </button>
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          />

          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">
                {day.label}に予定を追加
              </h3>

              <button onClick={() => setShowAddForm(false)}>
                <X size={20} className="text-muted" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Time */}
              <div>
                <label className="text-muted text-xs font-medium">
                  時間
                </label>

                <input
                  type="time"
                  value={newItemTime}
                  onChange={(e) => setNewItemTime(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-muted text-xs font-medium">
                  タイトル *
                </label>

                <input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="美ら海水族館"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-muted text-xs font-medium">
                  場所
                </label>

                <input
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="海洋博公園"
                />
              </div>

              {/* Memo */}
              <div>
                <label className="text-muted text-xs font-medium">
                  メモ
                </label>

                <textarea
                  value={newItemMemo}
                  onChange={(e) => setNewItemMemo(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral resize-none"
                  placeholder="チケット予約済み"
                  rows={3}
                />
              </div>

              <button
                onClick={addScheduleItem}
                disabled={!newItemTitle.trim()}
                className={`w-full rounded-xl py-3 font-bold text-sm transition-all ${newItemTitle.trim()
                    ? 'bg-coral text-white active:bg-coral-dark'
                    : 'bg-bdr text-muted'
                  }`}
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}