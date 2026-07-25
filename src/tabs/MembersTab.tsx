import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import type { Trip, AppMode } from '../types'

interface MembersTabProps {
  trip: Trip
  mode: AppMode
}

const ROLES = ['幹事', '予約担当', '運転担当', '写真担当', 'ナビ担当', '財務担当', 'メンバー']

export default function MembersTab({ trip, mode }: MembersTabProps) {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <div className="bg-cream min-h-screen pb-24">
      {/* Header */}
      <div className="bg-navy px-6 pt-14 pb-6">
        <h2
          className="text-white mb-1"
          style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 700 }}
        >
          メンバー
        </h2>
        <p className="text-white/50 text-xs">{trip.members.length}人で行く旅</p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {trip.members.map((member, idx) => (
          <div key={member.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: member.color + '30', border: `2px solid ${member.color}50` }}
              >
                {member.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-navy font-bold text-base">{member.nickname}</p>
                  <p className="text-muted text-xs">{member.name}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs rounded-full px-2.5 py-0.5 font-medium text-white"
                    style={{ background: member.color }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Number */}
              <div
                className="text-bdr text-3xl font-bold flex-shrink-0"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                0{idx + 1}
              </div>
            </div>

            {/* Contact actions */}
            {mode === 'host' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-bdr">
                <button className="flex-1 text-center text-xs text-muted py-2 rounded-xl bg-cream active:bg-bdr transition-colors">
                  メッセージ
                </button>
                <button className="flex-1 text-center text-xs text-muted py-2 rounded-xl bg-cream active:bg-bdr transition-colors">
                  役割変更
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Invite */}
        {mode === 'host' && (
          <button
            onClick={() => setShowInvite(true)}
            className="w-full rounded-2xl border-2 border-dashed border-bdr p-5 flex items-center gap-3 active:bg-white transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <UserPlus size={18} className="text-coral" />
            </div>
            <div className="text-left">
              <div className="text-navy font-semibold text-sm">メンバーを招待</div>
              <div className="text-muted text-xs mt-0.5">リンクで共有できます</div>
            </div>
          </button>
        )}

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-navy text-sm font-semibold mb-4">役割分担</p>
          <div className="space-y-2">
            {trip.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: m.color + '30' }}>
                  {m.emoji}
                </div>
                <span className="text-navy text-sm flex-1">{m.nickname}</span>
                <span className="text-muted text-xs">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[430px] mx-auto left-1/2 -translate-x-1/2 w-full">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-navy font-bold text-base">招待リンク</h3>
              <button onClick={() => setShowInvite(false)}>
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="bg-cream rounded-xl p-4 flex items-center gap-3 mb-4">
              <span className="text-muted text-xs flex-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                tripcanvas.app/join/okinawa2026
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-navy text-white rounded-xl py-3 text-sm font-medium active:opacity-80">
                コピーする
              </button>
              <button className="bg-coral text-white rounded-xl py-3 text-sm font-medium active:bg-coral-dark">
                LINEで送る
              </button>
            </div>
            <p className="text-muted text-xs text-center mt-4">
              ゲストは閲覧のみ・ホストは編集可能
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
