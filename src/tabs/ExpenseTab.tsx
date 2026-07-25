import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Trip, AppMode } from '../types'

interface ExpenseTabProps {
  trip: Trip
  mode: AppMode
}

const CATEGORIES = ['交通', '宿泊', '食事', '観光', '体験', 'ショッピング', 'その他']
const CATEGORY_COLORS: Record<string, string> = {
  交通: '#5BA8F5',
  宿泊: '#C9952A',
  食事: '#E8462A',
  観光: '#008888',
  体験: '#FF6B9D',
  ショッピング: '#A78BFA',
  その他: '#8B8580',
}

function calcSettlement(members: string[], expenses: { amount: number; paidBy: string; splitWith: string[] }[]) {
  const balance: Record<string, number> = {}
  members.forEach((m) => (balance[m] = 0))

  expenses.forEach((e) => {
    const share = e.amount / e.splitWith.length
    e.splitWith.forEach((m) => {
      if (balance[m] !== undefined) balance[m] -= share
    })
    if (balance[e.paidBy] !== undefined) balance[e.paidBy] += e.amount
  })

  const settlements: { from: string; to: string; amount: number }[] = []
  const debtors = Object.entries(balance)
    .filter(([, v]) => v < -1)
    .map(([k, v]) => ({ name: k, amount: v }))
    .sort((a, b) => a.amount - b.amount)
  const creditors = Object.entries(balance)
    .filter(([, v]) => v > 1)
    .map(([k, v]) => ({ name: k, amount: v }))
    .sort((a, b) => b.amount - a.amount)

  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debt = Math.min(-debtors[i].amount, creditors[j].amount)
    if (debt > 1) {
      settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(debt) })
    }
    debtors[i].amount += debt
    creditors[j].amount -= debt
    if (Math.abs(debtors[i].amount) < 1) i++
    if (Math.abs(creditors[j].amount) < 1) j++
  }

  return { balance, settlements }
}

export default function ExpenseTab({ trip, mode }: ExpenseTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [showSettlement, setShowSettlement] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const memberNames = trip.members.map((m) => m.nickname)
  const { balance, settlements } = calcSettlement(
    memberNames,
    trip.expenses.map((e) => ({
      amount: e.amount,
      paidBy: e.paidBy,
      splitWith: e.splitWith,
    }))
  )

  const total = trip.expenses.reduce((s, e) => s + e.amount, 0)
  const perPerson = total / (memberNames.length || 1)

  const filtered = activeCategory
    ? trip.expenses.filter((e) => e.category === activeCategory)
    : trip.expenses

  const categoryTotals = CATEGORIES.map((cat) => ({
    cat,
    amount: trip.expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.amount > 0)

  return (
    <div className="bg-cream min-h-screen pb-24">
      {/* Header */}
      <div className="bg-navy px-6 pt-14 pb-6">
        <h2
          className="text-white mb-1"
          style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 700 }}
        >
          費用管理
        </h2>
        <p className="text-white/50 text-xs">ワリカン · 精算管理</p>

        {/* Total */}
        <div className="mt-5 bg-white/10 rounded-2xl p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/50 text-xs mb-1">総費用</p>
              <p
                className="text-white"
                style={{ fontFamily: 'DM Mono, monospace', fontSize: '34px', fontWeight: 500, lineHeight: 1 }}
              >
                ¥{total.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs mb-1">1人あたり</p>
              <p className="text-coral font-bold text-xl" style={{ fontFamily: 'DM Mono, monospace' }}>
                ¥{Math.round(perPerson).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Per-person balance */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
            {memberNames.map((name) => {
              const bal = balance[name] || 0
              const member = trip.members.find((m) => m.nickname === name)
              return (
                <div key={name} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <span>{member?.emoji}</span>
                  <span className="text-white text-xs">{name}</span>
                  <span
                    className={`text-xs font-bold ${bal >= 0 ? 'text-teal' : 'text-coral'}`}
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {bal >= 0 ? '+' : ''}¥{Math.round(bal).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              !activeCategory ? 'bg-navy text-white' : 'bg-white text-muted border border-bdr'
            }`}
          >
            すべて
          </button>
          {categoryTotals.map(({ cat }) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat ? 'text-white' : 'bg-white text-muted border border-bdr'
              }`}
              style={activeCategory === cat ? { background: CATEGORY_COLORS[cat] } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expense list */}
        <div className="space-y-2">
          {filtered.map((expense) => {
            const share = Math.round(expense.amount / expense.splitWith.length)
            return (
              <div key={expense.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{expense.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-navy text-sm font-medium leading-snug">{expense.title}</p>
                      <p
                        className="text-navy font-bold text-sm flex-shrink-0"
                        style={{ fontFamily: 'DM Mono, monospace' }}
                      >
                        ¥{expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[10px] rounded-full px-2 py-0.5 font-medium text-white"
                        style={{ background: CATEGORY_COLORS[expense.category] || '#8B8580' }}
                      >
                        {expense.category}
                      </span>
                      <span className="text-muted text-xs">{expense.paidBy} が立替</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-bdr flex items-center justify-between">
                      <span className="text-muted text-xs">{expense.splitWith.length}人で割り勘</span>
                      <span className="text-coral text-xs font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                        1人 ¥{share.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Settlement section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowSettlement(!showSettlement)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <span className="text-navy font-semibold text-sm">精算方法</span>
            </div>
            {showSettlement ? (
              <ChevronUp size={16} className="text-muted" />
            ) : (
              <ChevronDown size={16} className="text-muted" />
            )}
          </button>

          {showSettlement && (
            <div className="px-4 pb-4 space-y-2 border-t border-bdr pt-3">
              {settlements.length === 0 ? (
                <p className="text-muted text-sm text-center py-2">精算不要です 🎉</p>
              ) : (
                settlements.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-cream rounded-xl p-3">
                    <span className="text-navy text-sm font-medium">{s.from}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-px bg-bdr" />
                      <span className="text-coral text-xs font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                        ¥{s.amount.toLocaleString()}
                      </span>
                      <div className="flex-1 h-px bg-bdr" />
                    </div>
                    <span className="text-navy text-sm font-medium">{s.to}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add button */}
        {mode === 'host' && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full bg-coral text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold shadow-sm active:bg-coral-dark"
          >
            <Plus size={18} />
            支払いを追加
          </button>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">支払いを追加</h3>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-muted text-xs font-medium">タイトル</label>
                <input
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="夕食代"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium">金額</label>
                <input
                  type="number"
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium">立替えた人</label>
                <select className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr">
                  {trip.members.map((m) => (
                    <option key={m.id} value={m.nickname}>{m.nickname}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted text-xs font-medium">カテゴリー</label>
                <select className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr">
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAdd(false)}
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
