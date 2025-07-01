const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Allow cross-origin requests (for your website to connect)
app.use(cors());
app.use(express.static(path.join(__dirname, 'Public')));
// Connect to your database
const db = new sqlite3.Database('./meester1.db');

// Endpoint: search by team name
app.get('/teams', (req, res) => {
  const team = req.query.name;
  db.all(
    `SELECT * FROM matches WHERE team_1 = ? OR team_2 = ?`,
    [team, team],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Endpoint: search by player
app.get('/players', (req, res) => {
  const name = `%${req.query.name}%`;
  db.all(
    `SELECT * FROM players WHERE player_name LIKE ?`,
    [name],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Endpoint: search by venue
app.get('/venues', (req, res) => {
  const venue = req.query.name;
  db.all(
    `SELECT * FROM matches WHERE venue = ?`,
    [venue],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
