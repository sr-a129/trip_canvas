import { Home, Calendar, DollarSign, Users, MoreHorizontal } from 'lucide-react'
import type { TabId } from '../types'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'ホーム', Icon: Home },
  { id: 'schedule', label: '予定', Icon: Calendar },
  { id: 'expense', label: '費用', Icon: DollarSign },
  { id: 'members', label: 'メンバー', Icon: Users },
  { id: 'more', label: 'もっと', Icon: MoreHorizontal },
]

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur border-t border-bdr z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all relative ${
                active ? 'text-coral' : 'text-muted'
              }`}
            >
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-coral rounded-full" />
              )}
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium tracking-tight">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
