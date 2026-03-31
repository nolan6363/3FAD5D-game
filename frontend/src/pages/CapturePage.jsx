import { useRef, useEffect, useState } from 'react'
import { captureFromVideo } from '../utils/colorUtils'

export default function CapturePage({ playerNum, playerName, onCapture }) {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activeStream = null

    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        activeStream = s
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      } catch (e) {
        setError(
          "Impossible d'accéder à la caméra. Vérifie les permissions de l'application."
        )
      }
    }

    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  function handleCapture() {
    if (!ready || !videoRef.current) return
    const result = captureFromVideo(videoRef.current)
    // Arrête le stream
    if (stream) stream.getTracks().forEach(t => t.stop())
    onCapture(result)
  }

  if (error) {
    return (
      <div className="capture-page">
        <div className="camera-error">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#e05252" strokeWidth="1.5" />
            <path d="M12 8v4m0 4h.01" stroke="#e05252" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>{error}</p>
          <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="capture-page">
      <video
        ref={videoRef}
        className="camera-video"
        autoPlay
        playsInline
        muted
        onCanPlay={() => setReady(true)}
      />

      {/* SVG overlay avec découpe circulaire */}
      <svg className="camera-overlay" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="circle-cutout">
            <rect width="100%" height="100%" fill="white" />
            <circle cx="50%" cy="50%" r="20%" fill="black" />
          </mask>
        </defs>
        {/* Zone sombre hors du cercle */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#circle-cutout)"
        />
        {/* Contour du cercle guide */}
        <circle
          cx="50%"
          cy="50%"
          r="20%"
          fill="none"
          stroke="#3FAD5D"
          strokeWidth="2.5"
          strokeDasharray="8 6"
        />
      </svg>

      <div className="camera-ui">
        <div className="camera-top-bar">
          <div className="camera-player-badge">{playerName ?? `Candidat ${playerNum}`}</div>
        </div>

        <div className="camera-bottom-bar">
          <div className="camera-hint">
            Centre le dessus du verre dans le cercle
          </div>
          <button
            className="capture-btn"
            onClick={handleCapture}
            disabled={!ready}
            aria-label="Prendre la photo"
          >
            <div className="capture-btn-inner" />
          </button>
        </div>
      </div>
    </div>
  )
}
