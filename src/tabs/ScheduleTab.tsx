import { useState } from 'react'
import { Plus, Check, MapPin, ChevronDown, ChevronUp, X } from 'lucide-react'
import type { Trip, AppMode, ScheduleItem } from '../types'

interface ScheduleTabProps {
  trip: Trip
  mode: AppMode
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`
}

export default function ScheduleTab({ trip, mode }: ScheduleTabProps) {
  const [activeDayIdx, setActiveDayIdx] = useState(0)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemTime, setNewItemTime] = useState('')
  const [newItemLocation, setNewItemLocation] = useState('')

  const day = trip.schedule[activeDayIdx]

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const completedCount = day.items.filter((i) => checkedItems.has(i.id) || i.done).length

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-navy px-6 pt-14 pb-4">
        <h2
          className="text-white mb-4"
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          スケジュール
        </h2>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {trip.schedule.map((d, idx) => (
            <button
              key={d.date}
              onClick={() => setActiveDayIdx(idx)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                idx === activeDayIdx
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

      {/* Progress bar */}
      <div className="bg-white px-6 py-3 flex items-center gap-3 border-b border-bdr">
        <div className="flex-1 h-1.5 bg-bdr rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all"
            style={{ width: `${day.items.length > 0 ? (completedCount / day.items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-muted text-xs">{completedCount}/{day.items.length} 完了</span>
      </div>

      {/* Timeline */}
      <div className="px-5 py-4 space-y-1">
        {day.items.map((item, idx) => {
          const isChecked = checkedItems.has(item.id) || item.done
          const isExpanded = expandedItems.has(item.id)
          const hasDetails = item.location || item.memo

          return (
            <div key={item.id} className="flex gap-3">
              {/* Left: time + line */}
              <div className="flex flex-col items-center w-14 flex-shrink-0 pt-3.5">
                <span
                  className="text-muted text-[10px] text-right w-full"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {item.time}
                </span>
                {idx < day.items.length - 1 && (
                  <div className="flex-1 w-px bg-bdr mt-2" style={{ minHeight: 24 }} />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-2xl mb-2 transition-all ${
                  isChecked ? 'bg-white/50 opacity-60' : 'bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start p-3 gap-3">
                  {/* Emoji */}
                  <span className="text-xl mt-0.5 flex-shrink-0">{item.emoji}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug ${
                        isChecked ? 'line-through text-muted' : 'text-navy'
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.assignee && (
                      <p className="text-muted text-[10px] mt-0.5">{item.assignee}</p>
                    )}

                    {/* Expanded details */}
                    {isExpanded && hasDetails && (
                      <div className="mt-2 pt-2 border-t border-bdr space-y-1">
                        {item.location && (
                          <div className="flex items-start gap-1.5">
                            <MapPin size={11} className="text-muted mt-0.5 flex-shrink-0" />
                            <span className="text-muted text-xs">{item.location}</span>
                          </div>
                        )}
                        {item.memo && (
                          <p className="text-muted text-xs leading-relaxed">{item.memo}</p>
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
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    {mode === 'host' && (
                      <button
                        onClick={() => toggleCheck(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-teal border-teal'
                            : 'border-bdr'
                        }`}
                      >
                        {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add button */}
        {mode === 'host' && (
          <div className="flex gap-3">
            <div className="w-14 flex-shrink-0" />
            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 rounded-2xl border-2 border-dashed border-bdr p-3 flex items-center gap-2 text-muted text-sm active:bg-white transition-colors"
            >
              <Plus size={16} />
              予定を追加
            </button>
          </div>
        )}
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">予定を追加</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-muted text-xs font-medium">時間</label>
                <input
                  type="time"
                  value={newItemTime}
                  onChange={(e) => setNewItemTime(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium">タイトル</label>
                <input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="美ら海水族館"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium">場所</label>
                <input
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="海洋博公園"
                />
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewItemTitle('')
                  setNewItemTime('')
                  setNewItemLocation('')
                }}
                className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm active:bg-coral-dark"
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
