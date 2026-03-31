from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app, origins=os.environ.get('FRONTEND_URL', '*'))

DB_PATH = os.environ.get('DB_PATH', '/data/results.db')
TEAM_1  = os.environ.get('TEAM_1_NAME', 'Liste A')
TEAM_2  = os.environ.get('TEAM_2_NAME', 'Liste B')


# ── DB ──────────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS results (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                team       TEXT    NOT NULL,
                score      INTEGER NOT NULL,
                hex        TEXT    NOT NULL,
                valid      INTEGER NOT NULL DEFAULT 1,
                created_at TEXT    NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS config (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        ''')
        conn.execute(
            'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)', ('team_1', TEAM_1)
        )
        conn.execute(
            'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)', ('team_2', TEAM_2)
        )
        conn.commit()


def get_team_names():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT key, value FROM config WHERE key IN ("team_1", "team_2")'
        ).fetchall()
    cfg = {r['key']: r['value'] for r in rows}
    return cfg.get('team_1', TEAM_1), cfg.get('team_2', TEAM_2)


with app.app_context():
    init_db()


# ── Routes ──────────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/teams', methods=['GET'])
def teams():
    t1, t2 = get_team_names()
    return jsonify({'teams': [t1, t2]})


@app.route('/api/teams', methods=['PATCH'])
def update_teams():
    data = request.json or {}
    t1_new = data.get('team_1', '').strip()
    t2_new = data.get('team_2', '').strip()
    if not t1_new or not t2_new:
        return jsonify({'error': 'Missing team names'}), 400

    t1_old, t2_old = get_team_names()
    with get_db() as conn:
        conn.execute('UPDATE config SET value = ? WHERE key = "team_1"', (t1_new,))
        conn.execute('UPDATE config SET value = ? WHERE key = "team_2"', (t2_new,))
        if t1_old != t1_new:
            conn.execute('UPDATE results SET team = ? WHERE team = ?', (t1_new, t1_old))
        if t2_old != t2_new:
            conn.execute('UPDATE results SET team = ? WHERE team = ?', (t2_new, t2_old))
        conn.commit()
    return jsonify({'teams': [t1_new, t2_new]})


@app.route('/api/results', methods=['GET'])
def get_results():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT * FROM results ORDER BY created_at DESC'
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/results', methods=['POST'])
def post_result():
    data = request.json or {}
    if not all(k in data for k in ('name', 'team', 'score', 'hex')):
        return jsonify({'error': 'Missing fields'}), 400

    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cur = conn.execute(
            'INSERT INTO results (name, team, score, hex, valid, created_at) '
            'VALUES (?, ?, ?, ?, 1, ?)',
            (data['name'], data['team'], int(data['score']), data['hex'], now)
        )
        conn.commit()
        row = conn.execute(
            'SELECT * FROM results WHERE id = ?', (cur.lastrowid,)
        ).fetchone()
    return jsonify(dict(row)), 201


@app.route('/api/results/<int:result_id>/toggle', methods=['PATCH'])
def toggle_result(result_id):
    with get_db() as conn:
        row = conn.execute(
            'SELECT valid FROM results WHERE id = ?', (result_id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Not found'}), 404
        new_valid = 0 if row['valid'] else 1
        conn.execute(
            'UPDATE results SET valid = ? WHERE id = ?', (new_valid, result_id)
        )
        conn.commit()
        updated = conn.execute(
            'SELECT * FROM results WHERE id = ?', (result_id,)
        ).fetchone()
    return jsonify(dict(updated))


@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT * FROM results ORDER BY created_at DESC'
        ).fetchall()

    all_results = [dict(r) for r in rows]
    valid_results = [r for r in all_results if r['valid']]

    t1, t2 = get_team_names()
    teams_data = []
    for team_name in [t1, t2]:
        scores = [r['score'] for r in valid_results if r['team'] == team_name]
        teams_data.append({
            'name':    team_name,
            'count':   len(scores),
            'total':   sum(scores),
            'average': round(sum(scores) / len(scores), 1) if scores else 0,
            'best':    max(scores) if scores else 0,
        })

    teams_data.sort(key=lambda t: t['total'], reverse=True)
    return jsonify({'teams': teams_data, 'results': all_results})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
