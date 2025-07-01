const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Allow cross-origin requests and serve frontend files
app.use(cors());
app.use(express.static(path.join(__dirname, 'Public')));

// ✅ Connect to the correct renamed database
const db = new sqlite3.Database('./meester_restructured (1).db');

// 🟢 1. Search for matches by team name
app.get('/teams', (req, res) => {
  const team = req.query.name;
  const sql = `
    SELECT m.*, t1.name AS team_1_name, t2.name AS team_2_name
    FROM matches m
    JOIN teams t1 ON m.team_1_id = t1.team_id
    JOIN teams t2 ON m.team_2_id = t2.team_id
    WHERE t1.name = ? OR t2.name = ?
  `;
  db.all(sql, [team, team], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🟢 2. Search for players by name
app.get('/players', (req, res) => {
  const name = `%${req.query.name}%`;
  db.all(
    `SELECT * FROM players WHERE name LIKE ?`,
    [name],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// 🟢 3. Search for matches by venue
app.get('/venues', (req, res) => {
  const venue = req.query.name;
  const sql = `
    SELECT m.*, t1.name AS team_1_name, t2.name AS team_2_name
    FROM matches m
    JOIN teams t1 ON m.team_1_id = t1.team_id
    JOIN teams t2 ON m.team_2_id = t2.team_id
    WHERE m.venue = ?
  `;
  db.all(sql, [venue], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🟢 4. Get all matches a player participated in
app.get('/player-stats', (req, res) => {
  const name = `%${req.query.name}%`;
  const sql = `
    SELECT p.name, m.date, m.venue, t1.name AS team_1, t2.name AS team_2,
           s.caps_before, s.minutes_played, s.was_substitute
    FROM players p
    JOIN player_match_stats s ON p.player_id = s.player_id
    JOIN matches m ON s.match_id = m.match_id
    JOIN teams t1 ON m.team_1_id = t1.team_id
    JOIN teams t2 ON m.team_2_id = t2.team_id
    WHERE p.name LIKE ?
    ORDER BY m.date DESC
  `;
  db.all(sql, [name], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
