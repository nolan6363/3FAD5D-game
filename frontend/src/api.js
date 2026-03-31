const BASE = '/api'

export async function fetchTeams() {
  const res = await fetch(`${BASE}/teams`)
  if (!res.ok) throw new Error('Impossible de récupérer les listes')
  return res.json() // { teams: ['Liste A', 'Liste B'] }
}

export async function saveResult(data) {
  // data: { name, team, score, hex }
  const res = await fetch(`${BASE}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Impossible de sauvegarder le résultat')
  return res.json()
}

export async function fetchLeaderboard() {
  const res = await fetch(`${BASE}/leaderboard`)
  if (!res.ok) throw new Error('Impossible de récupérer le classement')
  return res.json() // { teams: [...], results: [...] }
}

export async function toggleResult(id) {
  const res = await fetch(`${BASE}/results/${id}/toggle`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Impossible de modifier la tentative')
  return res.json()
}

export async function updateTeams(team1, team2) {
  const res = await fetch(`${BASE}/teams`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_1: team1, team_2: team2 }),
  })
  if (!res.ok) throw new Error('Impossible de mettre à jour les listes')
  return res.json()
}
