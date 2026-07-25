import { useState } from 'react'
import { trips } from './data/mockData'
import LoginScreen from './screens/LoginScreen'
import TripListScreen from './screens/TripListScreen'
import ShioriView from './screens/ShioriView'
import BottomNav from './components/BottomNav'
import HomeTab from './tabs/HomeTab'
import ScheduleTab from './tabs/ScheduleTab'
import ExpenseTab from './tabs/ExpenseTab'
import MembersTab from './tabs/MembersTab'
import MoreTab from './tabs/MoreTab'
import type { AppMode, AppScreen, TabId, Trip } from './types'

export default function App() {
  const [mode, setMode] = useState<AppMode>('login')
  const [screen, setScreen] = useState<AppScreen>('tripList')
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('home')

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
    setScreen('tripList')
    setActiveTrip(null)
  }

  // ── Login ──────────────────────────────────────────────────────────
  if (mode === 'login') {
    return <LoginScreen onSelect={handleSelectMode} />
  }

  // ── Trip list ──────────────────────────────────────────────────────
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

  // ── Guest: cinematic shiori view ───────────────────────────────────
  if (mode === 'guest') {
    return <ShioriView trip={activeTrip} onBack={handleBackToList} />
  }

  // ── Host: tabbed interface ─────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab trip={activeTrip} onTabChange={setActiveTab} />
      case 'schedule':
        return <ScheduleTab trip={activeTrip} mode={mode} />
      case 'expense':
        return <ExpenseTab trip={activeTrip} mode={mode} />
      case 'members':
        return <MembersTab trip={activeTrip} mode={mode} />
      case 'more':
        return <MoreTab trip={activeTrip} mode={mode} />
    }
  }

  return (
    <div className="relative max-w-[430px] mx-auto min-h-screen bg-cream">
      <div className="overflow-y-auto pb-20">{renderTab()}</div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
