import { useEffect, useMemo, useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import type { Trip, AppMode } from '../types'
import { supabase } from '../lib/supabase'

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

type Expense = {
  id: string
  trip_id: string
  title: string
  amount: number
  paid_by: string
  category: string
  emoji: string
  split_with: string[]
}

/* split_withを安全に配列へ変換 */
function normalizeSplitWith(value: unknown, members: string[]): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string')
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)

      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === 'string')
      }
    } catch {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    }
  }

  return members
}

function calcSettlement(
  members: string[],
  expenses: Expense[]
) {
  const balance: Record<string, number> = {}

  members.forEach((member) => {
    balance[member] = 0
  })

  expenses.forEach((expense) => {
    const splitMembers = normalizeSplitWith(
      expense.split_with,
      members
    )

    if (splitMembers.length === 0) return

    const share = Number(expense.amount) / splitMembers.length

    splitMembers.forEach((member) => {
      if (balance[member] !== undefined) {
        balance[member] -= share
      }
    })

    if (balance[expense.paid_by] !== undefined) {
      balance[expense.paid_by] += Number(expense.amount)
    }
  })

  const settlements: {
    from: string
    to: string
    amount: number
  }[] = []

  const debtors = Object.entries(balance)
    .filter(([, amount]) => amount < -1)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => a.amount - b.amount)

  const creditors = Object.entries(balance)
    .filter(([, amount]) => amount > 1)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debt = Math.min(
      -debtors[i].amount,
      creditors[j].amount
    )

    if (debt > 1) {
      settlements.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(debt),
      })
    }

    debtors[i].amount += debt
    creditors[j].amount -= debt

    if (Math.abs(debtors[i].amount) < 1) i++
    if (Math.abs(creditors[j].amount) < 1) j++
  }

  return { balance, settlements }
}

export default function ExpenseTab({
  trip,
  mode,
}: ExpenseTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const [showAdd, setShowAdd] = useState(false)
  const [showSettlement, setShowSettlement] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [category, setCategory] = useState('その他')
  const [splitWith, setSplitWith] = useState<string[]>([])

  const [saving, setSaving] = useState(false)

  const memberNames = trip.members.map((member) => member.nickname)

  /* =========================
     Supabaseから取得
  ========================= */

  const loadExpenses = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', trip.id)
      .order('id')

    if (error) {
      console.error('費用取得エラー:', error)
      setExpenses([])
      setLoading(false)
      return
    }

    const normalized = (data ?? []).map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      split_with: normalizeSplitWith(
        expense.split_with,
        memberNames
      ),
    })) as Expense[]

    setExpenses(normalized)
    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [trip.id])

  /* =========================
     割り勘計算
  ========================= */

  const { balance, settlements } = useMemo(() => {
    return calcSettlement(memberNames, expenses)
  }, [memberNames.join('|'), expenses])

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const perPerson = total / (memberNames.length || 1)

  const filtered = activeCategory
    ? expenses.filter(
      (expense) => expense.category === activeCategory
    )
    : expenses

  const categoryTotals = CATEGORIES
    .map((cat) => ({
      cat,
      amount: expenses
        .filter((expense) => expense.category === cat)
        .reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        ),
    }))
    .filter((item) => item.amount > 0)

  /* =========================
     追加フォーム
  ========================= */

  const openAddForm = () => {
    setEditingExpense(null)
    setTitle('')
    setAmount('')
    setPaidBy(memberNames[0] ?? '')
    setCategory('その他')
    setSplitWith([...memberNames])
    setShowAdd(true)
  }

  /* =========================
     編集フォーム
  ========================= */

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense)
    setTitle(expense.title)
    setAmount(String(expense.amount))
    setPaidBy(expense.paid_by)
    setCategory(expense.category || 'その他')

    setSplitWith(
      normalizeSplitWith(
        expense.split_with,
        memberNames
      )
    )

    setShowAdd(true)
  }

  /* =========================
     割り勘対象切り替え
  ========================= */

  const toggleSplitMember = (name: string) => {
    setSplitWith((prev) => {
      if (prev.includes(name)) {
        return prev.filter((member) => member !== name)
      }

      return [...prev, name]
    })
  }

  /* =========================
     保存
  ========================= */

  const saveExpense = async () => {
    const numericAmount = Number(amount)

    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    if (!numericAmount || numericAmount <= 0) {
      alert('金額を入力してください')
      return
    }

    if (!paidBy) {
      alert('立替えた人を選択してください')
      return
    }

    if (splitWith.length === 0) {
      alert('割り勘する人を1人以上選択してください')
      return
    }

    setSaving(true)

    const emoji =
      category === '交通'
        ? '🚗'
        : category === '宿泊'
          ? '🏨'
          : category === '食事'
            ? '🍽️'
            : category === '観光'
              ? '📸'
              : category === '体験'
                ? '🌊'
                : category === 'ショッピング'
                  ? '🛍️'
                  : '💰'

    const expenseData = {
      trip_id: trip.id,
      title: title.trim(),
      amount: numericAmount,
      paid_by: paidBy,
      category,
      emoji,
      split_with: splitWith,
    }

    /* 編集 */
    if (editingExpense) {
      const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', editingExpense.id)
        .select()
        .single()

      if (error) {
        console.error('費用編集エラー:', error)
        alert(`編集に失敗しました：${error.message}`)
        setSaving(false)
        return
      }

      const updatedExpense = {
        ...data,
        amount: Number(data.amount),
        split_with: normalizeSplitWith(
          data.split_with,
          memberNames
        ),
      } as Expense

      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingExpense.id
            ? updatedExpense
            : expense
        )
      )
    }

    /* 新規追加 */
    else {
      const newId = `expense-${Date.now()}`

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          id: newId,
          ...expenseData,
        })
        .select()
        .single()

      if (error) {
        console.error('費用追加エラー:', error)
        alert(`追加に失敗しました：${error.message}`)
        setSaving(false)
        return
      }

      const newExpense = {
        ...data,
        amount: Number(data.amount),
        split_with: normalizeSplitWith(
          data.split_with,
          memberNames
        ),
      } as Expense

      setExpenses((prev) => [
        ...prev,
        newExpense,
      ])
    }

    setSaving(false)
    closeForm()
  }

  /* =========================
     削除
  ========================= */

  const deleteExpense = async (expense: Expense) => {
    const ok = window.confirm(
      `「${expense.title}」を削除しますか？`
    )

    if (!ok) return

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id)

    if (error) {
      console.error('費用削除エラー:', error)
      alert(`削除に失敗しました：${error.message}`)
      return
    }

    setExpenses((prev) =>
      prev.filter((item) => item.id !== expense.id)
    )
  }

  /* =========================
     フォームを閉じる
  ========================= */

  const closeForm = () => {
    setShowAdd(false)
    setEditingExpense(null)
    setTitle('')
    setAmount('')
    setPaidBy('')
    setCategory('その他')
    setSplitWith([])
  }

  return (
    <div className="bg-cream min-h-screen pb-24">

      {/* Header */}

      <div className="bg-navy px-6 pt-14 pb-6">

        <h2
          className="text-white mb-1"
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          費用管理
        </h2>

        <p className="text-white/50 text-xs">
          ワリカン · 精算管理
        </p>

        <div className="mt-5 bg-white/10 rounded-2xl p-4">

          <div className="flex items-end justify-between">

            <div>
              <p className="text-white/50 text-xs mb-1">
                総費用
              </p>

              <p
                className="text-white"
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '34px',
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                ¥{total.toLocaleString()}
              </p>
            </div>

            <div className="text-right">

              <p className="text-white/50 text-xs mb-1">
                1人あたり
              </p>

              <p
                className="text-coral font-bold text-xl"
                style={{
                  fontFamily: 'DM Mono, monospace',
                }}
              >
                ¥{Math.round(perPerson).toLocaleString()}
              </p>

            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">

            {memberNames.map((name, index) => {

              const bal = balance[name] || 0

              const member = trip.members.find(
                (m) => m.nickname === name
              )

              return (
                <div
                  key={`${name}-${index}`}
                  className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1"
                >
                  <span>
                    {member?.emoji}
                  </span>

                  <span className="text-white text-xs">
                    {name}
                  </span>

                  <span
                    className={`text-xs font-bold ${bal >= 0
                        ? 'text-teal'
                        : 'text-coral'
                      }`}
                    style={{
                      fontFamily: 'DM Mono, monospace',
                    }}
                  >
                    {bal >= 0 ? '+' : ''}
                    ¥{Math.round(bal).toLocaleString()}
                  </span>
                </div>
              )
            })}

          </div>

        </div>

      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Category */}

        <div className="flex gap-2 overflow-x-auto pb-1">

          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${!activeCategory
                ? 'bg-navy text-white'
                : 'bg-white text-muted border border-bdr'
              }`}
          >
            すべて
          </button>

          {categoryTotals.map(({ cat }) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(
                  cat === activeCategory
                    ? null
                    : cat
                )
              }
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${activeCategory === cat
                  ? 'text-white'
                  : 'bg-white text-muted border border-bdr'
                }`}
              style={
                activeCategory === cat
                  ? {
                    background:
                      CATEGORY_COLORS[cat],
                  }
                  : {}
              }
            >
              {cat}
            </button>
          ))}

        </div>

        {/* Expense list */}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-muted text-sm">
              読み込み中…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-muted text-sm">
              まだ支払いがありません
            </p>
          </div>
        ) : (
          <div className="space-y-2">

            {filtered.map((expense) => {

              const splitMembers =
                normalizeSplitWith(
                  expense.split_with,
                  memberNames
                )

              const splitCount =
                splitMembers.length || 1

              const share = Math.round(
                Number(expense.amount) /
                splitCount
              )

              return (
                <div
                  key={expense.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >

                  <div className="flex items-start gap-3">

                    <span className="text-2xl">
                      {expense.emoji || '💰'}
                    </span>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <p className="text-navy text-sm font-medium leading-snug">
                          {expense.title}
                        </p>

                        <p
                          className="text-navy font-bold text-sm flex-shrink-0"
                          style={{
                            fontFamily:
                              'DM Mono, monospace',
                          }}
                        >
                          ¥{Number(
                            expense.amount
                          ).toLocaleString()}
                        </p>

                      </div>

                      <div className="flex items-center gap-2 mt-1.5">

                        <span
                          className="text-[10px] rounded-full px-2 py-0.5 font-medium text-white"
                          style={{
                            background:
                              CATEGORY_COLORS[
                              expense.category
                              ] || '#8B8580',
                          }}
                        >
                          {expense.category}
                        </span>

                        <span className="text-muted text-xs">
                          {expense.paid_by} が立替
                        </span>

                      </div>

                      <div className="mt-2 pt-2 border-t border-bdr flex items-center justify-between">

                        <span className="text-muted text-xs">
                          {splitCount}人で割り勘
                        </span>

                        <span
                          className="text-coral text-xs font-bold"
                          style={{
                            fontFamily:
                              'DM Mono, monospace',
                          }}
                        >
                          1人 ¥
                          {share.toLocaleString()}
                        </span>

                      </div>

                      {/* 編集・削除 */}

                      {mode === 'host' && (
                        <div className="mt-3 pt-2 border-t border-bdr flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditForm(
                                expense
                              )
                            }
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 bg-cream text-muted text-xs"
                          >
                            <Pencil size={13} />
                            編集
                          </button>

                          <button
                            onClick={() =>
                              deleteExpense(
                                expense
                              )
                            }
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 bg-red-50 text-coral text-xs"
                          >
                            <Trash2 size={13} />
                            削除
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )
            })}

          </div>
        )}

        {/* Settlement */}

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">

          <button
            onClick={() =>
              setShowSettlement(
                !showSettlement
              )
            }
            className="w-full p-4 flex items-center justify-between"
          >

            <div className="flex items-center gap-2">

              <span className="text-lg">
                ⚖️
              </span>

              <span className="text-navy font-semibold text-sm">
                精算方法
              </span>

            </div>

            {showSettlement ? (
              <ChevronUp
                size={16}
                className="text-muted"
              />
            ) : (
              <ChevronDown
                size={16}
                className="text-muted"
              />
            )}

          </button>

          {showSettlement && (
            <div className="px-4 pb-4 space-y-2 border-t border-bdr pt-3">

              {settlements.length === 0 ? (
                <p className="text-muted text-sm text-center py-2">
                  精算不要です 🎉
                </p>
              ) : (
                settlements.map(
                  (settlement, index) => (
                    <div
                      key={`${settlement.from}-${settlement.to}-${index}`}
                      className="flex items-center gap-2 bg-cream rounded-xl p-3"
                    >

                      <span className="text-navy text-sm font-medium">
                        {settlement.from}
                      </span>

                      <div className="flex-1 flex items-center gap-1">

                        <div className="flex-1 h-px bg-bdr" />

                        <span
                          className="text-coral text-xs font-bold"
                          style={{
                            fontFamily:
                              'DM Mono, monospace',
                          }}
                        >
                          ¥
                          {settlement.amount.toLocaleString()}
                        </span>

                        <div className="flex-1 h-px bg-bdr" />

                      </div>

                      <span className="text-navy text-sm font-medium">
                        {settlement.to}
                      </span>

                    </div>
                  )
                )
              )}

            </div>
          )}

        </div>

        {/* Add button */}

        {mode === 'host' && (
          <button
            onClick={openAddForm}
            className="w-full bg-coral text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold shadow-sm"
          >
            <Plus size={18} />
            支払いを追加
          </button>
        )}

      </div>

      {/* Add / Edit modal */}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">

          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={closeForm}
          />

          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">

              <h3 className="text-navy font-bold text-base">
                {editingExpense
                  ? '支払いを編集'
                  : '支払いを追加'}
              </h3>

              <button onClick={closeForm}>
                <X
                  size={20}
                  className="text-muted"
                />
              </button>

            </div>

            <div className="space-y-4">

              {/* タイトル */}

              <div>

                <label className="text-muted text-xs font-medium">
                  タイトル
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="夕食代"
                />

              </div>

              {/* 金額 */}

              <div>

                <label className="text-muted text-xs font-medium">
                  金額
                </label>

                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  type="number"
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                  placeholder="5000"
                />

              </div>

              {/* 立替えた人 */}

              <div>

                <label className="text-muted text-xs font-medium">
                  立替えた人
                </label>

                <select
                  value={paidBy}
                  onChange={(e) =>
                    setPaidBy(e.target.value)
                  }
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr"
                >

                  {memberNames.map(
                    (name, index) => (
                      <option
                        key={`${name}-${index}`}
                        value={name}
                      >
                        {name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* カテゴリー */}

              <div>

                <label className="text-muted text-xs font-medium">
                  カテゴリー
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr"
                >

                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}

                </select>

              </div>

              {/* 割り勘する人 */}

              <div>

                <label className="text-muted text-xs font-medium">
                  割り勘する人
                </label>

                <div className="mt-2 grid grid-cols-2 gap-2">

                  {memberNames.map(
                    (name, index) => {

                      const selected =
                        splitWith.includes(
                          name
                        )

                      const member =
                        trip.members.find(
                          (m) =>
                            m.nickname ===
                            name
                        )

                      return (
                        <button
                          key={`${name}-${index}`}
                          type="button"
                          onClick={() =>
                            toggleSplitMember(
                              name
                            )
                          }
                          className={`rounded-xl px-3 py-2.5 text-sm text-left border transition-all ${selected
                              ? 'bg-coral text-white border-coral'
                              : 'bg-cream text-muted border-bdr'
                            }`}
                        >
                          {member?.emoji}{' '}
                          {name}
                        </button>
                      )
                    }
                  )}

                </div>

                <p className="text-muted text-[10px] mt-2">
                  {splitWith.length}人で割り勘
                </p>

              </div>

              {/* 保存 */}

              <button
                onClick={saveExpense}
                disabled={saving}
                className="w-full bg-coral text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50"
              >
                {saving
                  ? '保存中…'
                  : editingExpense
                    ? '変更を保存'
                    : '追加する'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}