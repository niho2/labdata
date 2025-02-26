const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const port = 3001;

app.use(cors());

const db = new sqlite3.Database('./labdata.db', (err) => {
    if (err) {
        console.error("Fehler beim Verbinden mit der Datenbank:", err.message);
    } else {
        console.log("Verbunden mit labdata.db");
    }
});

const validTables = ['labdata', 'labdata2', 'labdata3'];

// Endpunkt, um den verfügbaren Zeitbereich (min und max Timestamp) zu ermitteln
app.get('/api/:table/timeRange', (req, res) => {
    const { table } = req.params;
    if (!validTables.includes(table)) {
        return res.status(400).json({ error: "Ungültiger Tabellenname" });
    }
    const query = `SELECT MIN("Timestamp") AS minTimestamp, MAX("Timestamp") AS maxTimestamp FROM ${table}`;
    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Endpunkt, um Daten im angegebenen Zeitraum abzufragen
app.get('/api/:table', (req, res) => {
    const { table } = req.params;
    const { start, end } = req.query;
    if (!validTables.includes(table)) {
        return res.status(400).json({ error: "Ungültiger Tabellenname" });
    }
    let query = `SELECT "Timestamp", "Concentration of Active Ingredient", "Pressure", "pH Level" FROM ${table}`;
    const conditions = [];
    const params = [];

    if (start) {
        conditions.push(`"Timestamp" >= ?`);
        params.push(start);
    }
    if (end) {
        conditions.push(`"Timestamp" <= ?`);
        params.push(end);
    }
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
