import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Wifi,
  Car,
  X,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { Trip, AppMode, MemoItem, PackingItem, Member } from '../types'

interface MoreTabProps {
  trip: Trip
  mode: AppMode
}

type SubScreen = 'menu' | 'flight' | 'hotel' | 'memo' | 'packing' | 'members'

const menuItems = [
  { id: 'flight' as SubScreen, emoji: '✈️', label: 'フライト', desc: '便名・座席・ターミナル', color: '#1B2A4A' },
  { id: 'hotel' as SubScreen, emoji: '🏨', label: '宿', desc: 'チェックイン・Wi-Fi・施設情報', color: '#C9952A' },
  { id: 'memo' as SubScreen, emoji: '📝', label: 'メモ', desc: '集合場所・注意事項・連絡先', color: '#008888' },
  { id: 'packing' as SubScreen, emoji: '🎒', label: '持ち物', desc: '荷物チェックリスト', color: '#E8462A' },
  { id: 'members' as SubScreen, emoji: '👥', label: 'メンバー', desc: '名前・役割・プロフィール', color: '#5BA8F5' },
  { id: 'vote', emoji: '🗳️', label: '投票', desc: 'みんなで決める', color: '#A78BFA', comingSoon: true },
  { id: 'photos', emoji: '📷', label: '写真', desc: 'アルバム・シェア', color: '#FF6B9D', comingSoon: true },
  { id: 'map', emoji: '🗺️', label: '地図', desc: 'スポット・ルート', color: '#5BA8F5', comingSoon: true },
  { id: 'contacts', emoji: '📞', label: '連絡先', desc: '宿・航空・緊急', color: '#6BCB77', comingSoon: true },
]

// ─── Flight ───────────────────────────────────────────────
function FlightScreen({ trip }: { trip: Trip }) {
  return (
    <div className="px-5 py-4 space-y-4">
      {trip.flights.map((f) => (
        <div key={f.flightNumber} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ background: f.type === 'departure' ? '#1B2A4A' : '#008888' }}
          >
            <span className="text-white text-lg">
              {f.type === 'departure' ? '🛫' : '🛬'}
            </span>
            <span className="text-white/80 text-xs font-medium">
              {f.type === 'departure' ? '往路' : '復路'} · {f.date}
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col">
                <span
                  className="text-navy font-bold text-2xl"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {f.departTime}
                </span>
                <span className="text-muted text-sm">{f.from}</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <span
                  className="text-muted text-[10px]"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {f.airline} {f.flightNumber}
                </span>
                <div className="flex items-center gap-1 w-full">
                  <div className="flex-1 h-px bg-bdr" />
                  <span>✈️</span>
                  <div className="flex-1 h-px bg-bdr" />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className="text-navy font-bold text-2xl"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {f.arriveTime}
                </span>
                <span className="text-muted text-sm">{f.to}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {f.terminal && (
                <div className="bg-cream rounded-xl p-3">
                  <p className="text-muted text-[10px] font-medium mb-0.5">
                    ターミナル
                  </p>
                  <p className="text-navy text-sm font-semibold">{f.terminal}</p>
                </div>
              )}

              {f.gate && (
                <div className="bg-cream rounded-xl p-3">
                  <p className="text-muted text-[10px] font-medium mb-0.5">
                    ゲート
                  </p>
                  <p className="text-navy text-sm font-semibold">{f.gate}</p>
                </div>
              )}

              <div className="bg-cream rounded-xl p-3 col-span-2">
                <p className="text-muted text-[10px] font-medium mb-1">座席</p>
                <div className="flex gap-2 flex-wrap">
                  {f.seats.map((seat) => (
                    <span
                      key={seat}
                      className="bg-navy text-white text-xs rounded-lg px-2.5 py-1 font-mono"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-3 flex items-center justify-center gap-2 text-coral text-sm font-medium py-2.5 rounded-xl border border-bdr active:bg-cream">
              <ExternalLink size={14} />
              航空会社サイト
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Hotel ────────────────────────────────────────────────
function HotelScreen({ trip }: { trip: Trip }) {
  const h = trip.hotel
  const checkInDate = new Date(h.checkIn)
  const checkOutDate = new Date(h.checkOut)

  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) /
    (1000 * 60 * 60 * 24)
  )

  const fmt = (d: Date) =>
    `${d.getMonth() + 1}/${d.getDate()} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="relative h-40 bg-navy">
          <img
            src={h.image}
            alt={h.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />

          <div className="absolute bottom-4 left-5">
            <h3
              className="text-white font-bold text-xl"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {h.name}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">{h.address}</p>
          </div>
        </div>

        <div className="flex border-b border-bdr">
          <div className="flex-1 p-4 border-r border-bdr">
            <p className="text-muted text-xs mb-1">チェックイン</p>
            <p className="text-navy font-bold text-sm">{fmt(checkInDate)}</p>
          </div>

          <div className="flex-1 p-4">
            <p className="text-muted text-xs mb-1">チェックアウト</p>
            <p className="text-navy font-bold text-sm">{fmt(checkOutDate)}</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div
            className="text-muted text-xs font-medium"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {nights} 泊
          </div>

          {h.wifi && (
            <div className="flex items-start gap-3 bg-cream rounded-xl p-3">
              <Wifi size={16} className="text-teal mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-muted text-[10px] font-medium">Wi-Fi</p>
                <p
                  className="text-navy text-sm mt-0.5"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {h.wifi}
                </p>
              </div>
            </div>
          )}

          {h.keyCode && (
            <div className="flex items-start gap-3 bg-cream rounded-xl p-3">
              <span className="text-base">🔑</span>
              <div>
                <p className="text-muted text-[10px] font-medium">部屋番号</p>
                <p className="text-navy text-sm font-bold mt-0.5">
                  {h.keyCode}
                </p>
              </div>
            </div>
          )}

          {h.parking && (
            <div className="flex items-center gap-3 bg-cream rounded-xl p-3">
              <Car size={16} className="text-navy flex-shrink-0" />
              <p className="text-navy text-sm">駐車場あり</p>
            </div>
          )}

          {h.notes && (
            <div className="bg-cream rounded-xl p-3">
              <p className="text-muted text-[10px] font-medium mb-1">
                施設ルール
              </p>
              <p className="text-navy text-sm leading-relaxed whitespace-pre-line">
                {h.notes}
              </p>
            </div>
          )}

          <button className="w-full flex items-center justify-center gap-2 text-coral text-sm font-medium py-2.5 rounded-xl border border-bdr active:bg-cream">
            <ExternalLink size={14} />
            Google マップで開く
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Memo ─────────────────────────────────────────────────
function MemoScreen({ trip, mode }: { trip: Trip; mode: AppMode }) {
  const [items, setItems] = useState<MemoItem[]>(trip.memos)
  const [showAdd, setShowAdd] = useState(false)

  const toggleChecklistItem = (memoId: string, itemIdx: number) => {
    setItems((prev) =>
      prev.map((m) =>
        m.id === memoId && m.items
          ? {
            ...m,
            items: m.items.map((it, i) =>
              i === itemIdx ? { ...it, done: !it.done } : it
            ),
          }
          : m
      )
    )
  }

  const pinned = items.filter((m) => m.pinned)
  const unpinned = items.filter((m) => !m.pinned)

  return (
    <div className="px-5 py-4 space-y-4">
      {[...pinned, ...unpinned].map((memo) => (
        <div key={memo.id} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {memo.pinned && <span className="text-gold text-xs">📌</span>}
              <h4 className="text-navy font-semibold text-sm">{memo.title}</h4>
            </div>
          </div>

          {memo.type === 'note' && memo.content && (
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
              {memo.content}
            </p>
          )}

          {memo.type === 'checklist' && memo.items && (
            <div className="space-y-2">
              {memo.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    mode === 'host' && toggleChecklistItem(memo.id, idx)
                  }
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.done
                        ? 'bg-teal border-teal'
                        : 'border-bdr'
                      }`}
                  >
                    {item.done && (
                      <Check
                        size={10}
                        className="text-white"
                        strokeWidth={3}
                      />
                    )}
                  </div>

                  <span
                    className={`text-sm ${item.done
                        ? 'line-through text-muted'
                        : 'text-navy'
                      }`}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {mode === 'host' && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-2xl border-2 border-dashed border-bdr p-4 flex items-center gap-2 text-muted text-sm active:bg-white"
        >
          <Plus size={16} />
          メモを追加
        </button>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          />

          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">
                メモを追加
              </h3>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} className="text-muted" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                placeholder="タイトル"
              />

              <textarea
                className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral resize-none"
                rows={4}
                placeholder="内容を入力..."
              />

              <button
                onClick={() => setShowAdd(false)}
                className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm"
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

// ─── Packing ──────────────────────────────────────────────
function PackingScreen({
  trip,
  mode,
}: {
  trip: Trip
  mode: AppMode
}) {
  const [items, setItems] = useState<PackingItem[]>(trip.packing)

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, done: !i.done } : i
      )
    )
  }

  const shared = items.filter((i) => !i.personal)
  const personal = items.filter((i) => i.personal)
  const doneCount = items.filter((i) => i.done).length

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-navy text-sm font-semibold">
            準備の進捗
          </span>
          <span className="text-coral font-bold text-sm">
            {doneCount}/{items.length}
          </span>
        </div>

        <div className="h-2 bg-bdr rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all"
            style={{
              width: `${items.length === 0 ? 0 : (doneCount / items.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div>
        <p className="text-muted text-xs font-medium tracking-wide uppercase px-1 mb-2">
          共通
        </p>

        <div className="space-y-2">
          {shared.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                mode === 'host' && toggle(item.id)
              }
              className="w-full bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm text-left"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.done
                    ? 'bg-teal border-teal'
                    : 'border-bdr'
                  }`}
              >
                {item.done && (
                  <Check
                    size={10}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
              </div>

              <span
                className={`text-sm flex-1 ${item.done
                    ? 'line-through text-muted'
                    : 'text-navy'
                  }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-muted text-xs font-medium tracking-wide uppercase px-1 mb-2">
          個人
        </p>

        <div className="space-y-2">
          {personal.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                mode === 'host' && toggle(item.id)
              }
              className="w-full bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm text-left"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.done
                    ? 'bg-teal border-teal'
                    : 'border-bdr'
                  }`}
              >
                {item.done && (
                  <Check
                    size={10}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
              </div>

              <span
                className={`text-sm flex-1 ${item.done
                    ? 'line-through text-muted'
                    : 'text-navy'
                  }`}
              >
                {item.name}
              </span>

              {item.assignee && (
                <span className="text-muted text-xs">
                  {item.assignee}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Members ──────────────────────────────────────────────
function MembersScreen({
  trip,
  mode,
}: {
  trip: Trip
  mode: AppMode
}) {
  const [members, setMembers] = useState<Member[]>(trip.members)
  const [editing, setEditing] = useState<Member | null>(null)

  const saveMember = () => {
    if (!editing) return

    setMembers((prev) =>
      prev.map((member) =>
        member.id === editing.id ? editing : member
      )
    )

    setEditing(null)
  }

  const deleteMember = (id: string) => {
    if (!window.confirm('このメンバーを削除しますか？')) return

    setMembers((prev) =>
      prev.filter((member) => member.id !== id)
    )
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {members.map((member, idx) => (
        <div
          key={member.id || idx}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: member.color + '30',
                border: `2px solid ${member.color}50`,
              }}
            >
              {member.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-navy font-bold text-base">
                {member.nickname || '名前未設定'}
              </p>

              {member.name && (
                <p className="text-muted text-xs mt-0.5">
                  {member.name}
                </p>
              )}

              <span
                className="inline-block text-xs rounded-full px-2.5 py-0.5 font-medium text-white mt-1"
                style={{ background: member.color }}
              >
                {member.role || 'メンバー'}
              </span>
            </div>

            {mode === 'host' && (
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing({ ...member })}
                  className="w-9 h-9 rounded-full bg-cream flex items-center justify-center"
                >
                  <Pencil size={15} className="text-navy" />
                </button>

                <button
                  onClick={() => deleteMember(member.id)}
                  className="w-9 h-9 rounded-full bg-cream flex items-center justify-center"
                >
                  <Trash2 size={15} className="text-coral" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {mode === 'host' && (
        <button
          onClick={() =>
            setEditing({
              id: `member-${Date.now()}`,
              name: '',
              nickname: '',
              role: 'メンバー',
              color: '#5BA8F5',
              emoji: '😊',
            })
          }
          className="w-full rounded-2xl border-2 border-dashed border-bdr p-4 flex items-center justify-center gap-2 text-muted text-sm active:bg-white"
        >
          <Plus size={16} />
          メンバーを追加
        </button>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />

          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">
                メンバーを編集
              </h3>

              <button onClick={() => setEditing(null)}>
                <X size={20} className="text-muted" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-muted text-xs mb-1 block">
                  ニックネーム
                </label>
                <input
                  value={editing.nickname}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      nickname: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="例：さら"
                />
              </div>

              <div>
                <label className="text-muted text-xs mb-1 block">
                  名前
                </label>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="本名など"
                />
              </div>

              <div>
                <label className="text-muted text-xs mb-1 block">
                  役割
                </label>
                <input
                  value={editing.role}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      role: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="例：幹事"
                />
              </div>

              <div>
                <label className="text-muted text-xs mb-1 block">
                  絵文字
                </label>
                <input
                  value={editing.emoji}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      emoji: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="🌸"
                />
              </div>

              <button
                onClick={saveMember}
                className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm mt-2"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main MoreTab ─────────────────────────────────────────
export default function MoreTab({ trip, mode }: MoreTabProps) {
  const [sub, setSub] = useState<SubScreen>('menu')

  const subTitles: Record<SubScreen, string> = {
    menu: 'もっと',
    flight: 'フライト',
    hotel: '宿',
    memo: 'メモ',
    packing: '持ち物',
    members: 'メンバー',
  }

  return (
    <div className="bg-cream min-h-screen pb-24">
      <div className="bg-navy px-6 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-1">
          {sub !== 'menu' && (
            <button
              onClick={() => setSub('menu')}
              className="text-white/60"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <h2
            className="text-white"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            {subTitles[sub]}
          </h2>
        </div>

        {sub === 'menu' && (
          <p className="text-white/50 text-xs">
            フライト・宿・メモ・持ち物など
          </p>
        )}
      </div>

      {sub === 'menu' && (
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  !item.comingSoon &&
                  setSub(item.id as SubScreen)
                }
                className={`bg-white rounded-2xl p-4 text-left shadow-sm transition-all active:scale-95 relative overflow-hidden ${item.comingSoon ? 'opacity-60' : ''
                  }`}
              >
                {item.comingSoon && (
                  <div className="absolute top-2 right-2 bg-bdr text-muted text-[8px] rounded-full px-2 py-0.5 font-medium">
                    近日公開
                  </div>
                )}

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                  style={{
                    background: item.color + '18',
                  }}
                >
                  {item.emoji}
                </div>

                <p className="text-navy font-semibold text-sm">
                  {item.label}
                </p>

                <p className="text-muted text-[11px] mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'flight' && <FlightScreen trip={trip} />}
      {sub === 'hotel' && <HotelScreen trip={trip} />}
      {sub === 'memo' && <MemoScreen trip={trip} mode={mode} />}
      {sub === 'packing' && (
        <PackingScreen trip={trip} mode={mode} />
      )}
      {sub === 'members' && (
        <MembersScreen trip={trip} mode={mode} />
      )}
    </div>
  )
}
