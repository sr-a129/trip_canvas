import { ChevronRight, Cloud, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Trip, TabId, Member, ScheduleDay } from '../types'
import { supabase } from '../lib/supabase'

interface HomeTabProps {
  trip: Trip
  mode?: string
  onTabChange: (tab: TabId) => void
  onUpdateTrip: (trip: Trip) => void
}

/* =========================
   日付関係
========================= */

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year} -${month} -${day} `
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = parseLocalDate(dateStr)
  target.setHours(0, 0, 0, 0)

  return Math.ceil(
    (target.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24)
  )
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start)
  const e = parseLocalDate(end)

  return `${s.getMonth() + 1}/${s.getDate()} — ${e.getMonth() + 1
    }/${e.getDate()}`
}

function formatJapaneseDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)

  const days = [
    '日',
    '月',
    '火',
    '水',
    '木',
    '金',
    '土',
  ]

  return `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]
    }）`
}

/* =========================
   スケジュール
========================= */

function getFallbackSchedule(trip: Trip): ScheduleDay {
  const today = getDateString(new Date())

  const exact =
    trip.schedule.find((day) => day.date === today)

  if (exact) {
    return exact
  }

  const firstFuture =
    trip.schedule.find((day) => day.date >= today)

  if (firstFuture) {
    return firstFuture
  }

  return (
    trip.schedule[trip.schedule.length - 1] || {
      date: '',
      label: '予定',
      items: [],
    }
  )
}

/* =========================
   天気
========================= */

interface WeatherDay {
  date: string
  weatherCode: number
  high: number
  low: number
  rain: number
}

interface WeatherData {
  days: WeatherDay[]
  updatedAt: string
}

function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code === 1 || code === 2) return '🌤️'
  if (code === 3) return '☁️'

  if (
    code === 45 ||
    code === 48
  ) {
    return '🌫️'
  }

  if (
    code >= 51 &&
    code <= 57
  ) {
    return '🌦️'
  }

  if (
    code >= 61 &&
    code <= 67
  ) {
    return '🌧️'
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return '❄️'
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return '🌦️'
  }

  if (
    code >= 95 &&
    code <= 99
  ) {
    return '⛈️'
  }

  return '🌤️'
}

async function fetchWeather(
  destination: string,
  startDate: string,
  endDate: string
): Promise<WeatherData | null> {
  try {
    /*
     * 沖縄の場合は那覇を基準にする。
     * 将来的に他の旅行先にも対応できるよう、
     * それ以外はOpen-Meteoの地名検索を使う。
     */
    let latitude = 26.2124
    let longitude = 127.6809

    if (!destination.includes('沖縄')) {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          destination
        )}&count=1&language=ja&format=json`
      )

      if (geoResponse.ok) {
        const geoData = await geoResponse.json()

        if (geoData.results?.length > 0) {
          latitude = geoData.results[0].latitude
          longitude = geoData.results[0].longitude
        }
      }
    }

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=Asia%2FTokyo` +
      `&start_date=${startDate}` +
      `&end_date=${endDate}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('天気情報の取得に失敗しました')
    }

    const data = await response.json()

    const days: WeatherDay[] =
      (data.daily?.time || []).map(
        (date: string, index: number) => ({
          date,
          weatherCode:
            data.daily.weather_code?.[index] ?? 0,
          high:
            Math.round(
              data.daily.temperature_2m_max?.[index] ?? 0
            ),
          low:
            Math.round(
              data.daily.temperature_2m_min?.[index] ?? 0
            ),
          rain:
            data.daily
              .precipitation_probability_max?.[index] ?? 0,
        })
      )

    const now = new Date()

    const updatedAt =
      `${now.getMonth() + 1}/${now.getDate()} ` +
      `${String(now.getHours()).padStart(2, '0')}:` +
      `${String(now.getMinutes()).padStart(2, '0')}`

    return {
      days,
      updatedAt,
    }
  } catch (error) {
    console.error('天気取得エラー:', error)
    return null
  }
}

/* =========================
   クイックアクション
========================= */

const quickActions = [
  {
    label: '地図を開く',
    emoji: '🗺️',
    tab: 'more' as TabId,
  },
  {
    label: '費用を見る',
    emoji: '💰',
    tab: 'expense' as TabId,
  },
  {
    label: 'フライト',
    emoji: '✈️',
    tab: 'more' as TabId,
  },
  {
    label: '写真',
    emoji: '📷',
    tab: 'more' as TabId,
  },
]

/* =========================
   メンバー編集
========================= */

function MemberEditModal({
  trip,
  onUpdateTrip,
  onClose,
}: {
  trip: Trip
  onUpdateTrip: (trip: Trip) => void
  onClose: () => void
}) {
  const [members, setMembers] = useState<Member[]>(
    trip.members.map((m) => ({ ...m }))
  )

  const roles = [
    '幹事',
    '予約担当',
    '運転担当',
    '写真担当',
    'ナビ担当',
    '財務担当',
    'メンバー',
  ]

  const updateMember = (
    id: string,
    key: keyof Member,
    value: string
  ) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, [key]: value }
          : m
      )
    )
  }

  const addMember = () => {
    const newMember: Member = {
      id: `member-${Date.now()}`,
      name: '',
      nickname: '',
      role: 'メンバー',
      color: '#008888',
      emoji: '🙂',
    }

    setMembers((prev) => [...prev, newMember])
  }

  const removeMember = (id: string) => {
    if (!window.confirm('このメンバーを削除しますか？')) {
      return
    }

    setMembers((prev) =>
      prev.filter((m) => m.id !== id)
    )
  }

  const save = () => {
    const invalid = members.some(
      (m) => !m.nickname.trim()
    )

    if (invalid) {
      alert('ニックネームを入力してください')
      return
    }

    onUpdateTrip({
      ...trip,
      members,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-navy font-bold text-lg">
              メンバーを編集
            </h3>

            <p className="text-muted text-xs mt-1">
              追加・編集・削除ができます
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-muted text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="bg-cream rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted text-xs font-semibold">
                  MEMBER {index + 1}
                </span>

                <button
                  onClick={() =>
                    removeMember(member.id)
                  }
                  className="text-coral text-xs font-medium"
                >
                  削除
                </button>
              </div>

              <div className="space-y-2">
                <input
                  value={member.nickname}
                  onChange={(e) =>
                    updateMember(
                      member.id,
                      'nickname',
                      e.target.value
                    )
                  }
                  className="input-style"
                  placeholder="ニックネーム *"
                />

                <input
                  value={member.name}
                  onChange={(e) =>
                    updateMember(
                      member.id,
                      'name',
                      e.target.value
                    )
                  }
                  className="input-style"
                  placeholder="名前"
                />

                <select
                  value={member.role}
                  onChange={(e) =>
                    updateMember(
                      member.id,
                      'role',
                      e.target.value
                    )
                  }
                  className="w-full bg-white rounded-xl px-4 py-3 text-navy text-sm border border-bdr outline-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={member.emoji}
                    onChange={(e) =>
                      updateMember(
                        member.id,
                        'emoji',
                        e.target.value
                      )
                    }
                    className="input-style"
                    placeholder="絵文字"
                  />

                  <input
                    value={member.color}
                    onChange={(e) =>
                      updateMember(
                        member.id,
                        'color',
                        e.target.value
                      )
                    }
                    className="input-style"
                    placeholder="#008888"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addMember}
          className="w-full mt-4 rounded-xl border-2 border-dashed border-bdr py-3 text-coral text-sm font-semibold"
        >
          ＋ メンバーを追加
        </button>

        <button
          onClick={save}
          className="w-full mt-3 bg-coral text-white rounded-xl py-3 font-bold text-sm"
        >
          保存する
        </button>
      </div>
    </div>
  )
}

/* =========================
   Home
========================= */

export default function HomeTab({
  trip,
  onTabChange,
  onUpdateTrip,
}: HomeTabProps) {
  const [showMembers, setShowMembers] =
    useState(false)

  const [schedule, setSchedule] =
    useState<ScheduleDay[]>(trip.schedule || [])

  const [weather, setWeather] =
    useState<WeatherData | null>(null)

  const [weatherLoading, setWeatherLoading] =
    useState(true)

  const [scheduleLoading, setScheduleLoading] =
    useState(true)

  const daysUntil = getDaysUntil(trip.startDate)

  const isOngoing =
    daysUntil <= 0 &&
    getDaysUntil(trip.endDate) >= 0

  const totalDays =
    Math.ceil(
      (
        parseLocalDate(trip.endDate).getTime() -
        parseLocalDate(trip.startDate).getTime()
      ) /
      (1000 * 60 * 60 * 24)
    ) + 1

  /* =========================
     SupabaseからScheduleを取得
  ========================= */

  useEffect(() => {
    const loadSchedule = async () => {
      setScheduleLoading(true)

      try {
        const { data: days, error: daysError } =
          await supabase
            .from('schedule_days')
            .select('*')
            .eq('trip_id', trip.id)
            .order('day_number', {
              ascending: true,
            })

        if (
          daysError ||
          !days ||
          days.length === 0
        ) {
          console.error(
            'ホームのスケジュール取得エラー:',
            daysError
          )

          setSchedule(trip.schedule || [])
          return
        }

        const dayIds = days.map(
          (day) => day.id
        )

        const {
          data: items,
          error: itemsError,
        } = await supabase
          .from('schedule_items')
          .select('*')
          .in('day_id', dayIds)

        if (itemsError) {
          console.error(
            'ホームの予定取得エラー:',
            itemsError
          )

          setSchedule(trip.schedule || [])
          return
        }

        const mappedSchedule: ScheduleDay[] =
          days.map((day) => ({
            id: day.id,
            tripId: day.trip_id,
            date: day.date,
            label: day.label,
            dayNumber: day.day_number,
            items: (items || [])
              .filter(
                (item) =>
                  item.day_id === day.id
              )
              .sort((a, b) => {
                const aTime = a.time || ''
                const bTime = b.time || ''

                const periods = [
                  '朝',
                  '午前',
                  '昼',
                  '午後',
                  '夜',
                ]

                const getOrder = (
                  value: string
                ) => {
                  if (
                    periods.includes(value)
                  ) {
                    return periods.indexOf(
                      value
                    )
                  }

                  if (
                    /^\d{1,2}:\d{2}$/.test(
                      value
                    )
                  ) {
                    const [
                      hour,
                      minute,
                    ] = value
                      .split(':')
                      .map(Number)

                    return (
                      10 +
                      hour * 60 +
                      minute
                    )
                  }

                  return 10000
                }

                return (
                  getOrder(aTime) -
                  getOrder(bTime)
                )
              })
              .map((item) => ({
                id: item.id,
                dayId: item.day_id,
                time:
                  item.time || '未定',
                title: item.title,
                location:
                  item.location ||
                  undefined,
                memo:
                  item.memo ||
                  undefined,
                assignee:
                  item.assignee ||
                  undefined,
                done:
                  item.done || false,
                emoji:
                  item.emoji || '📍',
              })),
          }))

        setSchedule(mappedSchedule)
      } catch (error) {
        console.error(
          'ホームのスケジュール取得エラー:',
          error
        )

        setSchedule(trip.schedule || [])
      } finally {
        setScheduleLoading(false)
      }
    }

    loadSchedule()
  }, [trip.id, trip.schedule])

  /* =========================
     天気を取得
  ========================= */

  useEffect(() => {
    const loadWeather = async () => {
      setWeatherLoading(true)

      const result = await fetchWeather(
        trip.destination,
        trip.startDate,
        trip.endDate
      )

      setWeather(result)
      setWeatherLoading(false)
    }

    loadWeather()
  }, [
    trip.destination,
    trip.startDate,
    trip.endDate,
  ])

  /* =========================
     今日表示するDayを決定
  ========================= */

  const today = getDateString(new Date())

  let todayDay: ScheduleDay

  if (isOngoing) {
    todayDay =
      schedule.find(
        (day) => day.date === today
      ) || getFallbackSchedule(trip)
  } else if (daysUntil > 0) {
    todayDay =
      schedule.find(
        (day) => day.date === trip.startDate
      ) || getFallbackSchedule(trip)
  } else {
    todayDay =
      schedule.find(
        (day) => day.date === trip.endDate
      ) || getFallbackSchedule(trip)
  }

  /* =========================
     画面
  ========================= */

  return (
    <div className="bg-cream min-h-screen pb-6">

      {/* =====================
          Header
      ===================== */}

      <div
        className="relative overflow-hidden"
        style={{ minHeight: 280 }}
      >
        <div
          className="absolute inset-0 bg-navy"
          style={{
            backgroundImage:
              `url(${trip.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy/80" />

        <div className="relative px-6 pt-14 pb-8">
          <p
            className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-6"
            style={{
              fontFamily:
                'DM Mono, monospace',
            }}
          >
            {isOngoing
              ? '旅行中 · '
              : ''}
            Trip Canvas
          </p>

          <h1
            className="text-white leading-none mb-1"
            style={{
              fontFamily:
                'Playfair Display, Georgia, serif',
              fontSize: '40px',
              fontWeight: 800,
              letterSpacing: '-1px',
            }}
          >
            {trip.name}
          </h1>

          <p className="text-white/60 text-sm mb-6">
            {formatDateRange(
              trip.startDate,
              trip.endDate
            )}{' '}
            · {totalDays}日間
          </p>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 inline-flex items-center gap-3">
            {isOngoing ? (
              <>
                <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />

                <div>
                  <div className="text-white font-bold text-lg">
                    旅行中！
                  </div>

                  <div className="text-white/60 text-xs">
                    楽しんでいこう 🎉
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-white"
                  style={{
                    fontFamily:
                      'Playfair Display, Georgia, serif',
                    fontSize: '42px',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {daysUntil}
                </div>

                <div>
                  <div className="text-white/50 text-xs">
                    あと
                  </div>

                  <div className="text-white font-semibold text-sm">
                    日
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">

        {/* =====================
            Members
        ===================== */}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-navy text-sm font-semibold">
              メンバー
            </span>

            <div className="flex items-center gap-3">
              <span className="text-muted text-xs">
                {trip.members.length}人
              </span>

              <button
                onClick={() =>
                  setShowMembers(true)
                }
                className="flex items-center gap-1 text-coral text-xs font-semibold"
              >
                <Pencil size={12} />
                編集
              </button>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {trip.members.map((m) => (
              <div
                key={m.id || m.nickname}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2"
                  style={{
                    background:
                      m.color + '30',
                    borderColor:
                      m.color + '60',
                  }}
                >
                  {m.emoji}
                </div>

                <span className="text-muted text-[10px]">
                  {m.nickname}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* =====================
            Schedule
        ===================== */}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-navy text-sm font-semibold">
                {isOngoing
                  ? '今日の予定'
                  : `${todayDay.label}の予定`}
              </span>

              <p className="text-muted text-[10px] mt-0.5">
                {todayDay.date
                  ? formatJapaneseDate(
                    todayDay.date
                  )
                  : ''}
              </p>
            </div>

            <button
              onClick={() =>
                onTabChange('schedule')
              }
              className="text-coral text-xs flex items-center gap-0.5"
            >
              全て見る
              <ChevronRight size={12} />
            </button>
          </div>

          {scheduleLoading ? (
            <p className="text-muted text-xs py-3">
              スケジュールを読み込み中...
            </p>
          ) : (
            <div className="space-y-2.5">
              {todayDay.items
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="text-muted text-[10px] w-10 flex-shrink-0"
                      style={{
                        fontFamily:
                          'DM Mono, monospace',
                      }}
                    >
                      {item.time}
                    </span>

                    <span className="text-base">
                      {item.emoji}
                    </span>

                    <span
                      className={`text-navy text-sm flex-1 ${item.done
                        ? 'line-through opacity-50'
                        : ''
                        }`}
                    >
                      {item.title}
                    </span>

                    {item.done && (
                      <span className="text-teal text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                ))}

              {todayDay.items.length > 4 && (
                <p className="text-muted text-xs pl-14">
                  他{' '}
                  {todayDay.items.length - 4}{' '}
                  件...
                </p>
              )}

              {todayDay.items.length === 0 && (
                <p className="text-muted text-xs py-3">
                  この日の予定はありません
                </p>
              )}
            </div>
          )}
        </div>

        {/* =====================
            Weather
        ===================== */}

        <div className="bg-navy rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cloud
                size={14}
                className="text-white/40"
              />

              <span className="text-white/60 text-xs font-medium">
                天気予報 · {trip.destination}
              </span>
            </div>
          </div>

          {weatherLoading ? (
            <div className="py-4 text-center">
              <p className="text-white/50 text-xs">
                最新の天気を取得中...
              </p>
            </div>
          ) : weather ? (
            <>
              <div className="flex gap-2">
                {weather.days.map((w) => (
                  <div
                    key={w.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-white/60 text-[10px]">
                      {formatJapaneseDate(
                        w.date
                      )}
                    </span>

                    <span className="text-xl">
                      {weatherIcon(
                        w.weatherCode
                      )}
                    </span>

                    <span className="text-white text-xs font-semibold">
                      {w.high}°
                    </span>

                    <span className="text-white/40 text-[10px]">
                      {w.low}°
                    </span>

                    <div className="text-[9px] rounded-full px-1.5 py-0.5 text-white/40 bg-white/10">
                      ☔ {w.rain}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/30 text-[9px]">
                  Open-Meteo予報
                </span>

                <span className="text-white/40 text-[9px]">
                  {weather.updatedAt} 更新
                </span>
              </div>
            </>
          ) : (
            <div className="py-3">
              <p className="text-white/50 text-xs">
                天気予報を取得できませんでした
              </p>
            </div>
          )}
        </div>

        {/* =====================
            Quick Actions
        ===================== */}

        <div>
          <p className="text-navy text-sm font-semibold px-1 mb-3">
            クイックアクション
          </p>

          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() =>
                  onTabChange(a.tab)
                }
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <span className="text-2xl">
                  {a.emoji}
                </span>

                <span className="text-navy text-[10px] font-medium text-center leading-tight">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =====================
            Flight
        ===================== */}

        {trip.flights.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-navy text-sm font-semibold">
                フライト
              </span>

              <button
                onClick={() =>
                  onTabChange('more')
                }
                className="text-coral text-xs flex items-center gap-0.5"
              >
                詳細
                <ChevronRight size={12} />
              </button>
            </div>

            {trip.flights
              .slice(0, 1)
              .map((f) => (
                <div
                  key={f.flightNumber}
                  className="flex items-center gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-navy font-bold text-lg">
                      {f.departTime}
                    </span>

                    <span className="text-muted text-xs">
                      {f.from}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-muted">
                      {f.airline}{' '}
                      {f.flightNumber}
                    </span>

                    <div className="flex items-center gap-1 w-full">
                      <div className="flex-1 h-px bg-bdr" />

                      <span className="text-sm">
                        ✈️
                      </span>

                      <div className="flex-1 h-px bg-bdr" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-navy font-bold text-lg">
                      {f.arriveTime}
                    </span>

                    <span className="text-muted text-xs">
                      {f.to}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* =====================
          Member Modal
      ===================== */}

      {showMembers && (
        <MemberEditModal
          trip={trip}
          onUpdateTrip={onUpdateTrip}
          onClose={() =>
            setShowMembers(false)
          }
        />
      )}
    </div>
  )
}