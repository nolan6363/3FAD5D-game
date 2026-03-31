import { useState, useEffect } from 'react'
import { fetchTeams } from '../api'

const FALLBACK_TEAMS = ['Liste A', 'Liste B']

export default function RegistrationPage({ onStart }) {
  const [teams, setTeams] = useState(FALLBACK_TEAMS)
  const [p1, setP1] = useState({ name: '', team: '' })
  const [p2, setP2] = useState({ name: '', team: '' })

  useEffect(() => {
    fetchTeams()
      .then(data => setTeams(data.teams))
      .catch(() => { /* fallback déjà en place */ })
  }, [])

  const canStart =
    p1.name.trim() && p1.team &&
    p2.name.trim() && p2.team

  return (
    <div className="registration-page">
      <div className="registration-header">
        <h2 className="registration-title">Inscription des candidats</h2>
        <p className="registration-sub">
          Chaque candidat choisit sa liste avant de commencer.
        </p>
      </div>

      <CandidateForm
        num={1}
        teams={teams}
        value={p1}
        onChange={setP1}
      />
      <CandidateForm
        num={2}
        teams={teams}
        value={p2}
        onChange={setP2}
      />

      <div className="registration-actions">
        <button
          className="btn btn-primary"
          disabled={!canStart}
          onClick={() => onStart({ p1, p2 })}
        >
          Lancer le match →
        </button>
      </div>
    </div>
  )
}

function CandidateForm({ num, teams, value, onChange }) {
  return (
    <div className="candidate-form">
      <div className="candidate-form-title">Candidat {num}</div>

      <div className="form-field">
        <label className="form-label">Prénom / Nom</label>
        <input
          className="form-input"
          type="text"
          placeholder="Entrez votre nom…"
          value={value.name}
          onChange={e => onChange(v => ({ ...v, name: e.target.value }))}
          autoCapitalize="words"
        />
      </div>

      <div className="form-field">
        <label className="form-label">Liste BDE</label>
        <div className="team-buttons">
          {teams.map(team => (
            <button
              key={team}
              className={`team-btn${value.team === team ? ' active' : ''}`}
              onClick={() => onChange(v => ({ ...v, team }))}
              type="button"
            >
              {team}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
