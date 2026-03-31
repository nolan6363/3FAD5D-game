import { useEffect, useRef } from 'react'
import { scoreMessage, scoreColor } from '../utils/colorUtils'

const TARGET_HEX = '#3FAD5D'

export default function PreviewPage({ result, onNext, nextLabel }) {
  const barRef = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.width = '0%'
    const t = setTimeout(() => {
      barRef.current.style.width = result.score + '%'
    }, 80)
    return () => clearTimeout(t)
  }, [result.score])

  const color = scoreColor(result.score)

  return (
    <div className="preview-page">
      {/* Photo capturée avec cercle indicatif */}
      <div className="preview-photo">
        <img src={result.dataUrl} alt="Photo du verre" />
        <svg className="preview-photo-overlay" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="preview-cutout">
              <rect width="100%" height="100%" fill="white" />
              <circle cx="50%" cy="50%" r="20%" fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)" mask="url(#preview-cutout)" />
          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#3FAD5D" strokeWidth="2" strokeDasharray="6 5" />
        </svg>
      </div>

      {/* Comparaison couleur */}
      <div className="color-comparison">
        <div className="color-card">
          <div className="color-swatch" style={{ background: result.hex }} />
          <div className="color-card-label">Ton verre</div>
          <div className="color-card-hex">{result.hex.toUpperCase()}</div>
        </div>
        <div className="vs-badge">VS</div>
        <div className="color-card">
          <div
            className="color-swatch"
            style={{ background: TARGET_HEX, boxShadow: '0 0 16px rgba(63,173,93,0.5)' }}
          />
          <div className="color-card-label">Cible</div>
          <div className="color-card-hex" style={{ color: TARGET_HEX }}>{TARGET_HEX}</div>
        </div>
      </div>

      {/* Score */}
      <div className="score-section">
        <div className="score-label">
          {result.name
            ? <><strong>{result.name}</strong> · <span style={{ color: '#3FAD5D' }}>{result.team}</span></>
            : 'Score'}
        </div>
        <div className="score-value" style={{ color }}>
          {result.score}<span>/100</span>
        </div>
        <div className="score-bar-track">
          <div
            ref={barRef}
            className="score-bar-fill"
            style={{ background: color, width: '0%' }}
          />
        </div>
        <div className="score-message">{scoreMessage(result.score)}</div>
      </div>

      {/* Action */}
      <div className="preview-actions">
        <button className="btn btn-primary" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
