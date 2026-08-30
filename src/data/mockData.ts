import type { Trip } from '../types'

export const trips: Trip[] = [
  {
    id: 'okinawa-2026',
    name: 'OKINAWA 2026',
    destination: '沖縄',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    coverImage: 'https://images.unsplash.com/photo-1729290098101-fef6e9be922d?w=800&h=600&fit=crop&auto=format',
    emoji: '🌺',
    members: [
      { id: '', name: '', nickname: 'さら', role: '', color: '#FF6B9D', emoji: '🌸' },
      { id: '', name: '', nickname: 'まなか', role: '', color: '#FFB347', emoji: '🌻' },
      { id: '', name: '', nickname: 'じょうじ', role: '', color: '#5BA8F5', emoji: '🌊' },
      { id: '', name: '', nickname: 'さとそう', role: '', color: '#6BCB77', emoji: '🌿' },
      { id: '', name: '', nickname: 'たくみ', role: '', color: '#e24444', emoji: '🎈' },
      { id: '', name: '', nickname: 'けいた', role: '', color: '#a36bcb', emoji: '🍇' },
    ],
    schedule: [
      {
        date: '2026-09-01',
        label: 'Day 1',
        items: [
          { id: 's1', time: '06:00', title: '羽田空港 集合', location: '第2ターミナル カウンターF前', memo: '遅刻厳禁！', assignee: '全員', done: false, emoji: '✈️' },
          { id: 's2', time: '08:30', title: 'ANA NH987 出発', location: '羽田→那覇', memo: '搭乗ゲートB12', assignee: '全員', done: false, emoji: '🛫' },
          { id: 's3', time: '11:30', title: '那覇空港 到着', location: '那覇空港', memo: 'レンタカー受付へ', assignee: '全員', done: false, emoji: '🛬' },
          { id: 's4', time: '13:00', title: '琉球ランチ', location: '百年古家 大家', memo: 'ゴーヤチャンプル、ソーキそば', assignee: 'ゆい', done: false, emoji: '🍜' },
          { id: 's5', time: '15:00', title: '万座毛', location: '恩納村', memo: '駐車場から徒歩5分', assignee: '全員', done: false, emoji: '🌊' },
          { id: 's6', time: '17:00', title: 'ホテル チェックイン', location: 'ザ・ブセナテラス', memo: 'ルーム #1501, #1502', assignee: 'ひな', done: false, emoji: '🏨' },
          { id: 's7', time: '19:00', title: '夕食（コーラルテラス）', location: 'ホテル内', memo: '予約済み・4名', assignee: 'ひな', done: false, emoji: '🍽️' },
        ]
      },
      {
        date: '2026-09-02',
        label: 'Day 2',
        items: [
          { id: 's8', time: '08:00', title: '朝食ビュッフェ', location: 'ホテル', memo: '8:00〜10:00', assignee: '全員', done: false, emoji: '🍳' },
          { id: 's9', time: '10:00', title: 'シュノーケリング体験', location: 'ブセナ海中公園', memo: '機材レンタル込み・日焼け止め必須', assignee: '全員', done: false, emoji: '🤿' },
          { id: 's10', time: '13:00', title: 'タコライスランチ', location: 'やちむんカフェ', memo: '有名店・要チェック', assignee: 'さき', done: false, emoji: '☕' },
          { id: 's11', time: '15:00', title: '美ら海水族館', location: '海洋博公園', memo: 'ジンベエザメショー 15:30', assignee: '全員', done: false, emoji: '🐋' },
          { id: 's12', time: '17:30', title: '古宇利島ドライブ', location: '古宇利大橋', memo: '夕日スポット！写真必須', assignee: 'りょう', done: false, emoji: '🌅' },
          { id: 's13', time: '20:00', title: '国際通り 夜ご飯', location: '国際通り', memo: '各自自由行動', assignee: '全員', done: false, emoji: '🌃' },
        ]
      },
      {
        date: '2026-09-03',
        label: 'Day 3',
        items: [
          { id: 's14', time: '09:00', title: 'パラセーリング 🗳 投票中', location: 'ルネッサンスビーチ', memo: '投票結果次第で決定', assignee: 'ゆい', done: false, emoji: '🪂' },
          { id: 's15', time: '12:00', title: 'BBQランチ', location: 'ビーチBBQエリア', memo: '食材はひなが手配', assignee: 'ひな', done: false, emoji: '🍖' },
          { id: 's16', time: '14:00', title: '首里城', location: '首里城公園', memo: '世界遺産・見学約1.5h', assignee: '全員', done: false, emoji: '🏯' },
          { id: 's17', time: '16:30', title: 'お土産ショッピング', location: 'DFS T ギャラリア', memo: '紅芋タルト、ちんすこう', assignee: '全員', done: false, emoji: '🛍️' },
          { id: 's18', time: '19:00', title: '最後の晩餐', location: '琉球料理 四つ竹', memo: '琉球舞踊ショーあり', assignee: 'ゆい', done: false, emoji: '🎭' },
        ]
      },
      {
        date: '2026-09-04',
        label: 'Day 4',
        items: [
          { id: 's19', time: '07:00', title: 'チェックアウト', location: 'ザ・ブセナテラス', memo: '忘れ物チェック！', assignee: '全員', done: false, emoji: '🏨' },
          { id: 's20', time: '08:00', title: '最後の朝の海', location: 'ホテルビーチ', memo: '出発前に少しだけ', assignee: '全員', done: false, emoji: '🌊' },
          { id: 's21', time: '10:30', title: 'レンタカー返却', location: '那覇市内', memo: '給油してから返却', assignee: 'りょう', done: false, emoji: '🚗' },
          { id: 's22', time: '13:45', title: 'ANA NH994 帰宅', location: '那覇→羽田', memo: '搭乗ゲートA8', assignee: '全員', done: false, emoji: '🛫' },
          { id: 's23', time: '15:45', title: '羽田空港 到着', location: '羽田空港', memo: 'おつかれさまでした！', assignee: '全員', done: false, emoji: '🎉' },
        ]
      }
    ],
    expenses: [
      { id: 'e1', title: '航空券（往復）', amount: 68000, paidBy: 'ゆい', category: '交通', emoji: '✈️', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e2', title: 'レンタカー（3日間）', amount: 35000, paidBy: 'りょう', category: '交通', emoji: '🚗', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e3', title: 'ホテル（3泊）', amount: 120000, paidBy: 'ひな', category: '宿泊', emoji: '🏨', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e4', title: '美ら海水族館', amount: 8800, paidBy: 'さき', category: '観光', emoji: '🐋', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e5', title: 'シュノーケリング体験', amount: 16000, paidBy: 'ゆい', category: '体験', emoji: '🤿', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e6', title: 'Day1 夕食', amount: 18400, paidBy: 'ひな', category: '食事', emoji: '🍽️', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e7', title: 'BBQ食材', amount: 6800, paidBy: 'ひな', category: '食事', emoji: '🍖', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
      { id: 'e8', title: 'お土産代（共用）', amount: 8000, paidBy: 'さき', category: 'ショッピング', emoji: '🛍️', splitWith: ['ゆい', 'ひな', 'りょう', 'さき'] },
    ],
    memos: [
      {
        id: 'm1', title: '集合場所・時間', pinned: true, type: 'note',
        content: '9月1日（火）朝6:00\n羽田空港 第2ターミナル\nチェックインカウンターF前\n\n⚠️ 遅刻厳禁！飛行機に乗り遅れます',
        items: []
      },
      {
        id: 'm2', title: '持ち物チェックリスト', pinned: true, type: 'checklist', content: '',
        items: [
          { text: '運転免許証', done: false },
          { text: '水着・ラッシュガード', done: false },
          { text: '日焼け止め（高SPF）', done: false },
          { text: 'サングラス', done: false },
          { text: '常備薬', done: false },
          { text: 'モバイルバッテリー', done: false },
          { text: 'カメラ・GoPro', done: false },
          { text: 'ビーチサンダル', done: true },
        ]
      },
      {
        id: 'm3', title: '緊急連絡先', pinned: false, type: 'note',
        content: 'ホテル: 0980-51-1333\nレンタカー: 098-858-0355\nANA: 0570-029-333\n救急: 119\n警察: 110',
        items: []
      },
      {
        id: 'm4', title: '注意事項', pinned: false, type: 'note',
        content: '・珊瑚礁保護のため日焼け止めは珊瑚礁セーフを使うこと\n・レンタカーの返却は給油してから\n・ホテルのタオルはビーチ持ち出し禁止\n・エアコンは28度設定で節電',
        items: []
      },
    ],
    packing: [
      { id: 'p1', name: '日焼け止め（SPF50+）', personal: false, done: false },
      { id: 'p2', name: '水着', personal: true, done: false },
      { id: 'p3', name: 'ラッシュガード', personal: true, done: false },
      { id: 'p4', name: 'サングラス', personal: true, done: false },
      { id: 'p5', name: 'ビーチサンダル', personal: true, done: true },
      { id: 'p6', name: 'モバイルバッテリー', personal: true, done: false },
      { id: 'p7', name: 'カメラ・GoPro', personal: true, assignee: 'さき', done: false },
      { id: 'p8', name: '常備薬', personal: true, done: false },
      { id: 'p9', name: 'ウェットティッシュ', personal: false, done: false },
      { id: 'p10', name: 'エコバッグ', personal: false, done: true },
    ],
    flights: [
      {
        type: 'departure',
        airline: 'ANA',
        flightNumber: 'NH987',
        from: '羽田',
        to: '那覇',
        departTime: '15:55',
        arriveTime: '18:25',
        terminal: '第2ターミナル',
        gate: 'B12',
        seats: ['15A', '15B', '16A', '16B'],
        date: '2026-09-01'
      },
      {
        type: 'arrival',
        airline: 'ANA',
        flightNumber: 'NH994',
        from: '那覇',
        to: '羽田',
        departTime: '10:50',
        arriveTime: '13:25',
        terminal: '国内線ターミナル',
        gate: 'A8',
        seats: ['22C', '22D', '23C', '23D'],
        date: '2026-09-04'
      }
    ],
    hotel: {
      name: 'ザ・ブセナテラス',
      address: '〒905-0026 沖縄県名護市喜瀬1808',
      checkIn: '2026-08-05 15:00',
      checkOut: '2026-08-08 11:00',
      wifi: 'BusenaGuest / Pass: ocean2026',
      keyCode: '#1501, #1502',
      parking: true,
      notes: '・ビーチタオルは別料金\n・プールは7:00〜20:00\n・朝食は8:00〜10:00（要予約）',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=400&fit=crop&auto=format',
    }
  }
]
