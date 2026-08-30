import { useEffect, useState } from 'react'
import {
  Plus,
  Check,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  CalendarDays,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { Trip, AppMode, ScheduleDay, ScheduleItem } from '../types'
import { supabase } from '../lib/supabase'

interface ScheduleTabProps {
  trip: Trip
  mode: AppMode
}

type TimeType = 'time' | '朝' | '午前' | '昼' | '午後' | '夜'

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) {
    return '日付未定'
  }

  const d = new Date(dateValue)

  if (Number.isNaN(d.getTime())) {
    return '日付未定'
  }

  const days = ['日', '月', '火', '水', '木', '金', '土']

  return `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`
}

function formatTimeDisplay(item: ScheduleItem): string {
  const value = item.time

  if (!value) {
    return '未定'
  }

  return value
}

export default function ScheduleTab({ trip, mode }: ScheduleTabProps) {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)

  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemTimeType, setNewItemTimeType] = useState<TimeType>('time')
  const [newItemTime, setNewItemTime] = useState('')
  const [newItemLocation, setNewItemLocation] = useState('')
  const [newItemMemo, setNewItemMemo] = useState('')

  const [loading, setLoading] = useState(true)

  /*
   * Supabaseからスケジュールを取得
   */
  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)

      try {
        const { data: days, error: daysError } = await supabase
          .from('schedule_days')
          .select('*')
          .eq('trip_id', trip.id)
          .order('day_number', { ascending: true })

        if (daysError) {
          console.error('スケジュール取得エラー:', daysError)
          setSchedule([])
          return
        }

        if (!days || days.length === 0) {
          setSchedule([])
          return
        }

        const dayIds = days.map((day) => day.id)

        const { data: items, error: itemsError } = await supabase
          .from('schedule_items')
          .select('*')
          .in('day_id', dayIds)

        if (itemsError) {
          console.error('予定取得エラー:', itemsError)
          setSchedule([])
          return
        }

        const mappedSchedule: ScheduleDay[] = days.map((day) => ({
          id: day.id,
          tripId: day.trip_id,
          date: day.date,
          label: day.label,
          dayNumber: day.day_number,
          items: (items || [])
            .filter((item) => item.day_id === day.id)
            .sort((a, b) => {
              const aTime = a.time || ''
              const bTime = b.time || ''

              const periods = ['朝', '午前', '昼', '午後', '夜']

              const getOrder = (value: string) => {
                if (periods.includes(value)) {
                  return periods.indexOf(value)
                }

                if (/^\d{1,2}:\d{2}$/.test(value)) {
                  return 10 + Number(value.replace(':', ''))
                }

                return 100
              }

              return getOrder(aTime) - getOrder(bTime)
            })
            .map((item) => ({
              id: item.id,
              dayId: item.day_id,
              time: item.time || '未定',
              title: item.title,
              location: item.location || undefined,
              memo: item.memo || undefined,
              assignee: item.assignee || undefined,
              done: item.done || false,
              emoji: item.emoji || '📍',
            })),
        }))

        setSchedule(mappedSchedule)
      } catch (error) {
        console.error('スケジュール取得エラー:', error)
        setSchedule([])
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [trip.id])

  const toggleCheck = async (item: ScheduleItem) => {
    const nextDone = !(checkedItems.has(item.id) || item.done)

    setCheckedItems((prev) => {
      const next = new Set(prev)

      if (nextDone) {
        next.add(item.id)
      } else {
        next.delete(item.id)
      }

      return next
    })

    await supabase
      .from('schedule_items')
      .update({ done: nextDone })
      .eq('id', item.id)

    setSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        items: day.items.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, done: nextDone }
            : currentItem
        ),
      }))
    )
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

  const resetForm = () => {
    setNewItemTitle('')
    setNewItemTimeType('time')
    setNewItemTime('')
    setNewItemLocation('')
    setNewItemMemo('')
    setEditingItem(null)
    setShowAddForm(false)
  }

  const openAddForm = () => {
    setEditingItem(null)
    setNewItemTitle('')
    setNewItemTimeType('time')
    setNewItemTime('')
    setNewItemLocation('')
    setNewItemMemo('')
    setShowAddForm(true)
  }

  const openEditForm = (item: ScheduleItem) => {
    setEditingItem(item)
    setNewItemTitle(item.title)
    setNewItemLocation(item.location || '')
    setNewItemMemo(item.memo || '')

    const periods = ['朝', '午前', '昼', '午後', '夜']

    if (periods.includes(item.time)) {
      setNewItemTimeType(item.time as TimeType)
      setNewItemTime('')
    } else {
      setNewItemTimeType('time')
      setNewItemTime(item.time === '未定' ? '' : item.time)
    }

    setShowAddForm(true)
  }

  const getTimeValue = () => {
    if (newItemTimeType !== 'time') {
      return newItemTimeType
    }

    return newItemTime || '未定'
  }

  const saveItem = async () => {
    if (!newItemTitle.trim() || activeDayIdx === null) {
      return
    }

    const day = schedule[activeDayIdx]

    if (!day) {
      return
    }

    const timeValue = getTimeValue()

    /*
     * 編集
     */
    if (editingItem) {
      const { error } = await supabase
        .from('schedule_items')
        .update({
          time: timeValue,
          title: newItemTitle.trim(),
          location: newItemLocation.trim() || null,
          memo: newItemMemo.trim() || null,
        })
        .eq('id', editingItem.id)

      if (error) {
        console.error('予定更新エラー:', error)
        return
      }

      setSchedule((prev) =>
        prev.map((currentDay) => ({
          ...currentDay,
          items: currentDay.items
            .map((item) =>
              item.id === editingItem.id
                ? {
                  ...item,
                  time: timeValue,
                  title: newItemTitle.trim(),
                  location: newItemLocation.trim() || undefined,
                  memo: newItemMemo.trim() || undefined,
                }
                : item
            )
            .sort((a, b) => {
              if (a.time === '未定') return 1
              if (b.time === '未定') return -1

              const periods = ['朝', '午前', '昼', '午後', '夜']

              const getOrder = (value: string) => {
                if (periods.includes(value)) {
                  return periods.indexOf(value)
                }

                if (/^\d{1,2}:\d{2}$/.test(value)) {
                  return 10 + Number(value.replace(':', ''))
                }

                return 100
              }

              return getOrder(a.time) - getOrder(b.time)
            }),
        }))
      )

      resetForm()
      return
    }

    /*
     * 新規追加
     */
    const newItemId = `schedule-${Date.now()}`

    const { error } = await supabase.from('schedule_items').insert({
      id: newItemId,
      day_id: day.id,
      time: timeValue,
      title: newItemTitle.trim(),
      location: newItemLocation.trim() || null,
      memo: newItemMemo.trim() || null,
      assignee: '全員',
      done: false,
      emoji: '📍',
    })

    if (error) {
      console.error('予定追加エラー:', error)
      return
    }

    const newItem: ScheduleItem = {
      id: newItemId,
      dayId: day.id,
      time: timeValue,
      title: newItemTitle.trim(),
      location: newItemLocation.trim() || undefined,
      memo: newItemMemo.trim() || undefined,
      assignee: '全員',
      done: false,
      emoji: '📍',
    }

    setSchedule((prev) =>
      prev.map((currentDay, idx) => {
        if (idx !== activeDayIdx) {
          return currentDay
        }

        return {
          ...currentDay,
          items: [...currentDay.items, newItem],
        }
      })
    )

    resetForm()
  }

  const deleteItem = async (item: ScheduleItem) => {
    const confirmed = window.confirm(
      `「${item.title}」を削除しますか？`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('schedule_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      console.error('予定削除エラー:', error)
      return
    }

    setSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        items: day.items.filter(
          (currentItem) => currentItem.id !== item.id
        ),
      }))
    )
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm">読み込み中...</p>
      </div>
    )
  }

  /*
   * Day一覧
   */
  if (activeDayIdx === null) {
    return (
      <div className="bg-cream min-h-screen pb-8">
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

        <div className="px-5 py-6 space-y-4">
          {schedule.map((day, idx) => {
            const completedCount = day.items.filter(
              (item) => checkedItems.has(item.id) || item.done
            ).length

            return (
              <button
                key={day.id || `${day.date}-${idx}`}
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
    return null
  }

  const completedCount = day.items.filter(
    (item) => checkedItems.has(item.id) || item.done
  ).length

  return (
    <div className="bg-cream min-h-screen pb-8">
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

        <div className="flex gap-2 overflow-x-auto pb-1 mt-5">
          {schedule.map((d, idx) => (
            <button
              key={d.id || `${d.date}-${idx}`}
              onClick={() => openDay(idx)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${idx === activeDayIdx
                  ? 'bg-coral text-white'
                  : 'bg-white/10 text-white/60'
                }`}
            >
              <div className="text-xs opacity-70 mb-0.5">
                {d.label}
              </div>

              <div>{formatDate(d.date)}</div>
            </button>
          ))}
        </div>
      </div>

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

      <div className="px-5 py-5 space-y-1">
        {day.items.map((item, idx) => {
          const isChecked = checkedItems.has(item.id) || item.done
          const isExpanded = expandedItems.has(item.id)
          const hasDetails = Boolean(item.location || item.memo)

          return (
            <div key={item.id || `item-${idx}`} className="flex gap-3">
              <div className="flex flex-col items-center w-14 flex-shrink-0 pt-3.5">
                <span
                  className="text-muted text-[10px] text-right w-full"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {formatTimeDisplay(item)}
                </span>

                {idx < day.items.length - 1 && (
                  <div
                    className="flex-1 w-px bg-bdr mt-2"
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>

              <div
                className={`flex-1 rounded-2xl mb-2 transition-all ${isChecked
                    ? 'bg-white/50 opacity-60'
                    : 'bg-white shadow-sm'
                  }`}
              >
                <div className="flex items-start p-3 gap-3">
                  <span className="text-xl mt-0.5 flex-shrink-0">
                    {item.emoji}
                  </span>

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
                      <>
                        <button
                          onClick={() => openEditForm(item)}
                          className="text-muted p-1"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => deleteItem(item)}
                          className="text-muted p-1"
                        >
                          <Trash2 size={14} />
                        </button>

                        <button
                          onClick={() => toggleCheck(item)}
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
                      </>
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

        {mode === 'host' && (
          <div className="flex gap-3">
            <div className="w-14 flex-shrink-0" />

            <button
              onClick={openAddForm}
              className="flex-1 rounded-2xl border-2 border-dashed border-bdr p-3 flex items-center justify-center gap-2 text-muted text-sm active:bg-white transition-colors"
            >
              <Plus size={16} />
              予定を追加
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={resetForm}
          />

          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">
                {editingItem
                  ? '予定を編集'
                  : `${day.label}に予定を追加`}
              </h3>

              <button onClick={resetForm}>
                <X size={20} className="text-muted" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-muted text-xs font-medium">
                  時間帯
                </label>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['朝', '午前', '昼', '午後', '夜'] as TimeType[]).map(
                    (period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setNewItemTimeType(period)}
                        className={`rounded-xl py-2.5 text-sm font-medium border ${newItemTimeType === period
                            ? 'bg-coral text-white border-coral'
                            : 'bg-cream text-navy border-bdr'
                          }`}
                      >
                        {period}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setNewItemTimeType('time')}
                  className={`w-full mt-2 rounded-xl py-2.5 text-sm font-medium border ${newItemTimeType === 'time'
                      ? 'bg-coral text-white border-coral'
                      : 'bg-cream text-navy border-bdr'
                    }`}
                >
                  時間を指定する
                </button>

                {newItemTimeType === 'time' && (
                  <input
                    type="time"
                    value={newItemTime}
                    onChange={(e) => setNewItemTime(e.target.value)}
                    className="w-full mt-2 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  />
                )}
              </div>

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
                onClick={saveItem}
                disabled={!newItemTitle.trim()}
                className={`w-full rounded-xl py-3 font-bold text-sm transition-all ${newItemTitle.trim()
                    ? 'bg-coral text-white'
                    : 'bg-bdr text-muted'
                  }`}
              >
                {editingItem ? '変更を保存' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}