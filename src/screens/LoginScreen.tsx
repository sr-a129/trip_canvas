import type { AppMode } from '../types'

interface LoginScreenProps {
  onSelect: (mode: AppMode) => void
}

export default function LoginScreen({ onSelect }: LoginScreenProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col max-w-[430px] mx-auto">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1729290098101-fef6e9be922d?w=800&h=1200&fit=crop&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-navy/85" />

      <div className="relative flex flex-col min-h-screen px-8 w-full">
        <div className="pt-24 flex-1 flex flex-col justify-between pb-14">
          <div>
            <p
              className="text-white/50 text-[10px] tracking-[0.35em] uppercase mb-4"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Your Journey Companion
            </p>
            <h1
              className="text-white leading-none mb-3"
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '68px',
                fontWeight: 900,
                letterSpacing: '-2px',
              }}
            >
              Trip
              <br />
              Canvas
            </h1>
            <p className="text-white/60 text-sm leading-relaxed font-light">
              旅のすべてを、一冊のしおりに。
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-white/40 text-[10px] text-center tracking-[0.25em] uppercase mb-6">
              モードを選択
            </p>

            <button
              onClick={() => onSelect('host')}
              className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.97]"
              style={{ background: '#E8462A' }}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">✏️</div>
                <div>
                  <div className="text-white font-bold text-base">ホスト / 編集モード</div>
                  <div className="text-white/70 text-sm mt-0.5">旅行を計画・編集できます</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelect('guest')}
              className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.97] border border-white/25"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">📖</div>
                <div>
                  <div className="text-white font-bold text-base">ゲスト / しおりを見る</div>
                  <div className="text-white/60 text-sm mt-0.5">美しいしおりで旅を楽しむ</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
