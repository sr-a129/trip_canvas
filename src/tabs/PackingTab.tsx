import { useEffect, useState } from 'react'
import {
    Check,
    Plus,
    Pencil,
    Trash2,
    X,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import type { AppMode, Trip } from '../types'

interface PackingItem {
    id: string
    trip_id: string
    name: string
    category: string | null
    emoji: string | null
    assignee: string | null
    done: boolean | null
    location: string | null
}

interface PackingTemplate {
    id: string
    name: string
    description: string | null
}

interface PackingTabProps {
    trip: Trip
    mode: AppMode
    onUpdateTrip: (trip: Trip) => void
}

/*
 * 持ち物カテゴリ
 */
const PACKING_CATEGORIES = [
    '衣類',
    '電子機器',
    '洗面・衛生',
    '貴重品',
    '旅行用品',
    '食品・飲料',
    'その他',
]

export default function PackingTab({
    trip,
    mode,
}: PackingTabProps) {
    const [items, setItems] = useState<PackingItem[]>([])
    const [templates, setTemplates] = useState<PackingTemplate[]>([])

    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)

    const [editing, setEditing] =
        useState<PackingItem | null>(null)

    const [form, setForm] = useState({
        name: '',
        category: 'その他',
        emoji: '🎒',
        assignee: '',
        location: '',
        done: false,
    })

    useEffect(() => {
        loadPacking()
    }, [trip.id])

    const loadPacking = async () => {
        setLoading(true)

        const [
            { data: itemData, error: itemError },
            { data: templateData, error: templateError },
        ] = await Promise.all([
            supabase
                .from('packing_items')
                .select('*')
                .eq('trip_id', trip.id)
                .order('category', { ascending: true })
                .order('name', { ascending: true }),

            supabase
                .from('packing_templates')
                .select('*')
                .order('name', { ascending: true }),
        ])

        if (itemError) {
            console.error(
                'packing_items取得エラー:',
                itemError
            )
            alert(
                `持ち物の読み込みに失敗しました\n${itemError.message}`
            )
        }

        if (templateError) {
            console.error(
                'packing_templates取得エラー:',
                templateError
            )
        }

        setItems(itemData ?? [])
        setTemplates(templateData ?? [])
        setLoading(false)
    }

    /*
     * チェック切り替え
     */
    const toggleItem = async (item: PackingItem) => {
        if (mode !== 'host') return

        const nextDone = !item.done

        setItems((prev) =>
            prev.map((i) =>
                i.id === item.id
                    ? { ...i, done: nextDone }
                    : i
            )
        )

        const { error } = await supabase
            .from('packing_items')
            .update({ done: nextDone })
            .eq('id', item.id)

        if (error) {
            console.error(error)

            setItems((prev) =>
                prev.map((i) =>
                    i.id === item.id
                        ? { ...i, done: item.done }
                        : i
                )
            )

            alert(
                `更新に失敗しました\n${error.message}`
            )
        }
    }

    /*
     * 新規追加フォーム
     */
    const openAdd = () => {
        setEditing(null)

        setForm({
            name: '',
            category: 'その他',
            emoji: '🎒',
            assignee: '',
            location: '',
            done: false,
        })

        setShowForm(true)
    }

    /*
     * 編集フォーム
     */
    const openEdit = (item: PackingItem) => {
        setEditing(item)

        setForm({
            name: item.name,
            category: item.category ?? 'その他',
            emoji: item.emoji ?? '🎒',
            assignee: item.assignee ?? '',
            location: item.location ?? '',
            done: !!item.done,
        })

        setShowForm(true)
    }

    /*
     * IDを作成
     *
     * insert後にselect().single()を使わず、
     * こちらでIDを作ってそのまま画面にも追加する。
     */
    const createId = () => {
        if (
            typeof crypto !== 'undefined' &&
            typeof crypto.randomUUID === 'function'
        ) {
            return crypto.randomUUID()
        }

        return `packing-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`
    }

    /*
     * 保存
     */
    const saveItem = async () => {
        if (!form.name.trim()) {
            alert('持ち物名を入力してください')
            return
        }

        /*
         * 編集
         */
        if (editing) {
            const updatedItem = {
                name: form.name.trim(),
                category: form.category || 'その他',
                emoji: form.emoji.trim() || '🎒',
                assignee: form.assignee.trim() || null,
                location: form.location.trim() || null,
                done: form.done,
            }

            const { error } = await supabase
                .from('packing_items')
                .update(updatedItem)
                .eq('id', editing.id)

            if (error) {
                console.error(
                    '持ち物更新エラー:',
                    error
                )

                alert(
                    `持ち物の更新に失敗しました\n${error.message}`
                )

                return
            }

            setItems((prev) =>
                prev.map((item) =>
                    item.id === editing.id
                        ? {
                            ...item,
                            ...updatedItem,
                        }
                        : item
                )
            )

            setShowForm(false)
            setEditing(null)
            return
        }

        /*
         * 新規追加
         *
         * 以前の
         * insert().select().single()
         * だと、SupabaseのSELECT権限によっては
         * 保存自体は成功しているのにエラーになることがある。
         *
         * 今回はIDをこちらで作ってinsertだけする。
         */
        const newId = createId()

        const newItemData = {
            id: newId,
            trip_id: trip.id,
            name: form.name.trim(),
            category: form.category || 'その他',
            emoji: form.emoji.trim() || '🎒',
            assignee: form.assignee.trim() || null,
            location: form.location.trim() || null,
            done: form.done,
        }

        const { error } = await supabase
            .from('packing_items')
            .insert(newItemData)

        if (error) {
            console.error(
                '持ち物追加エラー:',
                error
            )

            alert(
                `持ち物の追加に失敗しました\n${error.message}`
            )

            return
        }

        /*
         * Supabaseへの保存成功後、
         * 画面にも即座に追加
         */
        const newItem: PackingItem = {
            id: newId,
            trip_id: trip.id,
            name: newItemData.name,
            category: newItemData.category,
            emoji: newItemData.emoji,
            assignee: newItemData.assignee,
            location: newItemData.location,
            done: newItemData.done,
        }

        setItems((prev) =>
            [...prev, newItem].sort((a, b) => {
                const categoryA =
                    a.category ?? 'その他'
                const categoryB =
                    b.category ?? 'その他'

                const categoryOrderA =
                    PACKING_CATEGORIES.indexOf(
                        categoryA
                    )

                const categoryOrderB =
                    PACKING_CATEGORIES.indexOf(
                        categoryB
                    )

                if (
                    categoryOrderA !==
                    categoryOrderB
                ) {
                    return (
                        categoryOrderA -
                        categoryOrderB
                    )
                }

                return a.name.localeCompare(
                    b.name,
                    'ja'
                )
            })
        )

        setShowForm(false)
    }

    /*
     * 削除
     */
    const removeItem = async (
        item: PackingItem
    ) => {
        if (
            !window.confirm(
                `「${item.name}」を削除しますか？`
            )
        ) {
            return
        }

        const { error } = await supabase
            .from('packing_items')
            .delete()
            .eq('id', item.id)

        if (error) {
            console.error(error)

            alert(
                `削除に失敗しました\n${error.message}`
            )

            return
        }

        setItems((prev) =>
            prev.filter(
                (i) => i.id !== item.id
            )
        )
    }

    /*
     * テンプレートから追加
     */
    const addTemplate = async (
        template: PackingTemplate
    ) => {
        const newId = createId()

        const newItemData = {
            id: newId,
            trip_id: trip.id,
            name: template.name,
            category: 'その他',
            emoji: '🎒',
            assignee: null,
            location: null,
            done: false,
        }

        const { error } = await supabase
            .from('packing_items')
            .insert(newItemData)

        if (error) {
            console.error(error)

            alert(
                `テンプレートから追加できませんでした\n${error.message}`
            )

            return
        }

        const newItem: PackingItem = {
            id: newId,
            trip_id: trip.id,
            name: template.name,
            category: 'その他',
            emoji: '🎒',
            assignee: null,
            location: null,
            done: false,
        }

        setItems((prev) => [
            ...prev,
            newItem,
        ])

        setShowTemplates(false)
    }

    const doneCount = items.filter(
        (item) => item.done
    ).length

    /*
     * カテゴリを固定順で表示
     */
    const categories = PACKING_CATEGORIES.filter(
        (category) =>
            items.some(
                (item) =>
                    (item.category ??
                        'その他') === category
            )
    )

    if (loading) {
        return (
            <div className="bg-cream min-h-screen pb-24">
                <div className="bg-navy px-6 pt-14 pb-6">
                    <h2
                        className="text-white"
                        style={{
                            fontFamily:
                                'Playfair Display, Georgia, serif',
                            fontSize: '28px',
                            fontWeight: 700,
                        }}
                    >
                        持ち物
                    </h2>
                </div>

                <div className="text-center text-muted text-sm py-12">
                    読み込み中...
                </div>
            </div>
        )
    }

    return (
        <div className="bg-cream min-h-screen pb-24">

            {/* ヘッダー */}
            <div className="bg-navy px-6 pt-14 pb-6">
                <h2
                    className="text-white"
                    style={{
                        fontFamily:
                            'Playfair Display, Georgia, serif',
                        fontSize: '28px',
                        fontWeight: 700,
                    }}
                >
                    持ち物
                </h2>

                <p className="text-white/50 text-xs mt-1">
                    {doneCount}/{items.length} 準備完了
                </p>
            </div>

            <div className="px-5 py-4 space-y-4">

                {/* 進捗 */}
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
                                        ? (doneCount /
                                            items.length) *
                                        100
                                        : 0
                                    }%`,
                            }}
                        />
                    </div>
                </div>

                {/* 操作 */}
                {mode === 'host' && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={openAdd}
                            className="bg-coral text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-all"
                        >
                            <Plus size={16} />
                            持ち物を追加
                        </button>

                        <button
                            onClick={() =>
                                setShowTemplates(true)
                            }
                            className="bg-white text-navy rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold border border-bdr active:scale-[0.98] transition-all"
                        >
                            📋 テンプレート
                        </button>
                    </div>
                )}

                {/* カテゴリ別 */}
                {categories.map((category) => {
                    const categoryItems =
                        items.filter(
                            (item) =>
                                (item.category ??
                                    'その他') ===
                                category
                        )

                    return (
                        <div key={category}>
                            <p className="text-muted text-xs font-medium px-1 mb-2">
                                {category}
                            </p>

                            <div className="space-y-2">
                                {categoryItems.map(
                                    (item) => (
                                        <PackingRow
                                            key={item.id}
                                            item={item}
                                            mode={mode}
                                            onToggle={() =>
                                                toggleItem(
                                                    item
                                                )
                                            }
                                            onEdit={() =>
                                                openEdit(
                                                    item
                                                )
                                            }
                                            onDelete={() =>
                                                removeItem(
                                                    item
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* まだ持ち物がない */}
                {items.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="text-4xl mb-3">
                            🎒
                        </div>

                        <p className="text-navy font-semibold text-sm">
                            持ち物がまだありません
                        </p>

                        <p className="text-muted text-xs mt-1">
                            「持ち物を追加」から登録できます
                        </p>
                    </div>
                )}
            </div>

            {/* 編集・追加フォーム */}
            {showForm && (
                <PackingForm
                    form={form}
                    setForm={setForm}
                    editing={!!editing}
                    onSave={saveItem}
                    onClose={() =>
                        setShowForm(false)
                    }
                />
            )}

            {/* テンプレート */}
            {showTemplates && (
                <TemplateModal
                    templates={templates}
                    onSelect={addTemplate}
                    onClose={() =>
                        setShowTemplates(false)
                    }
                />
            )}
        </div>
    )
}

/* ─────────────────────────────
   Row
───────────────────────────── */

function PackingRow({
    item,
    mode,
    onToggle,
    onEdit,
    onDelete,
}: {
    item: PackingItem
    mode: AppMode
    onToggle: () => void
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <div className="w-full bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm">

            <button
                onClick={onToggle}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
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
                    className={`text-sm truncate ${item.done
                            ? 'line-through text-muted'
                            : 'text-navy'
                        }`}
                >
                    {item.emoji || '🎒'} {item.name}
                </span>

                {item.assignee && (
                    <span className="text-muted text-xs ml-auto flex-shrink-0">
                        {item.assignee}
                    </span>
                )}
            </button>

            {mode === 'host' && (
                <div className="flex gap-1 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        className="w-8 h-8 rounded-full bg-cream text-navy flex items-center justify-center"
                    >
                        <Pencil size={13} />
                    </button>

                    <button
                        onClick={onDelete}
                        className="w-8 h-8 rounded-full bg-cream text-coral flex items-center justify-center"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            )}
        </div>
    )
}

/* ─────────────────────────────
   Form
───────────────────────────── */

function PackingForm({
    form,
    setForm,
    editing,
    onSave,
    onClose,
}: {
    form: {
        name: string
        category: string
        emoji: string
        assignee: string
        location: string
        done: boolean
    }
    setForm: React.Dispatch<
        React.SetStateAction<{
            name: string
            category: string
            emoji: string
            assignee: string
            location: string
            done: boolean
        }>
    >
    editing: boolean
    onSave: () => void
    onClose: () => void
}) {
    const update = (
        key: keyof typeof form,
        value: string | boolean
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))
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
                        {editing
                            ? '持ち物を編集'
                            : '持ち物を追加'}
                    </h3>

                    <button onClick={onClose}>
                        <X
                            size={20}
                            className="text-muted"
                        />
                    </button>
                </div>

                <div className="space-y-3">

                    {/* 持ち物名 */}
                    <div>
                        <label className="text-muted text-xs font-medium">
                            持ち物名 *
                        </label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                update(
                                    'name',
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                            placeholder="例：水着"
                        />
                    </div>

                    {/* カテゴリ */}
                    <div>
                        <label className="text-muted text-xs font-medium">
                            カテゴリ
                        </label>

                        <select
                            value={form.category}
                            onChange={(e) =>
                                update(
                                    'category',
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral appearance-none"
                        >
                            {PACKING_CATEGORIES.map(
                                (category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* 絵文字 */}
                    <div>
                        <label className="text-muted text-xs font-medium">
                            アイコン
                        </label>

                        <input
                            value={form.emoji}
                            onChange={(e) =>
                                update(
                                    'emoji',
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                            placeholder="🎒"
                        />
                    </div>

                    {/* 担当者 */}
                    <div>
                        <label className="text-muted text-xs font-medium">
                            担当者
                        </label>

                        <input
                            value={form.assignee}
                            onChange={(e) =>
                                update(
                                    'assignee',
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                            placeholder="任意"
                        />
                    </div>

                    {/* 保管場所 */}
                    <div>
                        <label className="text-muted text-xs font-medium">
                            保管場所
                        </label>

                        <input
                            value={form.location}
                            onChange={(e) =>
                                update(
                                    'location',
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 bg-cream rounded-xl px-4 py-3 text-navy text-sm outline-none border border-bdr focus:border-coral"
                            placeholder="任意"
                        />
                    </div>

                    {/* 準備済み */}
                    <label className="flex items-center gap-3 bg-cream rounded-xl px-4 py-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.done}
                            onChange={(e) =>
                                update(
                                    'done',
                                    e.target.checked
                                )
                            }
                        />

                        <span className="text-navy text-sm">
                            準備済み
                        </span>
                    </label>

                    {/* 保存 */}
                    <button
                        onClick={onSave}
                        disabled={!form.name.trim()}
                        className={`w-full rounded-xl py-3 font-bold text-sm mt-2 transition-all ${form.name.trim()
                                ? 'bg-coral text-white active:scale-[0.98]'
                                : 'bg-bdr text-muted'
                            }`}
                    >
                        {editing
                            ? '保存する'
                            : '追加する'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────
   Templates
───────────────────────────── */

function TemplateModal({
    templates,
    onSelect,
    onClose,
}: {
    templates: PackingTemplate[]
    onSelect: (
        template: PackingTemplate
    ) => void
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">

            <div
                className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[80vh] overflow-y-auto">

                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-navy font-bold text-base">
                        テンプレートから追加
                    </h3>

                    <button onClick={onClose}>
                        <X
                            size={20}
                            className="text-muted"
                        />
                    </button>
                </div>

                <div className="space-y-2">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() =>
                                onSelect(template)
                            }
                            className="w-full bg-cream rounded-xl p-4 text-left active:scale-[0.98] transition-all"
                        >
                            <p className="text-navy text-sm font-semibold">
                                🎒 {template.name}
                            </p>

                            {template.description && (
                                <p className="text-muted text-xs mt-1">
                                    {
                                        template.description
                                    }
                                </p>
                            )}
                        </button>
                    ))}

                    {templates.length === 0 && (
                        <p className="text-muted text-sm text-center py-6">
                            テンプレートがありません
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}