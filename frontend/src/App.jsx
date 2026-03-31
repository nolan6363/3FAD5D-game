import { useState } from 'react'
import HomePage from './pages/HomePage'
import CapturePage from './pages/CapturePage'
import PreviewPage from './pages/PreviewPage'
import ResultsPage from './pages/ResultsPage'

// Phases : home → capture_1 → preview_1 → capture_2 → preview_2 → results
const PHASES = {
  HOME:      'home',
  CAPTURE_1: 'capture_1',
  PREVIEW_1: 'preview_1',
  CAPTURE_2: 'capture_2',
  PREVIEW_2: 'preview_2',
  RESULTS:   'results',
}

export default function App() {
  const [phase, setPhase] = useState(PHASES.HOME)
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)

  function handleStart() {
    setPlayer1(null)
    setPlayer2(null)
    setPhase(PHASES.CAPTURE_1)
  }

  function handleCapture1(result) {
    setPlayer1(result)
    setPhase(PHASES.PREVIEW_1)
  }

  function handleCapture2(result) {
    setPlayer2(result)
    setPhase(PHASES.PREVIEW_2)
  }

  function handleReplay() {
    setPhase(PHASES.HOME)
  }

  const headerSubtitle = {
    [PHASES.HOME]:      null,
    [PHASES.CAPTURE_1]: 'Candidat 1 — Photo',
    [PHASES.PREVIEW_1]: 'Candidat 1 — Score',
    [PHASES.CAPTURE_2]: 'Candidat 2 — Photo',
    [PHASES.PREVIEW_2]: 'Candidat 2 — Score',
    [PHASES.RESULTS]:   'Résultats',
  }[phase]

  return (
    <div className="app">
      <Header subtitle={headerSubtitle} />

      <div className="page">
        {phase === PHASES.HOME && (
          <HomePage onStart={handleStart} />
        )}

        {phase === PHASES.CAPTURE_1 && (
          <CapturePage playerNum={1} onCapture={handleCapture1} />
        )}

        {phase === PHASES.PREVIEW_1 && player1 && (
          <PreviewPage
            playerNum={1}
            result={player1}
            onNext={() => setPhase(PHASES.CAPTURE_2)}
            nextLabel="Au tour du Candidat 2 →"
          />
        )}

        {phase === PHASES.CAPTURE_2 && (
          <CapturePage playerNum={2} onCapture={handleCapture2} />
        )}

        {phase === PHASES.PREVIEW_2 && player2 && (
          <PreviewPage
            playerNum={2}
            result={player2}
            onNext={() => setPhase(PHASES.RESULTS)}
            nextLabel="Voir les résultats →"
          />
        )}

        {phase === PHASES.RESULTS && player1 && player2 && (
          <ResultsPage
            player1={player1}
            player2={player2}
            onReplay={handleReplay}
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
