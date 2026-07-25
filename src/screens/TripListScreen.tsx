import { useState } from 'react'
import { Plus, ChevronRight, ArrowLeft, Copy } from 'lucide-react'
import type { Trip, AppMode } from '../types'

interface TripListScreenProps {
  trips: Trip[]
  mode: AppMode
  onSelectTrip: (trip: Trip) => void
  onBack: () => void
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
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return `${s.getMonth() + 1}/${s.getDate()} — ${e.getMonth() + 1}/${e.getDate()}  ·  ${days}日間`
}

const templateOptions = [
  { emoji: '🌺', label: '沖縄 4日間', desc: '海・観光・グルメ' },
  { emoji: '⛩️', label: '京都 3日間', desc: '寺社巡り・紅葉' },
  { emoji: '🗼', label: '東京 2日間', desc: 'グルメ・ショッピング' },
  { emoji: '🌏', label: 'ヨーロッパ 7日間', desc: '観光周遊' },
]

export default function TripListScreen({ trips, mode, onSelectTrip, onBack }: TripListScreenProps) {
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)

  return (
    <div className="min-h-screen max-w-[430px] mx-auto bg-cream flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-muted">
            <ArrowLeft size={20} />
          </button>
          <div
            className="text-[10px] tracking-[0.3em] uppercase text-muted"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {mode === 'host' ? 'Host Mode' : 'Guest Mode'}
          </div>
          <div className="w-5" />
        </div>

        <h2
          className="text-navy mt-6"
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '34px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          あなたの旅
        </h2>
        <p className="text-muted text-sm mt-1">これからの旅、思い出の旅</p>
      </div>

      {/* Trip cards */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4">
        {trips.map((trip) => {
          const daysUntil = getDaysUntil(trip.startDate)
          const isOngoing = daysUntil <= 0 && getDaysUntil(trip.endDate) >= 0
          const isPast = getDaysUntil(trip.endDate) < 0

          return (
            <button
              key={trip.id}
              onClick={() => onSelectTrip(trip)}
              className="w-full rounded-3xl overflow-hidden shadow-md active:scale-[0.98] transition-all text-left relative"
              style={{ minHeight: 200 }}
            >
              {/* Cover image */}
              <div
                className="absolute inset-0 bg-navy"
                style={{
                  backgroundImage: `url(${trip.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                {isOngoing && (
                  <span className="bg-coral text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
                    旅行中
                  </span>
                )}
                {!isOngoing && !isPast && daysUntil <= 30 && (
                  <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
                    あと {daysUntil} 日
                  </span>
                )}
                {isPast && (
                  <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
                    思い出
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="relative p-6 pt-24 flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                  <h3
                    className="text-white leading-none"
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '26px',
                      fontWeight: 800,
                    }}
                  >
                    {trip.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {trip.members.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-white/40"
                        style={{ background: m.color }}
                      >
                        <span className="text-[10px]">{m.emoji}</span>
                      </div>
                    ))}
                    {trip.members.length > 4 && (
                      <span className="text-white/60 text-xs">+{trip.members.length - 4}</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-white/60" />
              </div>
            </button>
          )
        })}

        {/* New trip / template buttons (host only) */}
        {mode === 'host' && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setShowNewTrip(true)}
              className="w-full rounded-2xl border-2 border-dashed border-bdr p-5 flex items-center gap-3 text-left active:bg-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                <Plus size={20} className="text-coral" />
              </div>
              <div>
                <div className="text-navy font-semibold text-sm">新しい旅を作る</div>
                <div className="text-muted text-xs mt-0.5">旅行を一から計画する</div>
              </div>
            </button>

            <button
              onClick={() => setShowTemplate(true)}
              className="w-full rounded-2xl border-2 border-dashed border-bdr p-5 flex items-center gap-3 text-left active:bg-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                <Copy size={20} className="text-teal" />
              </div>
              <div>
                <div className="text-navy font-semibold text-sm">テンプレートから作る</div>
                <div className="text-muted text-xs mt-0.5">沖縄・京都・海外など</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* New trip modal */}
      {showNewTrip && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setShowNewTrip(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 bg-bdr rounded-full mx-auto mb-6" />
            <h3 className="text-navy font-bold text-lg mb-5">新しい旅を作る</h3>
            <div className="space-y-3">
              <div>
                <label className="text-muted text-xs font-medium tracking-wide uppercase">旅行名</label>
                <input
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="OKINAWA 2026"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-muted text-xs font-medium tracking-wide uppercase">出発日</label>
                  <input
                    type="date"
                    className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-muted text-xs font-medium tracking-wide uppercase">帰宅日</label>
                  <input
                    type="date"
                    className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted text-xs font-medium tracking-wide uppercase">目的地</label>
                <input
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="沖縄"
                />
              </div>
              <button className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm mt-2 active:bg-coral-dark transition-colors">
                作成する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template modal */}
      {showTemplate && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setShowTemplate(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 bg-bdr rounded-full mx-auto mb-6" />
            <h3 className="text-navy font-bold text-lg mb-5">テンプレートを選ぶ</h3>
            <div className="space-y-3">
              {templateOptions.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setShowTemplate(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-cream border border-bdr active:border-coral transition-colors text-left"
                >
                  <div className="text-3xl">{t.emoji}</div>
                  <div>
                    <div className="text-navy font-semibold text-sm">{t.label}</div>
                    <div className="text-muted text-xs">{t.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-muted ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
