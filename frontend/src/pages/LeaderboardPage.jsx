import { useState, useEffect, useCallback } from 'react'
import { fetchLeaderboard, toggleResult, updateTeams } from '../api'

export default function LeaderboardPage({ onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await fetchLeaderboard()
      setData(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleEditTeams() {
    const pwd = window.prompt('Mot de passe admin :')
    if (pwd === null) return
    if (pwd !== 'JEECE@1986') {
      window.alert('Mot de passe incorrect.')
      return
    }
    const currentNames = data?.teams?.map(t => t.name) ?? ['Liste A', 'Liste B']
    const name1 = window.prompt('Nom de la liste 1 :', currentNames[0])
    if (!name1?.trim()) return
    const name2 = window.prompt('Nom de la liste 2 :', currentNames[1])
    if (!name2?.trim()) return
    try {
      await updateTeams(name1.trim(), name2.trim())
      load()
    } catch {
      window.alert('Erreur lors de la mise à jour.')
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleResult(id)
      setData(prev => ({
        ...prev,
        results: prev.results.map(r => r.id === id ? updated : r),
      }))
      // Recharge les stats d'équipes
      load()
    } catch {
      // silencieux
    }
  }

  return (
    <div className="leaderboard-page">
      {/* Bouton retour */}
      <div className="lb-topbar">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-refresh" onClick={handleEditTeams}>✎ Listes</button>
          <button className="btn-refresh" onClick={load} disabled={loading}>
            {loading ? '…' : '↺'}
          </button>
        </div>
      </div>

      {error && (
        <div className="lb-error">
          Impossible de charger le classement.<br />
          <small>{error}</small>
        </div>
      )}

      {/* Podium des listes */}
      {data && (
        <div className="teams-podium">
          {data.teams.map((team, i) => (
            <TeamCard key={team.name} team={team} rank={i + 1} />
          ))}
        </div>
      )}

      {/* Tableau des résultats */}
      {data && (
        <div className="results-table-wrap">
          <div className="results-table-title">Toutes les tentatives</div>
          {data.results.length === 0 ? (
            <div className="lb-empty">Aucune tentative pour l'instant.</div>
          ) : (
            <div className="results-list">
              {data.results.map(r => (
                <ResultRow key={r.id} result={r} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TeamCard({ team, rank }) {
  const isFirst = rank === 1
  return (
    <div className={`team-card${isFirst ? ' team-card-leader' : ''}`}>
      {isFirst && <div className="team-rank-badge">🏆 1ère</div>}
      {!isFirst && <div className="team-rank-badge second">2ème</div>}
      <div className="team-card-name">{team.name}</div>
      <div className="team-card-total">{team.total} pts</div>
      <div className="team-card-stats">
        <span>{team.count} tentative{team.count !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>moy. {team.average}</span>
        <span>·</span>
        <span>best {team.best}</span>
      </div>
    </div>
  )
}

function ResultRow({ result, onToggle }) {
  const date = new Date(result.created_at)
  const timeStr = date.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`result-row${!result.valid ? ' result-row-invalid' : ''}`}>
      <div className="result-row-color">
        <div className="result-row-swatch" style={{ background: result.hex }} />
      </div>
      <div className="result-row-info">
        <div className="result-row-name">{result.name}</div>
        <div className="result-row-meta">
          <span className="result-row-team">{result.team}</span>
          <span className="result-row-time">{timeStr}</span>
        </div>
      </div>
      <div className="result-row-score">
        {result.score}<span>/100</span>
      </div>
      <button
        className={`result-toggle-btn${!result.valid ? ' invalid' : ''}`}
        onClick={() => onToggle(result.id)}
        title={result.valid ? 'Invalider' : 'Révalider'}
      >
        {result.valid ? '✕' : '↩'}
      </button>
    </div>
  )
}
