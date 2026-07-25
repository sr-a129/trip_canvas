import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import type { Trip } from '../types'

interface ShioriViewProps {
  trip: Trip
  onBack: () => void
}

const dayBgImages = [
  'https://images.unsplash.com/photo-1729290098101-fef6e9be922d?w=800&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1664888883235-dd2b4055ae26?w=800&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1558497346-2668653247c7?w=800&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1664888883613-056db50331a7?w=800&h=600&fit=crop&auto=format',
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`
}

function getTotalDays(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function ShioriView({ trip, onBack }: ShioriViewProps) {
  const [activeSection, setActiveSection] = useState<'cover' | 'members' | number>('cover')
  const totalDays = getTotalDays(trip.startDate, trip.endDate)

  const sections = ['cover', 'members', ...trip.schedule.map((_, i) => i), 'ending'] as const
  const currentIdx = sections.indexOf(activeSection as never)

  const goNext = () => {
    if (currentIdx < sections.length - 1) {
      setActiveSection(sections[currentIdx + 1] as typeof activeSection)
    }
  }
  const goPrev = () => {
    if (currentIdx > 0) {
      setActiveSection(sections[currentIdx - 1] as typeof activeSection)
    }
  }

  return (
    <div
      className="fixed inset-0 max-w-[430px] mx-auto bg-navy overflow-hidden"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-12 left-5 z-50 w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
      >
        <ArrowLeft size={18} className="text-white" />
      </button>

      {/* Section dots */}
      <div className="absolute top-14 right-5 z-50 flex flex-col gap-1.5">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(s as typeof activeSection)}
            className={`rounded-full transition-all ${
              i === currentIdx ? 'w-1.5 h-4 bg-white' : 'w-1.5 h-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* COVER */}
      {activeSection === 'cover' && (
        <div className="absolute inset-0 flex flex-col">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${trip.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/20 to-navy/80" />

          <div className="relative flex flex-col justify-between h-full px-8 py-16">
            <div>
              <p
                className="text-white/50 text-[10px] tracking-[0.35em] uppercase mb-8"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                Trip Canvas · Shiori
              </p>
            </div>

            <div>
              <p
                className="text-white/60 text-xs tracking-[0.2em] uppercase mb-3"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                Episode 1
              </p>
              <div
                className="text-white leading-none mb-2"
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '72px',
                  fontWeight: 900,
                  letterSpacing: '-3px',
                }}
              >
                {trip.destination.toUpperCase().split('').map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
              <p
                className="text-white/70 text-2xl font-light mb-8"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {new Date(trip.startDate).getFullYear()}
              </p>

              <div className="w-12 h-px bg-white/40 mb-6" />

              <p className="text-white/60 text-sm font-light mb-1">はじまり</p>
              <p className="text-white/40 text-xs">
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </p>

              <button
                onClick={goNext}
                className="mt-12 flex items-center gap-2 text-white/50 text-xs tracking-widest uppercase"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                <span>しおりを開く</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS */}
      {activeSection === 'members' && (
        <div className="absolute inset-0 flex flex-col bg-navy px-8 py-16">
          <div className="flex-1 flex flex-col justify-center">
            <p
              className="text-white/40 text-[10px] tracking-[0.35em] uppercase mb-10"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Travellers
            </p>

            <h2
              className="text-white mb-12"
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '36px',
                fontWeight: 700,
              }}
            >
              一緒に行く
              <br />
              メンバー
            </h2>

            <div className="space-y-5">
              {trip.members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: m.color + '40', border: `2px solid ${m.color}60` }}
                  >
                    {m.emoji}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-base">{m.nickname}</div>
                    <div className="text-white/40 text-xs mt-0.5">{m.role}</div>
                  </div>
                  <div
                    className="ml-auto text-white/20 text-xs"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    0{i + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/30 text-sm italic" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                "{trip.members.length}人で紡ぐ、{trip.destination}の旅。"
              </p>
            </div>
          </div>

          <button onClick={goNext} className="flex items-center gap-2 text-white/30 text-xs tracking-widest">
            <span style={{ fontFamily: 'DM Mono, monospace' }}>Day 1 へ</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* DAY PAGES */}
      {typeof activeSection === 'number' && trip.schedule[activeSection] && (
        <div className="absolute inset-0 flex flex-col overflow-hidden">
          {/* Day hero */}
          <div className="relative h-52 flex-shrink-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${dayBgImages[activeSection % dayBgImages.length]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy" />
            <div className="absolute bottom-0 left-0 px-7 pb-6">
              <p
                className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-1"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {trip.schedule[activeSection].label}
              </p>
              <h3
                className="text-white leading-none"
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '38px',
                  fontWeight: 800,
                }}
              >
                {formatDate(trip.schedule[activeSection].date)}
              </h3>
            </div>

            {/* Day number badge */}
            <div
              className="absolute top-5 right-6 text-white/60"
              style={{ fontFamily: 'DM Mono, monospace', fontSize: '48px', fontWeight: 500, lineHeight: 1 }}
            >
              {String(activeSection + 1).padStart(2, '0')}
            </div>
          </div>

          {/* Schedule */}
          <div className="flex-1 overflow-y-auto bg-navy px-6 pt-6 pb-24">
            <div className="space-y-4">
              {trip.schedule[activeSection].items.map((item, idx) => (
                <div key={item.id} className="flex gap-4">
                  {/* Time + line */}
                  <div className="flex flex-col items-center w-12 flex-shrink-0">
                    <p
                      className="text-white/40 text-xs leading-none"
                      style={{ fontFamily: 'DM Mono, monospace' }}
                    >
                      {item.time}
                    </p>
                    {idx < trip.schedule[activeSection].items.length - 1 && (
                      <div className="flex-1 w-px bg-white/10 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-lg leading-none mt-0.5">{item.emoji}</span>
                      <div>
                        <p className="text-white text-sm font-medium leading-snug">{item.title}</p>
                        {item.location && (
                          <p className="text-white/40 text-xs mt-0.5">📍 {item.location}</p>
                        )}
                        {item.memo && (
                          <p className="text-white/30 text-xs mt-1 italic">{item.memo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6">
            {currentIdx > 0 && (
              <button
                onClick={goPrev}
                className="bg-white/10 backdrop-blur rounded-full px-5 py-2.5 text-white/60 text-xs"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                ← 前へ
              </button>
            )}
            <div className="flex-1" />
            {currentIdx < sections.length - 1 && (
              <button
                onClick={goNext}
                className="bg-white/10 backdrop-blur rounded-full px-5 py-2.5 text-white/60 text-xs"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                次へ →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ENDING */}
      {activeSection === 'ending' && (
        <div className="absolute inset-0 flex flex-col">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1754228811035-d220f70b86d9?w=800&h=1200&fit=crop&auto=format)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/30 to-navy/90" />

          <div className="relative flex flex-col justify-between h-full px-8 py-20">
            <div />
            <div>
              <p
                className="text-white/40 text-[10px] tracking-[0.35em] uppercase mb-6"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                Fin.
              </p>
              <p className="text-white/60 text-lg font-light mb-2">
                {totalDays}日間の旅
              </p>
              <h2
                className="text-white"
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '42px',
                  fontWeight: 700,
                  letterSpacing: '-1px',
                }}
              >
                おつかれさまでした
              </h2>

              <div className="w-12 h-px bg-white/30 my-8" />

              <p className="text-white/50 text-sm leading-relaxed font-light">
                {trip.members.map((m) => m.nickname).join('、')}、<br />
                素敵な旅をありがとう。
              </p>

              <div className="mt-12 flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 bg-white/15 backdrop-blur border border-white/20 text-white rounded-xl py-3 text-sm font-medium active:bg-white/20"
                >
                  旅一覧へ戻る
                </button>
                <button
                  onClick={() => setActiveSection('cover')}
                  className="flex-1 bg-coral text-white rounded-xl py-3 text-sm font-medium active:bg-coral-dark"
                >
                  最初から見る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
