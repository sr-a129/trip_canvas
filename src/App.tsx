import { useState } from 'react'
import { trips } from './data/mockData'
import LoginScreen from './screens/LoginScreen'
import TripListScreen from './screens/TripListScreen'
import ShioriView from './screens/ShioriView'
import BottomNav from './components/BottomNav'
import HomeTab from './tabs/HomeTab'
import ScheduleTab from './tabs/ScheduleTab'
import ExpenseTab from './tabs/ExpenseTab'
import PackingTab from './tabs/PackingTab'
import MembersTab from './tabs/MembersTab'
import MoreTab from './tabs/MoreTab'
import type { AppMode, AppScreen, TabId, Trip } from './types'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const directTripId = params.get('trip')

  const directTrip =
    trips.find((trip) => trip.id === directTripId) ?? null

  const isDirectTrip = directTrip !== null

  const [mode, setMode] = useState<AppMode>(
    isDirectTrip ? 'host' : 'login'
  )

  const [screen, setScreen] = useState<AppScreen>(
    isDirectTrip ? 'trip' : 'tripList'
  )

  const [activeTrip, setActiveTrip] = useState<Trip | null>(
    directTrip
  )

  const [activeTab, setActiveTab] =
    useState<TabId>('home')

  // 旅行データを更新する共通関数
  const updateTrip = (updatedTrip: Trip) => {
    setActiveTrip(updatedTrip)

    // trips配列側も更新しておく
    const index = trips.findIndex(
      (trip) => trip.id === updatedTrip.id
    )

    if (index !== -1) {
      trips[index] = updatedTrip
    }
  }

  const handleSelectMode = (m: AppMode) => {
    setMode(m)
    setScreen('tripList')
  }

  const handleSelectTrip = (trip: Trip) => {
    setActiveTrip(trip)
    setScreen('trip')
    setActiveTab('home')
  }

  const handleBackToList = () => {
    if (isDirectTrip) {
      setScreen('trip')
      return
    }

    setScreen('tripList')
    setActiveTrip(null)
  }

  // ── Login ─────────────────────────────────────────────
  if (mode === 'login') {
    return <LoginScreen onSelect={handleSelectMode} />
  }

  // ── Trip list ──────────────────────────────────────────
  if (screen === 'tripList') {
    return (
      <TripListScreen
        trips={trips}
        mode={mode}
        onSelectTrip={handleSelectTrip}
        onBack={() => setMode('login')}
      />
    )
  }

  if (!activeTrip) return null

  // ── Guest ──────────────────────────────────────────────
  if (mode === 'guest') {
    return (
      <ShioriView
        trip={activeTrip}
        onBack={handleBackToList}
      />
    )
  }

  // ── Host ───────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            trip={activeTrip}
            mode={mode}
            onTabChange={setActiveTab}
            onUpdateTrip={updateTrip}
          />
        )

      case 'schedule':
        return (
          <ScheduleTab
            trip={activeTrip}
            mode={mode}
          />
        )

      case 'expense':
        return (
          <ExpenseTab
            trip={activeTrip}
            mode={mode}
          />
        )

      case 'packing':
        return (
          <PackingTab
            trip={activeTrip}
            mode={mode}
            onUpdateTrip={updateTrip}
          />
        )

      case 'members':
        return (
          <MembersTab
            trip={activeTrip}
            mode={mode}
          />
        )

      case 'more':
        return (
          <MoreTab
            trip={activeTrip}
            mode={mode}
            onUpdateTrip={updateTrip}
          />
        )
    }
  }

  return (
    <div className="relative max-w-[430px] mx-auto min-h-screen bg-cream">
      <div className="overflow-y-auto pb-20">
        {renderTab()}
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}