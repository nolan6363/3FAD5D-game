import { useEffect, useRef } from 'react'
import { scoreColor } from '../utils/colorUtils'

export default function ResultsPage({ player1, player2, onReplay }) {
  const bar1Ref = useRef(null)
  const bar2Ref = useRef(null)

  useEffect(() => {
    if (bar1Ref.current) bar1Ref.current.style.width = '0%'
    if (bar2Ref.current) bar2Ref.current.style.width = '0%'
    const t = setTimeout(() => {
      if (bar1Ref.current) bar1Ref.current.style.width = player1.score + '%'
      if (bar2Ref.current) bar2Ref.current.style.width = player2.score + '%'
    }, 120)
    return () => clearTimeout(t)
  }, [player1.score, player2.score])

  const isTie = player1.score === player2.score
  const winner = isTie ? null : player1.score > player2.score ? 1 : 2
  const p1Wins = winner === 1
  const p2Wins = winner === 2

  return (
    <div className="results-page">
      {/* Bannière gagnant */}
      <div className={`winner-banner${isTie ? ' tie' : ''}`}>
        <div className="winner-label">{isTie ? 'Résultat' : 'Vainqueur'}</div>
        <div className="winner-name">
          {isTie ? 'Égalité !' : `Candidat ${winner}`}
        </div>
        <div className="winner-score">
          {isTie
            ? `${player1.score} pts chacun`
            : `${winner === 1 ? player1.score : player2.score} pts`}
        </div>
      </div>

      {/* Cartes des deux joueurs */}
      <div className="players-grid">
        <PlayerCard
          num={1}
          result={player1}
          isWinner={p1Wins}
          barRef={bar1Ref}
        />
        <PlayerCard
          num={2}
          result={player2}
          isWinner={p2Wins}
          barRef={bar2Ref}
        />
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn btn-primary" onClick={onReplay}>
          Nouveau match
        </button>
      </div>
    </div>
  )
}

function PlayerCard({ num, result, isWinner, barRef }) {
  const color = scoreColor(result.score)

  return (
    <div className={`player-result-card${isWinner ? ' winner-card' : ''}`}>
      {/* Photo avec overlay cercle */}
      <div className="player-result-photo" style={{ position: 'relative' }}>
        <img src={result.dataUrl} alt={`Verre candidat ${num}`} />
        <svg
          className="player-result-photo-overlay"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id={`res-cutout-${num}`}>
              <rect width="100%" height="100%" fill="white" />
              <circle cx="50%" cy="50%" r="20%" fill="black" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.4)"
            mask={`url(#res-cutout-${num})`}
          />
          <circle
            cx="50%"
            cy="50%"
            r="20%"
            fill="none"
            stroke={isWinner ? '#3FAD5D' : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
        </svg>
        {isWinner && <div className="winner-crown">👑</div>}
      </div>

      <div className="player-result-name">Candidat {num}</div>

      <div className="player-result-score" style={{ color }}>
        {result.score}<span>/100</span>
      </div>

      {/* Mini barre */}
      <div className="score-bar-track">
        <div
          ref={barRef}
          className="score-bar-fill"
          style={{ background: color, width: '0%' }}
        />
      </div>

      <div className="player-result-color">
        <div
          className="player-result-swatch"
          style={{ background: result.hex }}
        />
        <div className="player-result-hex">{result.hex.toUpperCase()}</div>
      </div>
    </div>
  )
}
