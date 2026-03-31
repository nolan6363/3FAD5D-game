export default function HomePage({ onStart }) {
  return (
    <div className="home">
      <div className="home-hero">
        <img src="/logo.png" alt="JEECE" className="home-logo" />
        <div>
          <div className="home-subtitle">Le défi</div>
          <h1 className="home-title">
            <span>#3FAD5D</span>
          </h1>
        </div>
      </div>

      <div className="target-preview">
        <div className="target-swatch" />
        <div className="target-info">
          <div className="target-label">Couleur cible</div>
          <div className="target-hex">#3FAD5D</div>
        </div>
      </div>

      <div className="rules-card">
        <h3>Règles du jeu</h3>
        <div className="rule-item">
          <div className="rule-num">1</div>
          <div className="rule-text">
            Ajuste les quantités de <strong>Jet27</strong> et d'<strong>eau</strong> dans ton verre.
          </div>
        </div>
        <div className="rule-item">
          <div className="rule-num">2</div>
          <div className="rule-text">
            Mélange dans un troisième verre quand tu es satisfait.
          </div>
        </div>
        <div className="rule-item">
          <div className="rule-num">3</div>
          <div className="rule-text">
            Cadre le dessus du verre dans le cercle et prends la photo.
          </div>
        </div>
        <div className="rule-item">
          <div className="rule-num">4</div>
          <div className="rule-text">
            Le plus proche du <strong>#3FAD5D</strong> remporte le match !
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onStart}>
        Commencer le match
      </button>
    </div>
  )
}

