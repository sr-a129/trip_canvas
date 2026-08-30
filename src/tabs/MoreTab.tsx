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

import type {
  Trip,
  AppMode,
  MemoItem,
  PackingItem,
  Flight,
  Hotel,
} from '../types'

interface MoreTabProps {
  trip: Trip
  mode: AppMode
  onUpdateTrip: (trip: Trip) => void
}

type SubScreen =
  | 'menu'
  | 'flight'
  | 'hotel'
  | 'memo'
  | 'packing'

const menuItems = [
  {
    id: 'flight' as SubScreen,
    emoji: '✈️',
    label: 'フライト',
    desc: '便名・座席・ターミナル',
    color: '#1B2A4A',
  },
  {
    id: 'hotel' as SubScreen,
    emoji: '🏨',
    label: '宿',
    desc: 'チェックイン・Wi-Fi・施設情報',
    color: '#C9952A',
  },
  {
    id: 'memo' as SubScreen,
    emoji: '📝',
    label: 'メモ',
    desc: '集合場所・注意事項・連絡先',
    color: '#008888',
  },
  {
    id: 'packing' as SubScreen,
    emoji: '🎒',
    label: '持ち物',
    desc: '荷物チェックリスト',
    color: '#E8462A',
  },
  {
    id: 'vote',
    emoji: '🗳️',
    label: '投票',
    desc: 'みんなで決める',
    color: '#A78BFA',
    comingSoon: true,
  },
  {
    id: 'photos',
    emoji: '📷',
    label: '写真',
    desc: 'アルバム・シェア',
    color: '#FF6B9D',
    comingSoon: true,
  },
  {
    id: 'map',
    emoji: '🗺️',
    label: '地図',
    desc: 'スポット・ルート',
    color: '#5BA8F5',
    comingSoon: true,
  },
  {
    id: 'contacts',
    emoji: '📞',
    label: '連絡先',
    desc: '宿・航空・緊急',
    color: '#6BCB77',
    comingSoon: true,
  },
]

/* =====================================================
   Flight
===================================================== */

function FlightScreen({
  trip,
  mode,
  onUpdateTrip,
}: {
  trip: Trip
  mode: AppMode
  onUpdateTrip: (trip: Trip) => void
}) {
  const [editing, setEditing] = useState<Flight | null>(null)
  const [showForm, setShowForm] = useState(false)

  const emptyFlight: Flight = {
    type: 'departure',
    airline: '',
    flightNumber: '',
    from: '',
    to: '',
    departTime: '',
    arriveTime: '',
    terminal: '',
    gate: '',
    seats: [],
    date: trip.startDate,
  }

  const [form, setForm] = useState<Flight>(emptyFlight)

  const openAdd = () => {
    setEditing(null)
    setForm({
      ...emptyFlight,
      date: trip.startDate,
    })
    setShowForm(true)
  }

  const openEdit = (flight: Flight) => {
    setEditing(flight)
    setForm({
      ...flight,
      seats: [...flight.seats],
    })
    setShowForm(true)
  }

  const save = () => {
    if (
      !form.airline.trim() ||
      !form.flightNumber.trim() ||
      !form.from.trim() ||
      !form.to.trim()
    ) {
      alert('航空会社・便名・出発地・到着地を入力してください')
      return
    }

    const flight: Flight = {
      ...form,
      airline: form.airline.trim(),
      flightNumber: form.flightNumber.trim(),
      from: form.from.trim(),
      to: form.to.trim(),
      terminal: form.terminal?.trim(),
      gate: form.gate?.trim(),
      seats: form.seats.map((s) => s.trim()).filter(Boolean),
    }

    const flights = editing
      ? trip.flights.map((f) =>
        f.flightNumber === editing.flightNumber ? flight : f
      )
      : [...trip.flights, flight]

    onUpdateTrip({
      ...trip,
      flights,
    })

    setShowForm(false)
    setEditing(null)
  }

  const remove = (flight: Flight) => {
    if (
      !window.confirm(
        `${flight.airline} ${flight.flightNumber}を削除しますか？`
      )
    ) {
      return
    }

    onUpdateTrip({
      ...trip,
      flights: trip.flights.filter(
        (f) => f.flightNumber !== flight.flightNumber
      ),
    })
  }

  return (
    <div className="px-5 py-4 space-y-4">
      {trip.flights.map((f) => (
        <div
          key={f.flightNumber}
          className="bg-white rounded-2xl overflow-hidden shadow-sm"
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              background:
                f.type === 'departure' ? '#1B2A4A' : '#008888',
            }}
          >
            <span className="text-white text-lg">
              {f.type === 'departure' ? '🛫' : '🛬'}
            </span>

            <span className="text-white/80 text-xs font-medium flex-1">
              {f.type === 'departure' ? '往路' : '復路'} · {f.date}
            </span>

            {mode === 'host' && (
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(f)}
                  className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => remove(f)}
                  className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
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
                  <p className="text-navy text-sm font-semibold">
                    {f.terminal}
                  </p>
                </div>
              )}

              {f.gate && (
                <div className="bg-cream rounded-xl p-3">
                  <p className="text-muted text-[10px] font-medium mb-0.5">
                    ゲート
                  </p>
                  <p className="text-navy text-sm font-semibold">
                    {f.gate}
                  </p>
                </div>
              )}

              {f.seats.length > 0 && (
                <div className="bg-cream rounded-xl p-3 col-span-2">
                  <p className="text-muted text-[10px] font-medium mb-1">
                    座席
                  </p>

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
              )}
            </div>

            <button className="w-full mt-3 flex items-center justify-center gap-2 text-coral text-sm font-medium py-2.5 rounded-xl border border-bdr active:bg-cream">
              <ExternalLink size={14} />
              航空会社サイト
            </button>
          </div>
        </div>
      ))}

      {mode === 'host' && (
        <button
          onClick={openAdd}
          className="w-full rounded-2xl border-2 border-dashed border-bdr p-4 flex items-center justify-center gap-2 text-coral text-sm font-semibold"
        >
          <Plus size={16} />
          フライトを追加
        </button>
      )}

      {trip.flights.length === 0 && (
        <div className="text-center text-muted text-sm py-8">
          フライトが登録されていません
        </div>
      )}

      {showForm && (
        <FlightForm
          form={form}
          setForm={setForm}
          editing={!!editing}
          onSave={save}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function FlightForm({
  form,
  setForm,
  editing,
  onSave,
  onClose,
}: {
  form: Flight
  setForm: (flight: Flight) => void
  editing: boolean
  onSave: () => void
  onClose: () => void
}) {
  const update = (key: keyof Flight, value: string) => {
    setForm({
      ...form,
      [key]: value,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-navy font-bold text-base">
            {editing ? 'フライトを編集' : 'フライトを追加'}
          </h3>

          <button onClick={onClose}>
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="space-y-3">
          <select
            value={form.type}
            onChange={(e) =>
              update('type', e.target.value)
            }
            className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm border border-bdr outline-none"
          >
            <option value="departure">往路</option>
            <option value="arrival">復路</option>
          </select>

          <input
            value={form.airline}
            onChange={(e) => update('airline', e.target.value)}
            className="input-style"
            placeholder="航空会社"
          />

          <input
            value={form.flightNumber}
            onChange={(e) =>
              update('flightNumber', e.target.value)
            }
            className="input-style"
            placeholder="便名（例：NH987）"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.from}
              onChange={(e) => update('from', e.target.value)}
              className="input-style"
              placeholder="出発地"
            />

            <input
              value={form.to}
              onChange={(e) => update('to', e.target.value)}
              className="input-style"
              placeholder="到着地"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.departTime}
              onChange={(e) =>
                update('departTime', e.target.value)
              }
              className="input-style"
              placeholder="出発時刻"
            />

            <input
              value={form.arriveTime}
              onChange={(e) =>
                update('arriveTime', e.target.value)
              }
              className="input-style"
              placeholder="到着時刻"
            />
          </div>

          <input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            className="input-style"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.terminal || ''}
              onChange={(e) =>
                update('terminal', e.target.value)
              }
              className="input-style"
              placeholder="ターミナル"
            />

            <input
              value={form.gate || ''}
              onChange={(e) =>
                update('gate', e.target.value)
              }
              className="input-style"
              placeholder="ゲート"
            />
          </div>

          <input
            value={form.seats.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                seats: e.target.value
                  .split(',')
                  .map((s) => s.trim()),
              })
            }
            className="input-style"
            placeholder="座席（例：15A, 15B）"
          />

          <button
            onClick={onSave}
            className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm mt-2"
          >
            {editing ? '保存する' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* =====================================================
   Hotel
===================================================== */

function HotelScreen({
  trip,
  mode,
  onUpdateTrip,
}: {
  trip: Trip
  mode: AppMode
  onUpdateTrip: (trip: Trip) => void
}) {
  const [showForm, setShowForm] = useState(false)

  const emptyHotel: Hotel = {
    name: '',
    address: '',
    checkIn: '',
    checkOut: '',
    wifi: '',
    keyCode: '',
    parking: false,
    notes: '',
    image: '',
  }

  const [form, setForm] = useState<Hotel>(
    trip.hotel || emptyHotel
  )

  const openEdit = () => {
    setForm({
      ...(trip.hotel || emptyHotel),
    })
    setShowForm(true)
  }

  const openAdd = () => {
    setForm({
      ...emptyHotel,
    })
    setShowForm(true)
  }

  const save = () => {
    if (!form.name.trim() || !form.address.trim()) {
      alert('宿名と住所を入力してください')
      return
    }

    onUpdateTrip({
      ...trip,
      hotel: {
        ...form,
        name: form.name.trim(),
        address: form.address.trim(),
      },
    })

    setShowForm(false)
  }

  const remove = () => {
    if (!trip.hotel) return

    if (!window.confirm(`${trip.hotel.name}を削除しますか？`)) {
      return
    }

    onUpdateTrip({
      ...trip,
      hotel: undefined,
    } as Trip)
  }

  const formatDate = (value?: string) => {
    if (!value) return '未設定'

    const d = new Date(value)

    if (Number.isNaN(d.getTime())) {
      return value
    }

    return `${d.getMonth() + 1}/${d.getDate()} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
  }

  const h = trip.hotel

  return (
    <div className="px-5 py-4 space-y-4">
      {h ? (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="relative h-40 bg-navy">
            {h.image ? (
              <img
                src={h.image}
                alt={h.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                🏨
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />

            {mode === 'host' && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={openEdit}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={remove}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            <div className="absolute bottom-4 left-5 right-5">
              <h3
                className="text-white font-bold text-xl"
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                }}
              >
                {h.name}
              </h3>

              <p className="text-white/60 text-xs mt-0.5">
                {h.address}
              </p>
            </div>
          </div>

          <div className="flex border-b border-bdr">
            <div className="flex-1 p-4 border-r border-bdr">
              <p className="text-muted text-xs mb-1">
                チェックイン
              </p>

              <p className="text-navy font-bold text-sm">
                {formatDate(h.checkIn)}
              </p>
            </div>

            <div className="flex-1 p-4">
              <p className="text-muted text-xs mb-1">
                チェックアウト
              </p>

              <p className="text-navy font-bold text-sm">
                {formatDate(h.checkOut)}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {h.wifi && (
              <div className="flex items-start gap-3 bg-cream rounded-xl p-3">
                <Wifi size={16} className="text-teal mt-0.5" />

                <div>
                  <p className="text-muted text-[10px] font-medium">
                    Wi-Fi
                  </p>

                  <p className="text-navy text-sm mt-0.5">
                    {h.wifi}
                  </p>
                </div>
              </div>
            )}

            {h.keyCode && (
              <div className="flex items-start gap-3 bg-cream rounded-xl p-3">
                <span className="text-base">🔑</span>

                <div>
                  <p className="text-muted text-[10px] font-medium">
                    部屋番号・鍵情報
                  </p>

                  <p className="text-navy text-sm font-bold mt-0.5">
                    {h.keyCode}
                  </p>
                </div>
              </div>
            )}

            {h.parking && (
              <div className="flex items-center gap-3 bg-cream rounded-xl p-3">
                <Car size={16} className="text-navy" />

                <p className="text-navy text-sm">
                  駐車場あり
                </p>
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
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-3">🏨</div>

          <p className="text-navy font-semibold text-sm">
            宿が登録されていません
          </p>

          <p className="text-muted text-xs mt-1">
            宿泊先を追加してください
          </p>
        </div>
      )}

      {mode === 'host' && (
        <button
          onClick={h ? openEdit : openAdd}
          className="w-full rounded-2xl border-2 border-dashed border-bdr p-4 flex items-center justify-center gap-2 text-coral text-sm font-semibold"
        >
          <Plus size={16} />
          {h ? '宿を変更する' : '宿を追加'}
        </button>
      )}

      {showForm && (
        <HotelForm
          form={form}
          setForm={setForm}
          onSave={save}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function HotelForm({
  form,
  setForm,
  onSave,
  onClose,
}: {
  form: Hotel
  setForm: (hotel: Hotel) => void
  onSave: () => void
  onClose: () => void
}) {
  const update = (
    key: keyof Hotel,
    value: string | boolean
  ) => {
    setForm({
      ...form,
      [key]: value,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-navy font-bold text-base">
            宿を編集
          </h3>

          <button onClick={onClose}>
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) =>
              update('name', e.target.value)
            }
            className="input-style"
            placeholder="宿名 *"
          />

          <input
            value={form.address}
            onChange={(e) =>
              update('address', e.target.value)
            }
            className="input-style"
            placeholder="住所 *"
          />

          <div>
            <p className="text-muted text-xs mb-1">
              チェックイン
            </p>

            <input
              type="datetime-local"
              value={form.checkIn}
              onChange={(e) =>
                update('checkIn', e.target.value)
              }
              className="input-style"
            />
          </div>

          <div>
            <p className="text-muted text-xs mb-1">
              チェックアウト
            </p>

            <input
              type="datetime-local"
              value={form.checkOut}
              onChange={(e) =>
                update('checkOut', e.target.value)
              }
              className="input-style"
            />
          </div>

          <input
            value={form.wifi || ''}
            onChange={(e) =>
              update('wifi', e.target.value)
            }
            className="input-style"
            placeholder="Wi-Fi情報"
          />

          <input
            value={form.keyCode || ''}
            onChange={(e) =>
              update('keyCode', e.target.value)
            }
            className="input-style"
            placeholder="部屋番号・鍵情報"
          />

          <label className="flex items-center gap-3 bg-cream rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={form.parking}
              onChange={(e) =>
                update('parking', e.target.checked)
              }
            />

            <span className="text-navy text-sm">
              駐車場あり
            </span>
          </label>

          <textarea
            value={form.notes || ''}
            onChange={(e) =>
              update('notes', e.target.value)
            }
            className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral resize-none"
            rows={4}
            placeholder="施設ルール・メモ"
          />

          <input
            value={form.image || ''}
            onChange={(e) =>
              update('image', e.target.value)
            }
            className="input-style"
            placeholder="画像URL（任意）"
          />

          <button
            onClick={onSave}
            className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm mt-2"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  )
}

/* =====================================================
   Memo
===================================================== */

function MemoScreen({
  trip,
  mode,
}: {
  trip: Trip
  mode: AppMode
}) {
  const [items, setItems] = useState<MemoItem[]>(trip.memos)

  const [showAdd, setShowAdd] = useState(false)

  const toggleChecklistItem = (
    memoId: string,
    itemIdx: number
  ) => {
    setItems((prev) =>
      prev.map((m) =>
        m.id === memoId && m.items
          ? {
            ...m,
            items: m.items.map((it, i) =>
              i === itemIdx
                ? {
                  ...it,
                  done: !it.done,
                }
                : it
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
        <div
          key={memo.id}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {memo.pinned && (
                <span className="text-gold text-xs">
                  📌
                </span>
              )}

              <h4 className="text-navy font-semibold text-sm">
                {memo.title}
              </h4>
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
                    mode === 'host' &&
                    toggleChecklistItem(memo.id, idx)
                  }
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done
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
          className="w-full rounded-2xl border-2 border-dashed border-bdr p-4 flex items-center gap-2 text-muted text-sm"
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
                className="input-style"
                placeholder="タイトル"
              />

              <textarea
                className="w-full bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr resize-none"
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

/* =====================================================
   Packing
===================================================== */

function PackingScreen({
  trip,
  mode,
}: {
  trip: Trip
  mode: AppMode
}) {
  const [items, setItems] = useState<PackingItem[]>(
    trip.packing
  )

  const toggle = (id: string) => {
    if (mode !== 'host') return

    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
            ...i,
            done: !i.done,
          }
          : i
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
              width: `${items.length
                  ? (doneCount / items.length) * 100
                  : 0
                }%`,
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
              onClick={() => toggle(item.id)}
              className="w-full bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm text-left"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done
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
              onClick={() => toggle(item.id)}
              className="w-full bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm text-left"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done
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

/* =====================================================
   Main
===================================================== */

export default function MoreTab({
  trip,
  mode,
  onUpdateTrip,
}: MoreTabProps) {
  const [sub, setSub] = useState<SubScreen>('menu')

  const subTitles: Record<SubScreen, string> = {
    menu: 'もっと',
    flight: 'フライト',
    hotel: '宿',
    memo: 'メモ',
    packing: '持ち物',
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
              fontFamily:
                'Playfair Display, Georgia, serif',
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
                onClick={() => {
                  if (!item.comingSoon) {
                    setSub(item.id as SubScreen)
                  }
                }}
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

      {sub === 'flight' && (
        <FlightScreen
          trip={trip}
          mode={mode}
          onUpdateTrip={onUpdateTrip}
        />
      )}

      {sub === 'hotel' && (
        <HotelScreen
          trip={trip}
          mode={mode}
          onUpdateTrip={onUpdateTrip}
        />
      )}

      {sub === 'memo' && (
        <MemoScreen
          trip={trip}
          mode={mode}
        />
      )}

      {sub === 'packing' && (
        <PackingScreen
          trip={trip}
          mode={mode}
        />
      )}
    </div>
  )
}