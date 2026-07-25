import { MapPin, Calendar, DollarSign, Image, ChevronRight, Cloud } from 'lucide-react'
import type { Trip, TabId } from '../types'

interface HomeTabProps {
  trip: Trip
  onTabChange: (tab: TabId) => void
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const mo = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${mo(s)} — ${mo(e)}`
}

function getTodaySchedule(trip: Trip) {
  const today = new Date().toISOString().split('T')[0]
  return trip.schedule.find((d) => d.date === today) || trip.schedule[0]
}

function getNextSchedule(trip: Trip) {
  const today = new Date().toISOString().split('T')[0]
  const future = trip.schedule.filter((d) => d.date > today)
  return future[0] || null
}

const quickActions = [
  { label: '地図を開く', emoji: '🗺️', tab: 'more' as TabId, color: '#008888' },
  { label: '費用を見る', emoji: '💰', tab: 'expense' as TabId, color: '#E8462A' },
  { label: 'フライト', emoji: '✈️', tab: 'more' as TabId, color: '#1B2A4A' },
  { label: '写真', emoji: '📷', tab: 'more' as TabId, color: '#C9952A' },
]

const weatherDays = [
  { day: '今日', icon: '☀️', high: 32, low: 27, rain: 10 },
  { day: '明日', icon: '🌤️', high: 31, low: 26, rain: 20 },
  { day: '木', icon: '⛅', high: 30, low: 26, rain: 40 },
  { day: '金', icon: '🌧️', high: 28, low: 25, rain: 70 },
]

export default function HomeTab({ trip, onTabChange }: HomeTabProps) {
  const daysUntil = getDaysUntil(trip.startDate)
  const isOngoing = daysUntil <= 0 && getDaysUntil(trip.endDate) >= 0
  const todayDay = getTodaySchedule(trip)
  const totalDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  return (
    <div className="bg-cream min-h-screen pb-6">
      {/* Hero header */}
      <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
        <div
          className="absolute inset-0 bg-navy"
          style={{
            backgroundImage: `url(${trip.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy/80" />

        <div className="relative px-6 pt-14 pb-8">
          {/* Breadcrumb */}
          <p
            className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-6"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {isOngoing ? '旅行中 · ' : ''}Trip Canvas
          </p>

          {/* Trip name */}
          <h1
            className="text-white leading-none mb-1"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '40px',
              fontWeight: 800,
              letterSpacing: '-1px',
            }}
          >
            {trip.name}
          </h1>
          <p className="text-white/60 text-sm mb-6">{formatDateRange(trip.startDate, trip.endDate)} · {totalDays}日間</p>

          {/* Countdown */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 inline-flex items-center gap-3">
            {isOngoing ? (
              <>
                <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                <div>
                  <div className="text-white font-bold text-lg">旅行中！</div>
                  <div className="text-white/60 text-xs">楽しんでいこう 🎉</div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-white"
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '42px',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {daysUntil}
                </div>
                <div>
                  <div className="text-white/50 text-xs">あと</div>
                  <div className="text-white font-semibold text-sm">日</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* Members */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-navy text-sm font-semibold">メンバー</span>
            <span className="text-muted text-xs">{trip.members.length}人</span>
          </div>
          <div className="flex gap-2">
            {trip.members.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2"
                  style={{ background: m.color + '30', borderColor: m.color + '60' }}
                >
                  {m.emoji}
                </div>
                <span className="text-muted text-[10px]">{m.nickname}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-navy text-sm font-semibold">
              {isOngoing ? '今日の予定' : `${todayDay.label}の予定`}
            </span>
            <button
              onClick={() => onTabChange('schedule')}
              className="text-coral text-xs flex items-center gap-0.5"
            >
              全て見る <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {todayDay.items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span
                  className="text-muted text-[10px] w-10 flex-shrink-0"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {item.time}
                </span>
                <span className="text-base">{item.emoji}</span>
                <span className="text-navy text-sm flex-1 leading-snug">{item.title}</span>
                {item.done && <span className="text-teal text-xs">✓</span>}
              </div>
            ))}
            {todayDay.items.length > 4 && (
              <p className="text-muted text-xs pl-14">他 {todayDay.items.length - 4} 件...</p>
            )}
          </div>
        </div>

        {/* Weather */}
        <div className="bg-navy rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cloud size={14} className="text-white/40" />
            <span className="text-white/60 text-xs font-medium">天気予報 · {trip.destination}</span>
          </div>
          <div className="flex gap-2">
            {weatherDays.map((w) => (
              <div key={w.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-white/50 text-[10px]">{w.day}</span>
                <span className="text-xl">{w.icon}</span>
                <span className="text-white text-xs font-semibold">{w.high}°</span>
                <span className="text-white/40 text-[10px]">{w.low}°</span>
                <div
                  className="text-[9px] rounded-full px-1.5 py-0.5"
                  style={{
                    background: w.rain > 50 ? 'rgba(91,168,245,0.2)' : 'rgba(255,255,255,0.08)',
                    color: w.rain > 50 ? '#5BA8F5' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {w.rain}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-navy text-sm font-semibold px-1 mb-3">クイックアクション</p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => onTabChange(a.tab)}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-navy text-[10px] font-medium text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Flight info snippet */}
        {trip.flights.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-navy text-sm font-semibold">フライト</span>
              <button onClick={() => onTabChange('more')} className="text-coral text-xs flex items-center gap-0.5">
                詳細 <ChevronRight size={12} />
              </button>
            </div>
            {trip.flights.slice(0, 1).map((f) => (
              <div key={f.flightNumber} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-navy font-bold text-lg">{f.departTime}</span>
                  <span className="text-muted text-xs">{f.from}</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-muted" style={{ fontFamily: 'DM Mono, monospace' }}>{f.airline} {f.flightNumber}</span>
                  <div className="flex items-center gap-1 w-full">
                    <div className="flex-1 h-px bg-bdr" />
                    <span className="text-sm">✈️</span>
                    <div className="flex-1 h-px bg-bdr" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-navy font-bold text-lg">{f.arriveTime}</span>
                  <span className="text-muted text-xs">{f.to}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
