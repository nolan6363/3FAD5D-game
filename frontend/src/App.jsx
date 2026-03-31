import { useState } from 'react'
import HomePage from './pages/HomePage'
import RegistrationPage from './pages/RegistrationPage'
import CapturePage from './pages/CapturePage'
import PreviewPage from './pages/PreviewPage'
import ResultsPage from './pages/ResultsPage'
import LeaderboardPage from './pages/LeaderboardPage'

const PHASES = {
  HOME:         'home',
  LEADERBOARD:  'leaderboard',
  REGISTRATION: 'registration',
  CAPTURE_1:    'capture_1',
  PREVIEW_1:    'preview_1',
  CAPTURE_2:    'capture_2',
  PREVIEW_2:    'preview_2',
  RESULTS:      'results',
}

export default function App() {
  const [phase, setPhase] = useState(PHASES.HOME)
  const [candidates, setCandidates] = useState(null) // { p1: {name, team}, p2: {name, team} }
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)

  function handleStart(reg) {
    setCandidates(reg)
    setPlayer1(null)
    setPlayer2(null)
    setPhase(PHASES.CAPTURE_1)
  }

  function handleCapture1(result) {
    setPlayer1({ ...result, ...candidates.p1 })
    setPhase(PHASES.PREVIEW_1)
  }

  function handleCapture2(result) {
    setPlayer2({ ...result, ...candidates.p2 })
    setPhase(PHASES.PREVIEW_2)
  }

  const headerSubtitle = {
    [PHASES.HOME]:         null,
    [PHASES.LEADERBOARD]:  'Classement',
    [PHASES.REGISTRATION]: 'Inscription',
    [PHASES.CAPTURE_1]:    candidates ? `${candidates.p1.name} — Photo` : 'Candidat 1 — Photo',
    [PHASES.PREVIEW_1]:    candidates ? `${candidates.p1.name} — Score` : 'Candidat 1 — Score',
    [PHASES.CAPTURE_2]:    candidates ? `${candidates.p2.name} — Photo` : 'Candidat 2 — Photo',
    [PHASES.PREVIEW_2]:    candidates ? `${candidates.p2.name} — Score` : 'Candidat 2 — Score',
    [PHASES.RESULTS]:      'Résultats',
  }[phase]

  return (
    <div className="app">
      <Header subtitle={headerSubtitle} />

      <div className="page">
        {phase === PHASES.HOME && (
          <HomePage
            onStart={() => setPhase(PHASES.REGISTRATION)}
            onLeaderboard={() => setPhase(PHASES.LEADERBOARD)}
          />
        )}

        {phase === PHASES.LEADERBOARD && (
          <LeaderboardPage onBack={() => setPhase(PHASES.HOME)} />
        )}

        {phase === PHASES.REGISTRATION && (
          <RegistrationPage onStart={handleStart} />
        )}

        {phase === PHASES.CAPTURE_1 && (
          <CapturePage
            playerNum={1}
            playerName={candidates?.p1.name}
            onCapture={handleCapture1}
          />
        )}

        {phase === PHASES.PREVIEW_1 && player1 && (
          <PreviewPage
            result={player1}
            onNext={() => setPhase(PHASES.CAPTURE_2)}
            nextLabel={`Au tour de ${candidates?.p2.name} →`}
          />
        )}

        {phase === PHASES.CAPTURE_2 && (
          <CapturePage
            playerNum={2}
            playerName={candidates?.p2.name}
            onCapture={handleCapture2}
          />
        )}

        {phase === PHASES.PREVIEW_2 && player2 && (
          <PreviewPage
            result={player2}
            onNext={() => setPhase(PHASES.RESULTS)}
            nextLabel="Voir les résultats →"
          />
        )}

        {phase === PHASES.RESULTS && player1 && player2 && (
          <ResultsPage
            player1={player1}
            player2={player2}
            onReplay={() => setPhase(PHASES.HOME)}
            onLeaderboard={() => setPhase(PHASES.LEADERBOARD)}
          />
        )}
      </div>
    </div>
  )
}

function Header({ subtitle }) {
  return (
    <header className="header">
      <div className="header-logo">
        <img src="/logo.png" alt="JEECE" className="header-logo-img" />
      </div>
      {subtitle && <div className="header-sub">{subtitle}</div>}
    </header>
  )
}
